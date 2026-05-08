# ECOBOL — Frontend (React + Vite + Tailwind CSS)

Interfaz web del sistema postal construida con React 19 y Vite.

## Requisitos

- Node.js 20 o superior
- npm 10 o superior

## Instalación

```bash
cd frontend
npm install
npm run dev
```

La aplicación estará disponible en http://localhost:5173

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo (hot reload) |
| `npm run build` | Compilar para producción |
| `npm run lint` | Analizar código con ESLint |
| `npm run preview` | Previsualizar build de producción |

## Herramienta de calidad de código

**ESLint** con plugins para React Hooks y React Refresh.

```bash
# Analizar código
npm run lint
```

Las reglas aplicadas incluyen:
- `react-hooks/rules-of-hooks` — uso correcto de hooks
- `react-hooks/exhaustive-deps` — dependencias en useEffect
- `react-refresh/only-export-components` — hot reload seguro

## Páginas implementadas (7 pantallas)

| Ruta | Página | Rol requerido |
|---|---|---|
| /login | Login con carrusel de departamentos | Público |
| /rastreo | Rastreo Público por código | Público |
| / | Gestión de Envíos | Empleado+ |
| /estado | Actualizar Estado | Empleado+ |
| /dashboard | Dashboard Gerencial (Chart.js) | Gerente+ |
| /usuarios | Gestión de Usuarios | Admin |
| /sucursales | Gestión de Sucursales | Admin |

## Componentes principales

| Componente | Descripción |
|---|---|
| `ImageCarousel` | Carrusel animado de los 9 departamentos de Bolivia |
| `ReceiptModal` | Recibo imprimible con código QR |
| `Sidebar` | Navegación con badge de envíos retrasados |
| `ModalNuevoEnvio` | Formulario con subida de foto |
| `TimelineHistorial` | Línea de tiempo de estados |
| `ToastContext` | Notificaciones globales (4 tipos) |

## Estructura

```
frontend/src/
├── pages/          # 7 páginas
├── components/     # Layout, Sidebar, Modales, Tabla, Timeline, Carrusel
├── context/        # AuthContext, ToastContext
├── services/       # api.js (axios + JWT interceptor automático)
└── App.jsx         # Rutas protegidas por rol
```
