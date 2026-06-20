# V-COGNI — Eye Tracking Cognitive Style Classifier

Aplicación full-stack que identifica el estilo cognitivo de un estudiante (**Visual** o **Verbal**) combinando **tres métodos**:

1. **Cuestionario Felder-Silverman (F-S)** — autoevaluación de 11 preguntas (A/B)
2. **Cuestionario OSIVQ** — 30 preguntas en escala Likert 1-5 (Object Imagery + Verbal)
3. **Prueba biométrica** — seguimiento ocular en tiempo real (90 segundos) con MediaPipe + clasificación XGBoost

Los tres resultados se cruzan automáticamente para validar la consistencia del perfil cognitivo detectado.

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
    │   ├── CuestionarioOSIVQ.jsx
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
| `estudiante` | Inicio, Perfil, Cuestionario F-S, OSIVQ, Sistema (prueba biométrica), Historial |
| `admin` | Inicio, Perfil, Gestionar Usuarios (con vista de resultados y evolución de cada estudiante) |

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
Registro → Login → Cuestionario F-S → Cuestionario OSIVQ → Prueba biométrica (90s) → Historial con validación cruzada
```

**Reglas de bloqueo (Opción A — ambos obligatorios):**

- Sin **F-S** → OSIVQ bloqueado y Sistema bloqueado
- Con **F-S** pero sin **OSIVQ** → Sistema bloqueado
- Con **ambos cuestionarios** → acceso a la prueba biométrica ✅
- Al dar "Responder de nuevo" en el **F-S** → `cuestionarioCompletado` se limpia en el contexto → OSIVQ y Sistema se bloquean automáticamente
- Al dar "Responder de nuevo" en el **OSIVQ** → tanto `osivqCompletado` como `cuestionarioCompletado` se limpian → obliga a rehacer el flujo completo desde el F-S

**Reglas de historial:**

- Cada cuestionario (F-S y OSIVQ) crea un **nuevo registro** en la BD con su propia fecha — nunca se sobreescribe.
- La prueba biométrica se bloquea si la última sesión es más reciente que cualquiera de los dos cuestionarios.
- En el Historial, cada sesión se valida contra los cuestionarios **vigentes en el momento en que se realizó** (no contra los actuales), evitando que cuestionarios nuevos contaminen sesiones pasadas.

---

## Cuestionario OSIVQ

Basado en el cuestionario **Object-Spatial Imagery and Verbal (OSIVQ)** de Blajenkova et al. Se usan solo las dimensiones **Object** (Visual) y **Verbal** — 15 ítems cada una, 30 en total.

**Scoring:**
- Escala Likert 1-5 por ítem
- Ítems invertidos (carga negativa): Object → 10, 25 / Verbal → 24, 38 → se aplica `6 - valor`
- Puntaje máximo por dimensión: 75
- Umbral de empate: `|puntaje_object - puntaje_verbal| <= 5` → Balanceado

**Ítems Object (Visual):** 6, 10*, 11, 13, 18, 20, 23, 25*, 26, 29, 33, 34, 40, 43, 45

**Ítems Verbal:** 2, 4, 8, 9, 16, 19, 21, 24*, 28, 35, 36, 37, 38*, 39, 41

*Ítems invertidos

---

## Reglas de validación cruzada (3 métodos)

| Condición | Veredicto |
|---|---|
| Biométrico con confianza < 60% | ❌ Resultado descartado |
| Los 3 métodos coinciden | ✅ Confirmado con alta confianza |
| Algunos coinciden con el biométrico | 📊 Coincidencia parcial |
| Ningún cuestionario coincide con el biométrico | ⚠️ Discrepancia |

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
| POST | `/cuestionario` | Crear nuevo registro de cuestionario F-S |
| GET  | `/cuestionario/me` | Cuestionario F-S más reciente del usuario |
| GET  | `/cuestionario/historial` | Todos los cuestionarios F-S del usuario |
| POST | `/cuestionario-osivq` | Crear nuevo registro de cuestionario OSIVQ |
| GET  | `/cuestionario-osivq/me` | Cuestionario OSIVQ más reciente del usuario |
| GET  | `/cuestionario-osivq/historial` | Todos los cuestionarios OSIVQ del usuario |
| GET  | `/admin/usuarios` | Listar todos los usuarios (admin) |
| PUT/DELETE | `/admin/usuarios/{id}` | Editar / eliminar usuario (admin) |
| GET  | `/admin/sesiones/total` | Total de sesiones de todos los usuarios (admin) |
| GET  | `/admin/usuarios/{id}/sesiones` | Sesiones de un estudiante específico (admin) |
| GET  | `/admin/usuarios/{id}/cuestionarios` | Historial F-S de un estudiante (admin) |
| GET  | `/admin/usuarios/{id}/cuestionarios-osivq` | Historial OSIVQ de un estudiante (admin) |

---

## Notas de desarrollo (Vite)

Este proyecto usa [Vite](https://vitejs.dev/) con el plugin oficial de React (`@vitejs/plugin-react`) para HMR rápido durante el desarrollo.

Para producción con TypeScript y reglas de lint más estrictas, ver el [template oficial de Vite + TS](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts).