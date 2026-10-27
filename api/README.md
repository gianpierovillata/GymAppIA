# ⚙️ GymApi — Backend .NET 10

> 📚 Índice: [🏋️ GymAppIA (README principal)](../README.md) · [🖥️ Frontend (app/README.md)](../app/README.md)

API de gestión de gimnasios con **arquitectura limpia**, **EF Core + MySQL**, caché **Redis** y validación con **FluentValidation**.

## 📁 Estructura del proyecto

```
api/
├── src/
│   ├── GymApi.Domain/            # 🧠 Entidades, enums (sin dependencias)
│   ├── GymApi.Application/       # 📋 Servicios de aplicación, DTOs, validadores, interfaces
│   ├── GymApi.Infrastructure/    # 🗄️ EF Core, repositorios, cache Redis, UnitOfWork
│   └── GymApi.Api/               # 🌐 Controllers, Program.cs, middleware
└── GymApi.slnx
```

## 🏗️ Arquitectura

- **Domain ← Application ← Infrastructure ← Api** (dependencias apuntan hacia abajo).
- Los servicios de aplicación (`*Service`) orquestan repositorios genéricos + `IUnitOfWork` + caché.
- **Soft-delete**: `DELETE` no borra filas, marca `IsActive = false`.
- **Enums** serializados como texto (`JsonStringEnumConverter`).
- Errores normalizados por `ExceptionHandlingMiddleware`:
  - `400` → errores de validación (`{ "errors": [...] }`)
  - `404` → recurso no encontrado (`{ "message": "..." }`)
  - `500` → error interno genérico (loggeado)

## 🌐 Endpoints

### Health
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/health` | ✅ Estado del servicio |

### Clientes
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/clients` | Listar clientes (incluye `trainerId` y `trainerName`) |
| GET | `/api/clients/{id}` | Obtener por id |
| POST | `/api/clients` | Crear |
| PUT | `/api/clients/{id}` | Actualizar |
| PUT | `/api/clients/{id}/personal-trainer` | Asignar/quitar entrenador personal (`trainerId` nullable) |
| DELETE | `/api/clients/{id}` | Soft-delete |

### Mediciones corporales de un cliente
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/clients/{clientId}/measurements` | Listar mediciones del cliente |
| POST | `/api/clients/{clientId}/measurements` | Registrar medición (peso, altura, IMC, % grasa, masa muscular, cintura, notas) |
| PUT | `/api/clients/{clientId}/measurements/{id}` | Actualizar medición |
| DELETE | `/api/clients/{clientId}/measurements/{id}` | Eliminar medición |

> El IMC se calcula en el backend a partir de peso y altura (`peso / altura²`).

### Entrenadores
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/trainers` | Listar entrenadores |
| GET | `/api/trainers/{id}` | Obtener por id |
| GET | `/api/trainers/{id}/clients` | Clientes activos asignados a un entrenador |
| POST | `/api/trainers` | Crear |
| PUT | `/api/trainers/{id}` | Actualizar |
| DELETE | `/api/trainers/{id}` | Soft-delete |

### Clases grupales
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/classes` | Listar clases |
| GET | `/api/classes/{id}` | Obtener por id |
| POST | `/api/classes` | Crear |
| PUT | `/api/classes/{id}` | Actualizar |
| DELETE | `/api/classes/{id}` | Soft-delete |

### Horarios (asignación clase ↔ entrenador)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/schedules` | Listar horarios (incluye `classActivityName` y `trainerName`) |
| GET | `/api/schedules/{id}` | Obtener por id |
| POST | `/api/schedules` | Crear (valida choques de horario del entrenador) |
| PUT | `/api/schedules/{id}` | Actualizar (valida choques) |
| DELETE | `/api/schedules/{id}` | Soft-delete |

### Turnos de entrenador
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/trainer-shifts` | Listar turnos (incluye `trainerName`) |
| GET | `/api/trainer-shifts/{id}` | Obtener por id |
| POST | `/api/trainer-shifts` | Crear (valida choques con turnos y clases) |
| PUT | `/api/trainer-shifts/{id}` | Actualizar (valida choques) |
| DELETE | `/api/trainer-shifts/{id}` | Soft-delete |

> ⚠️ La ruta del controller es `api/TrainerShifts`. El enrutado es insensible a mayúsculas, por lo que la ruta efectiva es **`/api/trainershifts`** (sin guiones; `/api/trainer-shifts` NO existe). En este README se muestra en formato kebab solo para lectura.

### Planes
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/plans` | Listar planes (incluye inactivos) |
| GET | `/api/plans/{id}` | Obtener por id |
| POST | `/api/plans` | Crear (nombre único, precio ≥ 0, duración 1–3650 días) |
| PUT | `/api/plans/{id}` | Actualizar |
| DELETE | `/api/plans/{id}` | Soft-delete (bloqueado si tiene asignaciones activas) |
| GET | `/api/plans/assignments` | Listar todas las asignaciones activas (cliente + plan + estado) |

