
# LETELIER — Panel clínico (Óptica)

Aplicación web para operativos, recetas y boletas de una óptica popular.
Este documento resume **lo que ya funciona** y **qué viene a continuación**, pensado para el cliente.

---

## Estado actual (funcionalidades)

- **Autenticación (login) por sesión**
  - UI tipo *overlay* (emergente) sobre la misma página (SPA).
  - Inicio de sesión con usuarios de base de datos H2.
  - Cierre de sesión limpia el estado y vuelve a mostrar el login.
  - El botón **Cerrar sesión** solo aparece cuando hay sesión activa.
  - El encabezado (menú hamburguesa y conmutador de tema) permanece visible, también en móvil.
  - Endpoints disponibles:
    - `POST /api/auth/login` – autentica y crea sesión (cookie `JSESSIONID`).
    - `GET  /api/auth/me` – información del usuario autenticado.
    - `POST /api/auth/logout` – invalida sesión.

- **Roles y usuarios (DEV)**
  - Esquema multi‑rol: `APP_USER`, `APP_ROLE`, `APP_USER_ROLE`.
  - Usuarios de prueba (H2): `admin/admin123`, `optico/optico123`, `receptor/receptor123` (con prefijo `{noop}` en la contraseña).
  - El sistema acepta `{noop}` (desarrollo) y está listo para migrar a `{bcrypt}` (producción) sin cambios de código.

- **Módulos de dominio (backend)**
  - Estructura base para: **Pacientes**, **Operativos**, **Recetas**, **Boletas**.
  - Listados/CRUD expuestos por API (pendiente terminar la UI definitiva de cada módulo).

- **Base de datos H2 (desarrollo)**
  - Consola en `/h2` (si está habilitada).
  - *Seed* con datos de prueba (usuarios, pacientes, operativos, recetas, boletas).
  - Persistencia en archivo local (no volátil entre reinicios).

- **Interfaz**
  - Diseño oscuro/claro con conmutador de tema.
  - Menú hamburguesa en el *header*.
  - Layout preparado para vistas de Operativos / Recetas / Boletas.

---

## Cómo ejecutar (DEV)

1. **Requisitos**: Java 17+, Maven.
2. **Arranque**:
   ```bash
   mvn clean spring-boot:run
   ```
3. **Navegador**: abrir `http://localhost:8080/`.
4. **Login de prueba**: `admin / admin123` (o `optico / optico123`, `receptor / receptor123`).

> Si el login fallara en DEV, revisar que las contraseñas de `APP_USER` incluyan el prefijo `{noop}` (ver sección “Pruebas en H2”).

---

## Pruebas en H2 (verificación rápida)

1. Abrir la consola H2 en `http://localhost:8080/h2`.
2. Conectar usando la URL que aparece en `application.properties` (JDBC H2).
3. Consultas útiles:

```sql
-- Usuarios y estado
SELECT username, password, enabled FROM APP_USER ORDER BY username;

-- Roles por usuario
SELECT u.username, r.name AS role
FROM APP_USER u
JOIN APP_USER_ROLE ur ON ur.user_id = u.id
JOIN APP_ROLE r       ON r.id = ur.role_id
ORDER BY u.username, r.name;

-- Módulos clínicos (si hay datos seed)
SELECT * FROM PATIENT;
SELECT * FROM OPERATIVE;
SELECT * FROM PRESCRIPTION;
SELECT * FROM INVOICE;
```

> **Nota:** para DEV las contraseñas están en claro con `{noop}`. En producción se migrará a `{bcrypt}`.

---

## Convenciones de seguridad actuales

- **Sesión (JSESSIONID)**; no se usa JWT para autenticar solicitudes en esta fase.
- `PasswordEncoder`: **Delegating** (acepta `{noop}`, `{bcrypt}`, etc.).
- CORS y CSRF en configuración *permisiva* para desarrollo (se endurecerán en producción).
- Rutas públicas: `/`, `/index.html`, `/assets/**`, `/api/auth/**`, `/h2/**` (DEV).

---

## ¿Qué viene después? (roadmap corto)

1. **Operativos – formulario definitivo**
   - Campos: *Nombre de operativo*, *Dirección*, *Comuna* (con validaciones).
   - Asociar recetas/boletas a un operativo.

2. **Pacientes – dirección y comuna**
   - Separar *Dirección* y *Comuna* (estándar usado en salud y farmacias).

3. **Boletas – flujo mínimo**
   - Crear boleta desde receta/paciente; totales básicos; estado de anulación.

4. **Administración de usuarios (solo `ROLE_ADMIN`)**
   - Alta/baja/edición de usuarios y asignación de roles.
   - Migración de contraseñas a `{bcrypt}`.

5. **Endurecer seguridad (producción)**
   - CSRF activo (excluir `/api/auth/**`), CORS por dominio, `SameSite=None; Secure` si aplica.
   - Proteger `/api/**` como autenticado y por rol.

6. **Entrega y despliegue**
   - README de despliegue productivo y variables de entorno.
   - Opcional: empaquetado container/Docker.

---

## Notas técnicas (rápidas)

- **SPA**: el login muestra/oculta la aplicación sin recargar la página.
- **UI**: el botón *Cerrar sesión* solo se ve con sesión activa.
- **Seeds**: archivo(s) de *seed* bajo `src/main/resources/db/seed/`.
- **Registro (logs)**: se puede habilitar detalle de seguridad agregando en `application.properties`:
  ```properties
  logging.level.org.springframework.security=DEBUG
  ```

---

## Contacto / Soporte

Para incidencias o nuevas funcionalidades, indicar: paso a reproducir, navegador, captura y log (si es posible).
