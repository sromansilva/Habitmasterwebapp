# HabitMaster - Backend Django + Frontend React

Backend Django + DRF + JWT + Frontend React con Vite. Arquitectura fullstack integrada donde Django sirve el build de React en producción y el frontend consume la API REST.

## 🏗️ Arquitectura

- **Backend**: Django + Django REST Framework + JWT Authentication
- **Frontend**: React + Vite + TypeScript
- **Base de datos**: PostgreSQL (Neon)
- **Integración**: Django sirve el build de React en producción (`http://localhost:8000/`)
- **API**: Endpoints REST en `/api/*` (JWT autenticado)

### Estructura de Módulos

- `controller/app_controller.py`: Capa imperativa/OO que orquesta modelos Django, reglas lógicas y funciones puras
- `processor/functional.py`: Funciones puras (`calculate_points`, `calculate_streak`, `filter_logs_by_week`, `generate_ranking`)
- `logic_rules/rules.py`: Reglas declarativas con Kanren (medallas, niveles, rachas especiales)
- `habits/viewsets.py`: API REST (DRF + SimpleJWT) - CRUD de hábitos, logs y acciones como `complete`
- `ui/views.py`: Vista catch-all para servir React SPA en producción
- `src/`: Frontend React con Vite

## 📋 Requisitos