### Planes de un cliente
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/clients/{clientId}/plans` | Listar planes activos asignados al cliente |
| POST | `/api/clients/{clientId}/plans` | Asignar plan (`planId`, `startDate`, `endDate` opcional) |
| PUT | `/api/clients/{clientId}/plans/{id}` | Actualizar plan, fechas y estado (`Active` / `Cancelled`) |
| DELETE | `/api/clients/{clientId}/plans/{id}` | Soft-delete de la asignación |

> 📅 Si no se envía `endDate`, se calcula como `startDate + plan.DurationDays`.
> 🔄 El estado `Expired` **no se guarda**: se deriva al leer (`endDate < hoy`). Solo se puede escribir `Active` o `Cancelled`.
> 🚫 Un plan con asignaciones activas no se puede eliminar (responde `400`); primero hay que cancelar/eliminar esas asignaciones.
> ⚠️ El nombre del plan es único (comparación sin distinguir mayúsculas) y solo se puede asignar a clientes y planes activos.

## 🚦 Reglas de negocio (choques de horario)

Un entrenador **no puede estar doblemente ocupado**. Al crear/actualizar un `Schedule` o un `TrainerShift` se valida:

- ⏰ **Turno vs turno**: mismo entrenador, mismo día y franjas solapadas → `400`.
- 🎓 **Turno vs clase**: el entrenador tiene una clase asignada en esa franja → `400`.
- 📅 **Clase vs clase**: el entrenador ya tiene otra clase en esa franja → `400`.

La superposición se determina con `StartTime < otroEnd && otroStart < End`.

## 🧊 Caché Redis

| Clave | Contenido |
|-------|-----------|
| `clients:all` · `clients:{id}` | Clientes |
| `clients:{id}:measurements` | Mediciones del cliente |
| `trainers:all` · `trainers:{id}` | Entrenadores |
| `classes:all` · `classes:{id}` | Clases |
| `schedules:all` · `schedules:{id}` | Horarios |
| `trainershifts:all` · `trainershifts:{id}` | Turnos |
| `plans:all` · `plans:{id}` | Planes |
| `clientplans:all` | Todas las asignaciones |
| `clients:{clientId}:plans` | Planes asignados a un cliente |

- ⏳ TTL de 5 minutos (lecturas); se invalidan al escribir (POST/PUT/DELETE).

## 🧩 Entidades y enums

### Entidades
- `Client` — cliente del gimnasio (nombre, email, teléfono, entrenador personal opcional)
- `ClientMeasurement` — medición corporal de un cliente (peso, altura, % grasa, masa muscular, cintura, notas)
- `Trainer` — entrenador (nombre, email, teléfono, especialidad)
- `ClassActivity` — clase grupal (nombre, categoría, duración, capacidad)
- `Schedule` — asignación de una clase a un entrenador en un día y franja (con salón)
- `TrainerShift` — turno disponible de un entrenador (día + franja)
- `Plan` — plan de membresía (nombre, descripción, precio de referencia, duración)
- `ClientPlan` — asignación de un plan a un cliente

### Enums
- `WeekDay` — `Monday`, `Tuesday`, `Wednesday`, `Thursday`, `Friday`, `Saturday`, `Sunday`
- `ClassCategory` — `Studio`, `Spinning`, `Other`
- `PlanStatus` — `Active`, `Expired`, `Cancelled`

## 🗄️ Base de datos

- **Motor**: MySQL (`gymdb`), conexión en `appsettings.json` → `ConnectionStrings:MySql`.
- **Migraciones**: carpeta `GymApi.Infrastructure/Migrations`. Aplicadas hasta el momento:
  - `20260807165232_InitialCreate`
  - `20260811134650_AddPersonalTrainerAndMeasurements`

> ⚠️ Los comandos `dotnet ef` se ejecutan desde la raíz `api/` (NO dentro de `src/GymApi.Api`) y siempre con `--project src/GymApi.Infrastructure --startup-project src/GymApi.Api`. `dotnet ef` compila el proyecto, por lo que hay que **detener el API antes** de usarlo (los DLLs quedan bloqueados por el proceso en ejecución).

### 🧰 Prerrequisito: instalar `dotnet-ef` (tool global)

En una máquina nueva (o tras reinstalar):

```bash
dotnet tool install --global dotnet-ef
```

### 📦 Reinstalar / iniciar desde cero

Con MySQL corriendo y la BD `gymdb` creada o vacía:

```bash
cd api
dotnet restore
dotnet build
dotnet ef database update --project src/GymApi.Infrastructure --startup-project src/GymApi.Api
```

`dotnet ef database update` **crea la BD `gymdb` automáticamente** y aplica todas las migraciones pendientes (tablas + índices).

### ➕ Crear una migración nueva

```bash
cd api
dotnet ef migrations add NombreMigracion --project src/GymApi.Infrastructure --startup-project src/GymApi.Api
dotnet ef database update --project src/GymApi.Infrastructure --startup-project src/GymApi.Api
```

> ⚠️ Detener el API en ejecución antes de crear/aplicar migraciones (bloquea los binarios):
> ```powershell
> Get-CimInstance Win32_Process -Filter "Name='dotnet.exe'" |
>   Where-Object { $_.CommandLine -match 'GymApi.Api' } |
>   ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
> ```

### 🔎 Ver estado de las migraciones

```bash
cd api
dotnet ef migrations list --project src/GymApi.Infrastructure --startup-project src/GymApi.Api
```

### 🧪 Datos de prueba

El dump `backups/gymdb.sql` (raíz del repo) incluye datos ficticios (clientes, entrenadores, clases, horarios y turnos). Restaurarlo **después** de aplicar migraciones (o directamente: el dump también contiene las migraciones aplicadas):

```bash
mysql -h localhost -P 3306 -u root < backups/gymdb.sql
```

> 💡 Ante una reinstalación completa: aplicar migraciones (paso "Reinstalar desde cero") **o** restaurar el dump son caminos válidos. El dump es útil cuando querés conservar los datos de ejemplo; las migraciones, cuando arrancás con BD vacía.

## ⚙️ Configuración

`api/src/GymApi.Api/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "MySql": "Server=localhost;Port=3306;Database=gymdb;User=root;Password=;",
    "Redis": "localhost:6379"
  }
}
```

## 🚀 Cómo ejecutar

```bash
cd api
dotnet restore
dotnet build
dotnet run --project src/GymApi.Api --urls http://localhost:5099
```

- ✅ Health: `http://localhost:5099/api/health`
- 📖 Scalar (UI interactiva): `http://localhost:5099/scalar/`
- 📜 Spec OpenAPI: `http://localhost:5099/openapi/v1.json`

