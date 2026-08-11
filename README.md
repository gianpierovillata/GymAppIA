# 🏋️ GymAppIA

Sistema de gestión para gimnasios. Maneja información de **clientes** (con entrenador personal y datos corporales), **entrenadores** (con turnos de trabajo), **clases grupales** (salón, spinning, otras actividades), **horarios/asignaciones** y **turnos**. Los **planes** ofrecidos a clientes quedan como etapa futura (sin pagos por ahora).

## 🧰 Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| 🖥️ Frontend | React (Vite) en `app/` |
| ⚙️ Backend | API en .NET 10 en `api/` (arquitectura limpia) |
| 🗄️ Base de datos | MySQL |
| 🧩 ORM | EF Core (Pomelo) |
| ⚡ Cache | Redis |
| 🚀 Orquestación | Aspire (etapa posterior) |

## 📂 Estructura del repositorio

```
GymAppIA/
├── app/      → Frontend React (Vite)  — ver app/README.md
├── api/      → Backend .NET 10        — ver api/README.md
├── backups/  → Dump SQL de la BD con datos de ejemplo (`gymdb.sql`)
└── README.md
```

## 🧱 Arquitectura del API (Clean Architecture)

```
api/
└── src/
    ├── GymApi.Domain/            # 🧠 Entidades, enums, reglas de negocio puras (sin dependencias)
    ├── GymApi.Application/       # 📋 Casos de uso, DTOs, interfaces de repositorios
    ├── GymApi.Infrastructure/    # 🗄️ EF Core (MySQL), repositorios, cache Redis
    └── GymApi.Api/               # 🌐 Controllers, Program.cs, configuración, middleware
```

Regla de dependencias: **Domain ← Application ← Infrastructure ← Api** (las flechas indican hacia dónde apuntan las referencias). El Api y la Infrastructure dependen de Application; Application depende de Domain; Domain no depende de nada.

## 🗺️ Plan de desarrollo por etapas

### ✅ Etapa 1 — Base del proyecto
- [x] Estructura de carpetas `app/` y `api/` separadas
- [x] `.gitignore` para cada proyecto
- [x] Esqueleto del API .NET 10 con arquitectura limpia (compila y responde `/api/health`)
- [x] Estructura base de React (Vite) en `app/` con navegación
- [ ] Configurar Docker Compose local para MySQL y Redis (desarrollo)
- [ ] Integración de Aspire (AppHost) para orquestar MySQL, Redis y el API

### ✅ Etapa 2 — Modelo de datos y API de clientes
- [x] Entidades: `Client`, `ClientMeasurement`, `Trainer`, `ClassActivity`, `Schedule`, `TrainerShift`, `Plan`, `ClientPlan`
- [x] `DbContext` de EF Core con MySQL y migraciones aplicadas en BD `gymdb`
- [x] Repositorios genéricos, `IUnitOfWork` y caché Redis (`ICacheService`)
- [x] CRUD de clientes (endpoints + validación con FluentValidation + caché)
  - `GET /api/clients` · `GET /api/clients/{id}` · `POST` · `PUT` · `DELETE` (soft-delete)

### ✅ Etapa 3 — Entrenadores, clases y fichas
- [x] CRUD de entrenadores (`/api/trainers`) y clases grupales (`/api/classes`)
- [x] Asignación entrenador ↔ clase mediante horarios (`/api/schedules`, incluye nombres en la respuesta)
- [x] 🧑‍🏫 Entrenador personal del cliente: `PUT /api/clients/{id}/personal-trainer`
- [x] 📏 Mediciones corporales del cliente: CRUD `/api/clients/{clientId}/measurements` (peso, altura, IMC, % grasa, masa muscular, cintura, notas)
- [x] 👥 Clientes asignados a un entrenador: `GET /api/trainers/{id}/clients`
- [x] Enums serializados como texto (`Studio`, `Spinning`, `Other`, `Monday`...) y validación con FluentValidation

### ✅ Etapa 4 — Horarios / turnos
- [x] CRUD de turnos de entrenadores (`/api/trainershifts`)
- [x] Validación de choques de horario:
  - Turno vs turno del mismo entrenador (mismo día y franja solapada) → `400`
  - Turno vs clase asignada (entrenador ocupado) → `400`
  - Clase vs clase / clase vs turno (entrenador doblemente ocupado) → `400`

### ✅ Etapa 5 — Frontend completo
- [x] Layout responsive con navegación (dashboard, clientes, entrenadores, clases, horarios, turnos, planes)
- [x] Dashboard conectado al API (estadísticas y clases del día)
- [x] CRUD de Clientes + ficha con entrenador personal (filtro por especialidad) y mediciones corporales
- [x] CRUD de Entrenadores + ficha con clientes asignados y turnos de trabajo
- [x] CRUD de Clases grupales (por categoría: salón, spinning, otras)
- [x] CRUD de Horarios (clase ↔ entrenador, día, franja y salón)
- [x] CRUD de Turnos de trabajo de los entrenadores
- [ ] Vista semanal de horarios (grilla por día/salón)

### 🔜 Etapa 6 — Planes y asignación a clientes
- [ ] CRUD de planes (nombre, descripción, precio de referencia, duración)
- [ ] Asignación de planes a clientes (`ClientPlan`)
- [ ] Listado de planes de un cliente y estado de vigencia

