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
└── GymAppIA.sln
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
| GET | `/api/clients` | Listar clientes |
| GET | `/api/clients/{id}` | Obtener por id |
| POST | `/api/clients` | Crear |
| PUT | `/api/clients/{id}` | Actualizar |
| DELETE | `/api/clients/{id}` | Soft-delete |

### Entrenadores
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/trainers` | Listar entrenadores |
| GET | `/api/trainers/{id}` | Obtener por id |
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

> ⚠️ La ruta de ruta del controller es `api/TrainerShifts` (el enrutado es insensible a mayúsculas: `/api/trainershifts` también funciona). En el README se muestra en formato kebab para lectura.

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
| `trainers:all` · `trainers:{id}` | Entrenadores |
| `classes:all` · `classes:{id}` | Clases |
| `schedules:all` · `schedules:{id}` | Horarios |
| `trainershifts:all` · `trainershifts:{id}` | Turnos |

- ⏳ TTL de 5 minutos (lecturas); se invalidan al escribir (POST/PUT/DELETE).

## 🧩 Entidades y enums

### Entidades
- `Client` — cliente del gimnasio (nombre, email, teléfono)
- `Trainer` — entrenador (nombre, email, teléfono, especialidad)
- `ClassActivity` — clase grupal (nombre, categoría, capacidad)
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

## 📦 Paquetes clave

| Paquete | Propósito |
|---------|-----------|
| `Pomelo.EntityFrameworkCore.MySql` 9.0.0 | Provider EF Core para MySQL |
| `Microsoft.EntityFrameworkCore.Design` 9.0.0 | Migraciones |
| `FluentValidation` 12.x | Validación de DTOs |
| `Microsoft.Extensions.Caching.StackExchangeRedis` | Cache Redis |
| `Scalar.AspNetCore` 2.x | UI interactiva sobre OpenAPI |