- Python 3.12+
- PostgreSQL (Neon o local)
- Node.js 18+ y npm
- Cuenta en [Neon](https://neon.tech) para base de datos PostgreSQL

## 🚀 Configuración Inicial

### 1. Configurar Base de Datos Neon (PostgreSQL)

1. Crea una cuenta en [Neon](https://neon.tech)
2. Crea un nuevo proyecto en Neon
3. Copia la **Connection String** que Neon te proporciona:
   ```
   postgresql://USER:PASSWORD@ep-xxxx-xxxx.us-east-2.aws.neon.tech/dbname?sslmode=require
   ```
4. Guarda esta cadena para el archivo `.env`

### 2. Configurar Variables de Entorno Backend

Crea un archivo `.env` en `habitmaster-backend/`:

```env
# Django Configuration
SECRET_KEY=tu-secret-key-aqui-cambiar-en-produccion
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost

# Database Configuration (Neon Postgres)
DATABASE_URL=postgresql://USER:PASSWORD@ep-xxxx-xxxx.us-east-2.aws.neon.tech/dbname?sslmode=require

# CORS Configuration (Frontend React/Vite)
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### 3. Instalación del Backend

```bash
cd habitmaster-backend

# Crear entorno virtual
python -m venv .venv

# Activar entorno virtual
# Windows (PowerShell):
.venv\Scripts\activate
# Windows (CMD):
.venv\Scripts\activate.bat
# Linux/Mac:
source .venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Aplicar migraciones
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# (Opcional) Crear datos de ejemplo
python manage.py seed_habits

# Ejecutar servidor
python manage.py runserver
```

El servidor estará disponible en `http://127.0.0.1:8000`.

### 4. Instalación del Frontend

```bash
# Desde la raíz del proyecto (donde está package.json)
npm install
```

### 5. Verificar Conexión a Neon

```bash
cd habitmaster-backend
python -c "import os, psycopg2; from dotenv import load_dotenv; load_dotenv(); print('OK' if psycopg2.connect(os.getenv('DATABASE_URL')) else 'FAIL')"
```

Si ves `OK`, la conexión funciona correctamente.

## 🔄 Flujo de Desarrollo y Producción

### Desarrollo (Modo Desarrollo)

**Terminal 1 - Backend Django:**
```bash
cd habitmaster-backend
.venv\Scripts\activate  # o source .venv/bin/activate
python manage.py runserver
```

**Terminal 2 - Frontend React (Vite):**
```bash
npm run dev
```

- Frontend en: `http://localhost:5173` (Vite dev server)
- Backend en: `http://127.0.0.1:8000` (Django)
- Vite proxy automáticamente `/api/*` → `http://127.0.0.1:8000/api/*`
- Sin problemas de CORS (proxy maneja todo)

### Producción (Build Integrado)

**1. Construir el frontend:**
```bash
npm run build
```

Esto genera el build en `build/` (HTML, CSS, JS optimizados).

**2. Servir con Django:**
```bash
cd habitmaster-backend
python manage.py runserver
```

- Frontend + Backend en: `http://localhost:8000`
- React se sirve desde `http://localhost:8000/` (cualquier ruta)
- API disponible en: `http://localhost:8000/api/*`
- Admin en: `http://localhost:8000/admin/`

**Cómo funciona:**
- Django detecta `build/index.html` y lo sirve para todas las rutas excepto `/api/*` y `/admin/*`
- Los assets estáticos (JS, CSS) se sirven desde `build/assets/`
- React Router maneja el routing del lado del cliente

## 📡 URLs y Endpoints

### Frontend (React SPA)

- `/` - Landing page / Dashboard (según autenticación)
- `/dashboard` - Dashboard principal
- `/habits` - Mis hábitos
- `/progress` - Progreso semanal
- `/ranking` - Ranking global
- `/profile` - Perfil de usuario
- Cualquier otra ruta → manejada por React Router

### API REST (JWT Authentication)

**Autenticación:**
- `POST /api/auth/login/` - Obtener tokens JWT
  ```json
  {
    "username": "usuario",
    "password": "contraseña"
  }
  ```
  Respuesta:
  ```json
  {
    "access": "token_jwt_access",
    "refresh": "token_jwt_refresh"
  }
  ```

- `POST /api/auth/refresh/` - Refrescar access token
  ```json
  {
    "refresh": "refresh_token_aqui"
  }
  ```

**Hábitos:**
- `GET /api/habits/` - Listar hábitos (requiere JWT)
- `POST /api/habits/` - Crear hábito
- `GET /api/habits/<id>/` - Obtener hábito
- `PUT /api/habits/<id>/` - Actualizar hábito
- `DELETE /api/habits/<id>/` - Eliminar hábito
- `POST /api/habits/<id>/complete/` - Completar hábito

**Logs:**
- `GET /api/logs/` - Listar logs de hábitos

### Admin

- `/admin/` - Panel de administración Django

### Documentación API

- `/api/docs/` - Swagger UI (documentación interactiva)
- `/api/schema/` - OpenAPI Schema JSON

## 🔐 Autenticación JWT

El frontend usa `src/utils/api.js` que incluye interceptores de axios para:

1. **Agregar token automáticamente**: Cada petición a `/api/*` incluye `Authorization: Bearer <token>`
2. **Refresh automático**: Si el token expira (401), intenta refrescar automáticamente
3. **Logout automático**: Si el refresh falla, limpia tokens y redirige a login

**Uso en componentes:**
```javascript
import api from './utils/api';

// Login
const response = await api.post('/auth/login/', {
  username: 'usuario',
  password: 'contraseña'
});
const { access, refresh } = response.data;
localStorage.setItem('access_token', access);
localStorage.setItem('refresh_token', refresh);

// Peticiones autenticadas (token se agrega automáticamente)
const habits = await api.get('/habits/');
```

## 📦 Scripts Disponibles

### Frontend (package.json)

- `npm run dev` - Desarrollo con Vite (puerto 5173, proxy a Django)
- `npm run build` - Construir producción (genera `build/`)
- `npm run build-and-copy` - Build + mensaje informativo
- `npm run preview` - Preview del build local

### Backend

- `python manage.py runserver` - Servidor Django
- `python manage.py migrate` - Aplicar migraciones
- `python manage.py createsuperuser` - Crear admin
- `python manage.py collectstatic` - Recopilar archivos estáticos (producción)
- `python manage.py seed_habits` - Datos de ejemplo

## 🗂️ Estructura de Archivos

```
Habitmasterwebapp/
├── habitmaster-backend/        # Backend Django
│   ├── habitmaster_backend/
│   │   ├── settings.py        # Config: React build, CORS, DB
│   │   └── urls.py            # Rutas: API + catch-all React
│   ├── habits/                # App de hábitos
│   │   ├── models.py
│   │   ├── viewsets.py        # API REST
│   │   └── urls.py
│   ├── ui/
│   │   └── views.py           # Vista catch-all para React
│   ├── controller/
│   │   └── app_controller.py  # Lógica de negocio
│   ├── processor/
│   │   └── functional.py      # Funciones puras
│   ├── logic_rules/
│   │   └── rules.py           # Reglas declarativas
│   ├── .env                   # Variables de entorno
│   └── requirements.txt
│
├── src/                       # Frontend React
│   ├── components/            # Componentes React
│   ├── utils/
│   │   └── api.js            # Cliente axios con JWT
│   ├── App.tsx
│   └── main.tsx
│
├── build/                     # Build de producción (generado)
│   ├── index.html
│   └── assets/
│       ├── index-xxx.js
│       └── index-xxx.css
│
├── vite.config.ts            # Config Vite (proxy, build)
├── package.json
└── README.md
```

## 🛠️ Verificación Post-Instalación

### 1. Backend funcionando

```bash
cd habitmaster-backend
python manage.py runserver
```

- Abre `http://127.0.0.1:8000/` → Debe mostrar React (si build existe) o mensaje
- Abre `http://127.0.0.1:8000/api/docs/` → Debe mostrar Swagger UI
- Abre `http://127.0.0.1:8000/admin/` → Debe mostrar admin Django

### 2. Frontend en desarrollo

```bash
npm run dev
```

- Abre `http://localhost:5173/` → Debe mostrar React
- Las peticiones a `/api/*` se proxy automáticamente a Django

### 3. Build de producción

```bash
npm run build
cd habitmaster-backend
python manage.py runserver
```

- Abre `http://127.0.0.1:8000/` → Debe mostrar React (desde build)
- Los assets (JS, CSS) se cargan correctamente
- Las rutas de React funcionan (client-side routing)

### 4. API JWT funcionando

```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "tu_usuario", "password": "tu_contraseña"}'
```

Debe devolver tokens `access` y `refresh`.

## 🔧 Solución de Problemas

### Error: Build de React no encontrado

**Síntoma**: Django muestra "Build de React no encontrado"

**Solución**:
```bash
npm run build
```

### Error: Assets no cargan (404 en JS/CSS)

**Síntoma**: React se carga pero sin estilos/JS

**Solución**:
1. Verificar que `build/assets/` existe después de `npm run build`
2. Verificar que Django puede servir archivos estáticos:
   ```bash
   python manage.py collectstatic
   ```

### Error: CORS bloqueado en desarrollo

**Síntoma**: Errores de CORS desde `http://localhost:5173`

**Solución**:
- Verificar que `vite.config.ts` tiene el proxy configurado
- Verificar que `CORS_ALLOWED_ORIGINS` en `.env` incluye `http://localhost:5173`
- En desarrollo, `CORS_ALLOW_ALL_ORIGINS = True` si `DEBUG=True`

### Error: Conexión a Neon falla

**Síntoma**: Error al hacer `python manage.py migrate`

**Solución**:
1. Verificar `DATABASE_URL` en `.env`
2. Asegurar que la connection string incluye `?sslmode=require`
3. Verificar que tu IP no esté bloqueada en Neon (configuración de red)

### Error: Rutas de React no funcionan (404)

**Síntoma**: Al navegar a `/dashboard` en producción, 404

**Solución**:
- Verificar que `urls.py` tiene el catch-all al final: `re_path(r'^(?!api|admin|static|media).*$', ReactAppView.as_view())`
- Verificar que `ReactAppView` está importado correctamente

## 📝 Notas Importantes

1. **En desarrollo**: Usa `npm run dev` para el frontend y `python manage.py runserver` para el backend. Vite proxy maneja CORS automáticamente.

2. **En producción**: Ejecuta `npm run build` primero, luego `python manage.py runserver`. Django sirve todo.

3. **Templates antiguos**: Los templates Django (`ui/templates/ui/*.html`) ya no se usan. Todo el UI es React.

4. **Variables de entorno**: Nunca commitees `.env` al repositorio. Usa `.env.example` como plantilla.

5. **Base de datos**: La connection string de Neon debe incluir `?sslmode=require` para SSL.

## 🚢 Deploy a Producción

1. Configurar variables de entorno en el servidor
2. Ejecutar `npm run build` en el servidor
3. Ejecutar `python manage.py collectstatic`
4. Usar Gunicorn + Nginx para servir Django en producción
5. Configurar Nginx para servir archivos estáticos eficientemente

Ejemplo con Gunicorn:
```bash
pip install gunicorn
gunicorn habitmaster_backend.wsgi:application --bind 0.0.0.0:8000
```

---

**Desarrollado con ❤️ usando Django + React**
