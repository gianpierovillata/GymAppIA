# GymAppIA

Sistema de gestión para gimnasios. Maneja información de **clientes**, **entrenadores**, **clases grupales** (salón, spinning, otras actividades), **horarios/turnos** y **planes** ofrecidos a clientes (sin pagos por ahora).

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React (Vite) en `app/` |
| Backend | API mínima en .NET 10 en `api/` |
| Base de datos | MySQL |
| ORM | EF Core |
| Cache | Redis |
| Orquestación | Aspire (etapa posterior) |

## Estructura del repositorio

```
GymAppIA/
├── app/        # Frontend React (Vite)
├── api/        # Backend .NET 10 con arquitectura limpia
└── README.md
```

## Arquitectura del API (Clean Architecture)

```
api/
└── src/
    ├── GymApi.Domain/            # Entidades, enums, reglas de negocio puras (sin dependencias)
    ├── GymApi.Application/       # Casos de uso, DTOs, interfaces de repositorios
    ├── GymApi.Infrastructure/    # EF Core (MySQL), implementación de repositorios, cache Redis
    └── GymApi.Api/               # Controllers, Program.cs, configuración, middleware
```

Regla de dependencias: **Domain ← Application ← Infrastructure ← Api** (las flechas indican hacia dónde apuntan las referencias). El Api y la Infrastructure dependen de Application; Application depende de Domain; Domain no depende de nada.

## Plan de desarrollo por etapas

### Etapa 1 — Base del proyecto ✅
- [x] Estructura de carpetas `app/` y `api/` separadas
- [x] `.gitignore` para cada proyecto
- [x] Esqueleto del API .NET 10 con arquitectura limpia (compila y responde `/api/health`)
- [x] Estructura base de React (Vite) en `app/` con navegación
- [ ] Configurar Docker Compose local para MySQL y Redis (desarrollo)
- [ ] Integración de Aspire (AppHost) para orquestar MySQL, Redis y el API

### Etapa 2 — Modelo de datos y API de clientes
- [x] Definir entidades: `Client`, `Trainer`, `ClassActivity`, `Schedule`, `TrainerShift`, `Plan`, `ClientPlan`
- [x] `DbContext` de EF Core con MySQL y migraciones iniciales (aplicadas en BD)
- [ ] Repositorios e implementación de caché Redis
- [ ] CRUD de clientes (endpoints + validación)

### Etapa 3 — Entrenadores y clases
- [ ] CRUD de entrenadores
- [ ] CRUD de clases grupales (salón, spinning, otras actividades)
- [ ] Asignación entrenador ↔ clase

### Etapa 4 — Horarios / turnos
- [ ] CRUD de horarios (días de la semana, franjas horarias)
- [ ] Turnos de clases y de entrenadores
- [ ] Validación de choques de horario

### Etapa 5 — Planes y asignación a clientes
- [ ] CRUD de planes (nombre, descripción, precio de referencia, duración)
- [ ] Asignación de planes a clientes (`ClientPlan`)
- [ ] Listado de planes de un cliente y estado de vigencia

### Etapa 6 — Frontend: vista general y navegación
- [ ] Layout base con navegación (dashboard, clientes, entrenadores, clases, horarios, planes)
- [ ] Conexión del frontend con el API (cliente HTTP / React Query)
- [ ] Páginas CRUD de cada módulo

### Etapa 7 — Mejoras y despliegue
- [ ] Autenticación/usuarios (etapa futura)
- [ ] Módulo de pagos (etapa futura)
- [ ] Despliegue con Aspire (Docker Compose, contenedores, health checks)

## Cómo ejecutar

### API
```bash
cd api
dotnet restore
dotnet build
dotnet run --project src/GymApi.Api
```

### Frontend
```bash
cd app
npm install
npm run dev
```

> Nota: requiere Node.js (v20+) instalado en el sistema.
