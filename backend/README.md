# ECOBOL — Backend (Django REST Framework)

API REST construida con Python 3.14 + Django 5.1.

## Requisitos

- Python 3.11 o superior
- PostgreSQL 15 (producción) o SQLite (desarrollo)

## Instalación

```bash
cd backend

# Crear entorno virtual
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/Mac

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
copy .env.example .env       # Editar con tus credenciales

# Aplicar migraciones
python manage.py migrate

# Cargar datos de prueba
python seed_data.py

# Iniciar servidor
python manage.py runserver
```

## Variables de entorno (.env)

```env
SECRET_KEY=tu-clave-secreta-muy-larga
DEBUG=True
USE_SQLITE=True

# PostgreSQL (solo si USE_SQLITE=False)
DB_NAME=ecobol_db
DB_USER=ecobol_user
DB_PASSWORD=ecobol_pass_2026
DB_HOST=localhost
DB_PORT=5432
```

## Endpoints de la API

| Método | Endpoint | Descripción | Rol |
|---|---|---|---|
| POST | /api/auth/login/ | Login JWT | Público |
| POST | /api/auth/refresh/ | Renovar token | Autenticado |
| GET | /api/rastreo/?codigo=ECO-... | Rastreo público | Público |
| GET/POST | /api/envios/ | Listar / crear envíos | Empleado+ |
| GET/PATCH | /api/envios/{id}/ | Detalle / actualizar | Empleado+ |
| POST | /api/envios/{id}/estado/ | Cambiar estado | Empleado+ |
| GET | /api/sucursales/ | Listar sucursales activas | Autenticado |
| GET/POST/PATCH | /api/sucursales/admin/ | CRUD sucursales | Admin |
| GET/POST/PATCH | /api/usuarios/ | CRUD usuarios | Admin |
| GET | /api/estadisticas/ | Dashboard gerencial | Gerente+ |
| GET | /api/reportes/csv/ | Exportar CSV | Gerente+ |

## Herramienta de análisis de código

**Pylint** — análisis estático del backend Python.

```bash
# Instalar pylint
pip install pylint

# Analizar el proyecto
pylint src/apps/ --rcfile=.pylintrc
```

## Tests

```bash
python manage.py test tests/
```

## Estructura de carpetas

```
backend/
├── config/         # settings.py, urls.py
├── src/apps/
│   ├── usuarios/   # Modelo Usuario, auth JWT
│   ├── envios/     # Modelos Envio, Sucursal, Estado, Historial
│   └── reportes/   # Vista CSV export
├── tests/          # test_auth.py, test_envios.py
├── .env
├── .pylintrc
├── manage.py
├── requirements.txt
└── seed_data.py
```
