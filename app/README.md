# 🖥️ GymApp Frontend — React + Vite

> 📚 Índice: [🏋️ GymAppIA (README principal)](../README.md) · [⚙️ API (api/README.md)](../api/README.md)

Frontend de gestión de gimnasios. Consume la API de .NET (`api/`).

## 📁 Estructura del proyecto

```
app/
├── index.html
├── vite.config.js          # Configuración de Vite + proxy de /api
├── package.json
├── .env.example            # Variables de entorno de ejemplo
└── src/
    ├── main.jsx            # Punto de entrada + router
    ├── App.jsx             # Definición de rutas
    ├── index.css           # Estilos globales (tema moderno)
    ├── api/
    │   └── client.js       # Cliente HTTP (fetch) hacia la API
    ├── components/
    │   ├── Layout.jsx              # Layout con sidebar responsive
    │   ├── ClientDetailModal.jsx   # Ficha de cliente (entrenador personal + mediciones)
    │   ├── TrainerDetailModal.jsx  # Ficha de entrenador (clientes asignados + turnos)
    │   ├── SearchSelect.jsx        # Combobox con búsqueda (filtra al escribir, teclado, limpiar)
    │   └── PlaceholderPage.jsx     # Componente de página en construcción
    └── pages/
        ├── Dashboard.jsx   # Vista principal con estadísticas
        ├── Clients.jsx     # CRUD de clientes
        ├── Trainers.jsx    # CRUD de entrenadores
        ├── Classes.jsx     # CRUD de clases grupales
        ├── Schedules.jsx   # CRUD de horarios/asignaciones
        ├── TrainerShifts.jsx # CRUD de turnos de trabajo
        └── Plans.jsx       # Catálogo de planes + asignaciones a clientes
```

## 🧭 Rutas

| Ruta | Página | Estado |
|------|--------|--------|
| `/` | Dashboard | ✅ |
| `/clientes` | Clientes | ✅ CRUD + ficha |
| `/entrenadores` | Entrenadores | ✅ CRUD + ficha |
| `/clases` | Clases | ✅ CRUD |
| `/horarios` | Horarios | ✅ CRUD |
| `/turnos` | Turnos de trabajo | ✅ CRUD |
| `/planes` | Planes | ✅ Catálogo + asignaciones |

## 🔌 Cliente HTTP

`src/api/client.js` expone:

- `apiGet(path)` — GET a la API
- `apiPost(path, body)` — POST con JSON
- `apiPut(path, body)` — PUT con JSON
- `apiDelete(path)` — DELETE

> ⚠️ **Convención**: los `path` no deben incluir el prefijo `/api` (la base ya lo agrega por defecto). Ej.: `apiGet('/clients')` → `/api/clients`. Un path como `/api/clients` generaría `/api/api/clients` y fallaría con 404.

La URL base se define con `VITE_API_URL` (por defecto `/api`, que el proxy de Vite redirige a la API).

## ⚙️ Configuración

`.env` (copiar desde `.env.example`):

```bash
VITE_API_URL=/api
```

`vite.config.js` — proxy de desarrollo:

```js
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:5099',
      changeOrigin: true,
    },
  },
}
```

## 🚀 Cómo ejecutar

```bash
cd app
npm install
npm run dev
```

- 🌐 Dev server: `http://localhost:5173`
- 🏗️ Build de producción: `npm run build` (salida en `dist/`)
- 👀 Vista previa del build: `npm run preview`

> ⚠️ Si el puerto 5173 está ocupado, Vite usa automáticamente el siguiente disponible (p. ej. 5174).

## 🚀 Despliegue (Vercel, monorepo)

Al importar el repo en Vercel:

- **Root Directory**: `app`
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`

O con `vercel.json` en la raíz del repo:

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rootDirectory": "app"
}
```

Definir la variable de entorno **antes del build** (el dev server usa el proxy `/api`, pero en Vercel no hay proxy):

```
VITE_API_URL = https://tu-app.monsterasp.net
```

> ⚠️ En producción la API debe tener habilitado **CORS** para `https://*.vercel.app`. Detalles en el [`README.md`](../README.md) central.

## 📦 Dependencias

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `react` / `react-dom` | ^19 | UI |
| `react-router-dom` | ^7 | Rutas y navegación |
| `vite` | ^7 | Dev server y build |
| `@vitejs/plugin-react` | ^5 | Soporte JSX para Vite |

## 📦 Funcionalidades ya cubiertas

- 🗂️ **CRUD de Clientes** (`/clientes`): búsqueda, crear/editar, eliminar (soft-delete), toasts y confirmación.
- 🧑‍🏫 **Ficha de cliente** (botón 👁): asignación de entrenador personal con **filtro por especialidad** y **buscador de entrenadores**, más CRUD de **mediciones corporales** (peso, altura, IMC, % grasa, masa muscular, cintura).
- 🏋️ **CRUD de Entrenadores** (`/entrenadores`): perfil, especialidad (con sugerencias) y eliminación.
- 👥 **Ficha de entrenador** (botón 👁): clientes asignados y turnos de trabajo.
- 🏟️ **CRUD de Clases** (`/clases`): categoría (salón/spinning/otras), duración y capacidad.
- 📅 **CRUD de Horarios** (`/horarios`): clase ↔ entrenador, día, franja y salón; **filtros con buscador** por clase/entrenador, filtros por día/salón y **vista semanal** (grilla por día y hora, filtro por salón, clic en celda vacía para crear y clic en el evento para editar).
- ⏰ **CRUD de Turnos de trabajo** (`/turnos`): franjas de disponibilidad de cada entrenador; **filtros con buscador** por entrenador y por día. Solo se listan los turnos activos (los eliminados quedan ocultos).
- 💳 **Planes** (`/planes`): pestaña **Catálogo** (CRUD de planes con precio y duración) y pestaña **Asignaciones** (vincular plan ↔ cliente, fechas de vigencia, estado activo/expirado/cancelado y filtros por cliente/estado). Cliente y plan se eligen con un **buscador con sugerencias** (filtra al escribir, ignora acentos y permite navegar con el teclado), pensado para carteras grandes.
- 📊 **Dashboard**: estadísticas reales y "Clases de hoy".
- ⚠️ Los errores de validación del API (por ejemplo choques de horario) se muestran como toast o banner.

## 🔜 Pendiente por implementar

- 🔐 Autenticación/usuarios.
- 💰 Módulo de pagos.
