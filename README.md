# V-COGNI — Eye Tracking Cognitive Style Classifier

Aplicación full-stack que identifica el estilo cognitivo de un estudiante (**Visual** o **Verbal**) combinando dos métodos:

1. **Cuestionario Felder-Silverman** — autoevaluación de 11 preguntas
2. **Prueba biométrica** — seguimiento ocular en tiempo real (90 segundos) con MediaPipe + clasificación XGBoost

Ambos resultados se cruzan automáticamente para validar la consistencia del perfil cognitivo detectado.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React + Vite |
| Backend | FastAPI |
| Base de datos | PostgreSQL + SQLAlchemy |
| Eye-tracking | MediaPipe |
| Clasificación | XGBoost |
| Autenticación | JWT (8 horas de duración) |

---

## Estructura del proyecto

```
V-COGNI-MEDIAPIPE-MODEL-main/   ← Backend
├── api.py                       # Endpoints FastAPI
├── models.py                    # Modelos SQLAlchemy
├── schemas.py                   # Schemas Pydantic
├── database.py                  # Conexión a PostgreSQL
├── classifier.py                # Lógica de clasificación XGBoost
├── create_admin.py              # Script para crear usuario admin
└── server.py / eye_coordinates_cam.py   # Captura MediaPipe (SSE)

V-cogni-front/                   ← Frontend
└── src/
    ├── App.jsx
    ├── main.jsx
    ├── components/
    │   ├── Layout.jsx
    │   ├── Sidebar.jsx
    │   ├── ProtectedRoute.jsx
    │   └── AdminRoute.jsx
    ├── context/
    │   └── AuthContext.jsx
    ├── public/
    │   ├── LandingPage.jsx
    │   ├── LoginPage.jsx
    │   ├── RegisterPage.jsx
    │   ├── Home.jsx
    │   ├── Profile.jsx
    │   ├── Cuestionario.jsx
    │   ├── Historial.jsx
    │   └── NotFound.jsx
    └── pages/sistema/
        ├── Sistema.jsx
        ├── LiveSession.jsx
        └── admin/
            ├── AdminDashboardPage.jsx
            └── GestionUsuariosPage.jsx
```

---

## Cómo correr el proyecto

### 1. Backend

```bash
cd V-COGNI-MEDIAPIPE-MODEL-main
venv\Scripts\activate
uvicorn api:app --reload --port 8000
```

También se necesita el servidor de captura MediaPipe corriendo en paralelo (otra terminal):

```bash
python server.py
```

> No es necesario tener pgAdmin abierto para que el sistema funcione — PostgreSQL corre como servicio de Windows en segundo plano. pgAdmin solo se usa para inspeccionar o modificar datos manualmente.

### 2. Frontend

```bash
cd V-cogni-front
pnpm run dev
```

---

## Roles del sistema

| Rol | Acceso |
|---|---|
| `estudiante` | Inicio, Perfil, Cuestionario, Sistema (prueba biométrica), Historial |
| `admin` | Inicio, Perfil, Gestionar Usuarios (con vista de resultados de cada estudiante) |

### Crear el primer usuario admin

1. En pgAdmin → Query Tool, asegurarse de que el enum de rol incluya `admin`:
   ```sql
   ALTER TYPE rolenum ADD VALUE 'admin';
   ```
2. Ejecutar el script (una sola vez):
   ```bash
   python create_admin.py
   ```
   Esto crea el usuario `admin001` / `admin1234` con rol `admin`.

---

## Flujo del estudiante

```
Registro → Login → Cuestionario F-S → Prueba biométrica (90s) → Historial con validación cruzada
```

**Reglas importantes:**

- El **Cuestionario** se puede responder **múltiples veces** (cada envío crea un nuevo registro con su propia fecha, no se sobreescribe).
- La **prueba biométrica** se bloquea si la última sesión registrada es más reciente que el cuestionario vigente — esto obliga a que el orden siempre sea *cuestionario → biométrico → cuestionario → biométrico*, nunca dos biométricos seguidos sin actualizar el cuestionario.
- En el **Historial**, cada sesión biométrica se valida contra el cuestionario que estaba vigente **en el momento en que se realizó esa sesión** (no contra el cuestionario actual). Esto evita que un cuestionario nuevo "contamine" retroactivamente sesiones pasadas.

### Reglas de validación cruzada

| Condición | Veredicto |
|---|---|
| Cuestionario Verbal + biométrico con confianza < 60% | ❌ Resultado descartado |
| Ambos métodos coinciden | ✅ Confirmado con alta confianza |
| Cuestionario Balanceado + biométrico define un perfil | 📊 Perfil definido por biométrico |
| Cuestionario y biométrico no coinciden | ⚠️ Discrepancia leve |

---

## Seguridad implementada

- **Protección de rutas por rol** (`AdminRoute.jsx`) — un estudiante no puede acceder a `/admin/usuarios` escribiendo la URL directamente; es redirigido a `/inicio`.
- **Manejo de token expirado** — todas las llamadas autenticadas pasan por un interceptor (`fetchAuth` en `AuthContext.jsx`) que detecta respuestas `401`, limpia la sesión y redirige a `/login` mostrando un aviso de "sesión expirada".
- Contraseñas hasheadas con `bcrypt` (vía `passlib`).
- Tokens JWT con expiración de 8 horas.

---

## Endpoints principales del backend

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/auth/register` | Registro de usuario |
| POST | `/auth/login` | Login, devuelve JWT |
| GET  | `/usuarios/me` | Perfil del usuario autenticado |
| PUT  | `/usuarios/me/update` | Actualizar perfil |
| POST | `/clasificar` | Enviar métricas de gaze y clasificar sesión (XGBoost) |
| GET  | `/sesiones/me` | Historial de sesiones del usuario |
| POST | `/cuestionario` | Crear un nuevo registro de cuestionario F-S |
| GET  | `/cuestionario/me` | Cuestionario más reciente del usuario |
| GET  | `/cuestionario/historial` | Todos los cuestionarios del usuario (para validación cruzada por fecha) |
| GET  | `/admin/usuarios` | Listar todos los usuarios (admin) |
| PUT/DELETE | `/admin/usuarios/{id}` | Editar / eliminar usuario (admin) |
| GET  | `/admin/sesiones/total` | Total de sesiones de todos los usuarios (admin) |
| GET  | `/admin/usuarios/{id}/sesiones` | Sesiones de un estudiante específico (admin) |
| GET  | `/admin/usuarios/{id}/cuestionarios` | Historial de cuestionarios de un estudiante (admin) |

---

## Próximos pasos / ideas pendientes

- Integrar un **segundo cuestionario** (en curso)
- Tests automatizados para la lógica de validación cruzada
- Manejo de errores de red más robusto (mensaje claro si el backend está caído)
- Debounce en el buscador de Gestión de Usuarios

---

## Notas de desarrollo (Vite)

Este proyecto usa [Vite](https://vitejs.dev/) con el plugin oficial de React (`@vitejs/plugin-react`) para HMR rápido durante el desarrollo.

Para producción con TypeScript y reglas de lint más estrictas, ver el [template oficial de Vite + TS](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts).