# 🖥️ GymApp Frontend — React + Vite

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
    │   ├── Layout.jsx          # Layout con sidebar responsive
    │   └── PlaceholderPage.jsx # Componente de página en construcción
    └── pages/
        ├── Dashboard.jsx   # Vista principal con estadísticas
        ├── Clients.jsx     # Clientes
        ├── Trainers.jsx    # Entrenadores
        ├── Classes.jsx     # Clases grupales
        ├── Schedules.jsx   # Horarios/asignaciones
        └── Plans.jsx       # Planes (placeholder)
```

## 🧭 Rutas

| Ruta | Página |
|------|--------|
| `/` | Dashboard |
| `/clientes` | Clientes |
| `/entrenadores` | Entrenadores |
| `/clases` | Clases |
| `/horarios` | Horarios |
| `/planes` | Planes |

## 🔌 Cliente HTTP

`src/api/client.js` expone:

- `apiGet(path)` — GET a la API
- `apiPost(path, body)` — POST con JSON

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

## 📦 Dependencias

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `react` / `react-dom` | ^19 | UI |
| `react-router-dom` | ^7 | Rutas y navegación |
| `vite` | ^7 | Dev server y build |
| `@vitejs/plugin-react` | ^5 | Soporte JSX para Vite |

## 🔜 Estado actual

- ✅ Layout con navegación responsive (sidebar hamburguesa en pantallas < 1024px).
- ✅ Dashboard con estadísticas.
- ⏳ Páginas CRUD de cada módulo (pendiente conectar con el API).
