# ⚙️ GymApi — Backend .NET 10

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
- **Migraciones**: carpeta `GymApi.Infrastructure/Migrations`. Para crear una nueva:

```bash
cd api/src/GymApi.Api
dotnet ef migrations add NombreMigracion
dotnet ef database update
```

> El proyecto usa `Microsoft.EntityFrameworkCore.Design` fijado en **9.0.0** (compatibilidad con Pomelo 9). `dotnet-ef` global instalado.

- **Aplicar en BD nueva** (crea la BD `gymdb` automáticamente):
  ```bash
  dotnet ef database update
  ```
- **Datos de prueba**: el dump `backups/gymdb.sql` (raíz del repo) incluye datos ficticios (clientes, entrenadores, clases, horarios y turnos). Para restaurar:
  ```bash
  mysql -h localhost -P 3306 -u root < backups/gymdb.sql
  ```

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

- 💳 **Planes y `ClientPlan`**: las entidades ya existen en el modelo y la BD, pero falta servicio de aplicación, endpoints y frontend.
- 🗓️ **Vista semanal de horarios** (agregación del lado del API).
- 🔐 Autenticación/usuarios.
- 💰 Módulo de pagos.
- 🚀 Orquestación con Aspire / Docker Compose.

## 📦 Paquetes clave

| Paquete | Propósito |
|---------|-----------|
| `Pomelo.EntityFrameworkCore.MySql` 9.0.0 | Provider EF Core para MySQL |
| `Microsoft.EntityFrameworkCore.Design` 9.0.0 | Migraciones |
| `FluentValidation` 12.x | Validación de DTOs |
| `Microsoft.Extensions.Caching.StackExchangeRedis` | Cache Redis |
| `Scalar.AspNetCore` 2.x | UI interactiva sobre OpenAPI |