> ℹ️ Las entidades `Plan` y `ClientPlan` ya existen en el modelo y en la BD; falta el servicio de aplicación, endpoints y frontend.

### 🔜 Etapa 7 — Mejoras y despliegue
- [ ] Autenticación/usuarios (etapa futura)
- [ ] Módulo de pagos (etapa futura)
- [ ] Despliegue con Aspire (Docker Compose, contenedores, health checks)

## 🚀 Cómo ejecutar

### API
```bash
cd api
dotnet restore
dotnet build
dotnet run --project src/GymApi.Api --urls http://localhost:5099
```

- ✅ Health check: `http://localhost:5099/api/health`
- 📖 Documentación interactiva (Scalar): `http://localhost:5099/scalar/`
- 📜 Spec OpenAPI: `http://localhost:5099/openapi/v1.json`

> Detalles completos de endpoints y configuración en [`api/README.md`](api/README.md).

### Frontend
```bash
cd app
npm install
npm run dev
```

- 🌐 Dev server: `http://localhost:5173` (proxy de `/api` → `http://localhost:5099`)

> Detalles en [`app/README.md`](app/README.md).

## 🚀 Despliegue (producción)

El monorepo se despliega en dos servicios distintos: la **API (.NET 10)** en **MonsterASP.NET** (hosting Windows con MySQL) y el **frontend (React/Vite)** en **Vercel**, conectados a un **Redis gratis en la nube**.

### ⚙️ API → MonsterASP.NET (monsterasp.net)

1. Crear cuenta en [monsterasp.net](https://www.monsterasp.net/) (plan Free alcanza: 1 sitio + BD MySQL) y crear la **BD MySQL** en el panel (anotar host, puerto, usuario y password).
2. Publicar el API:
   ```bash
   cd api
   dotnet publish src/GymApi.Api -c Release -o publish
   ```
   Se genera `publish/` con el `web.config` para IIS (InProcess), soportado por MonsterASP (tienen .NET 10).
3. Subir el contenido de `publish/` por **FTP/SFTP** a la carpeta web del sitio.
4. Configurar las conexiones con **variables de entorno** del panel (o un `appsettings.Production.json`):
   ```
   ConnectionStrings__MySql = Server=TU_HOST;Port=3306;Database=gymdb;User=TU_USER;Password=TU_PASS;
   ConnectionStrings__Redis = rediss://default:TU_TOKEN@TU_DB.upstash.io:6379
   ```
5. Aplicar migraciones a la BD remota:
   - Si el host MySQL permite conexión remota: `dotnet ef database update --connection "..."` desde la máquina local (`--project src/GymApi.Infrastructure --startup-project src/GymApi.Api`).
   - Si no: generar el script y ejecutarlo en su herramienta SQL: `dotnet ef migrations script -o up.sql`.

### ⚡ Redis gratis en la nube

La API usa Redis para caché. Opciones con tier gratis (no "trial"):

- **Upstash** (recomendado): 256 MB, Redis-compatible, TLS (`rediss://`), ideal para conectar por variable de entorno.
- **Redis Cloud** (Redis Ltd): 30 MB gratis.

### ⚛️ Frontend → Vercel (monorepo)

Al importar el repo en Vercel:

- **Root Directory**: `app`
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build` (usa el `package.json` de `app/`)

O con un `vercel.json` en la raíz del repo:

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rootDirectory": "app"
}
```

Definir la variable de entorno en Vercel (se "quema" en el bundle al compilar, por eso el API debe estar publicada antes del build):

```
VITE_API_URL = https://tu-app.monsterasp.net
```

### ⚠️ Pendientes de código para producción

- **CORS**: `Program.cs` no configura CORS; el frontend en Vercel es cross-origin y el navegador bloqueará las llamadas. Falta agregar una política CORS que permita el dominio de Vercel (`https://*.vercel.app`).
- **Redis opcional**: hoy la API falla si Redis no está disponible. Se sugiere un fallback de caché en memoria configurable por `appsettings`.

## 🗄️ Backup y datos de prueba

- `backups/gymdb.sql` → dump de la BD `gymdb` con datos ficticios de ejemplo (5 clientes, 4 entrenadores, 5 clases, 7 horarios, 9 turnos y 1 medición) y las migraciones aplicadas.
- **Backup con fecha y hora** (genera `backups/gymdb_YYYYMMDD_HHMM.sql`):
  ```powershell
  $stamp = Get-Date -Format "yyyyMMdd_HHmm"
  & "C:\laragon\bin\mysql\mysql-8.4.3-winx64\bin\mysqldump.exe" -h localhost -P 3306 -u root --databases gymdb --routines --triggers --result-file="backups\gymdb_$stamp.sql"
  ```
- **Restaurar** (crea la BD y carga todo):
  ```bash
  mysql -h localhost -P 3306 -u root < backups/gymdb.sql
  ```
- **Regenerar el backup base** (con la BD corriendo):
  ```bash
  mysqldump -h localhost -P 3306 -u root --databases gymdb --routines --triggers --result-file=backups/gymdb.sql
  ```

> 💡 El dump incluye los registros soft-deleted (`IsActive = 0`); el Dashboard los filtra por `isActive`.

## 🔌 Requisitos previos

| Herramienta | Versión |
|-------------|---------|
| .NET SDK | 10.0+ |
| Node.js | 20+ |
| MySQL | 8.x (BD `gymdb`, usuario `root`) |
| Redis | 7.x |