> 💡 Si el puerto 5099 ya está ocupado por una instancia anterior, detener el proceso antes de recompilar:
> ```powershell
> Get-CimInstance Win32_Process -Filter "Name='dotnet.exe'" |
>   Where-Object { $_.CommandLine -match 'GymApi.Api' } |
>   ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
> ```

## 🔜 Pendiente por implementar

- 🔐 Autenticación/usuarios.
- 💰 Módulo de pagos.
- 🚀 Orquestación con Aspire / Docker Compose.

> ℹ️ La vista semanal de horarios se resuelve en el frontend reutilizando `GET /api/schedules` (no requiere un endpoint de agregación).

## 🚀 Despliegue (MonsterASP.NET)

Hosting Windows/IIS que soporta .NET 10 y MySQL (plan Free disponible). Resumen:

1. `dotnet publish src/GymApi.Api -c Release -o publish` → genera `publish/` con el `web.config` (InProcess).
2. Subir `publish/` por FTP/SFTP a la carpeta web del sitio.
3. Configurar en el panel (variables de entorno o `appsettings.Production.json`):
   ```
   ConnectionStrings__MySql = Server=TU_HOST;Port=3306;Database=gymdb;User=TU_USER;Password=TU_PASS;
   ConnectionStrings__Redis = rediss://default:TU_TOKEN@TU_DB.upstash.io:6379
   ```
4. Aplicar migraciones a la BD remota (conexión remota o `dotnet ef migrations script -o up.sql`).

> ⚠️ Pendientes para producción: CORS (para el frontend en Vercel) y fallback de caché en memoria si Redis no está disponible. Más detalles en el [`README.md`](../README.md) central.

## 📦 Paquetes clave

| Paquete | Propósito |
|---------|-----------|
| `Pomelo.EntityFrameworkCore.MySql` 9.0.0 | Provider EF Core para MySQL |
| `Microsoft.EntityFrameworkCore.Design` 9.0.0 | Migraciones |
| `FluentValidation` 12.x | Validación de DTOs |
| `Microsoft.Extensions.Caching.StackExchangeRedis` | Cache Redis |
| `Scalar.AspNetCore` 2.x | UI interactiva sobre OpenAPI |
