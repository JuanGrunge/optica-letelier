
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

### Archivo: resultados + ficha (actualizado)
- Búsqueda por RUT flexible (con/sin puntos/guion o prefijo numérico).
- Lista paginada (10 por página) con total y navegación Anterior/Siguiente.
- Click en una fila reemplaza la tarjeta de resultados por la “Ficha del paciente”,
  mostrando datos básicos y listados recientes de recetas y boletas.
- Botón “Volver a resultados” retorna a la lista en la misma vista.

---

## Cómo ejecutar (DEV)

1. **Requisitos**: Java 17+, Maven.
2. **Arranque**:
   ```bash
   mvn clean spring-boot:run
   ```
3. **Navegador**: abrir `http://localhost:8080/`.
4. **Login de prueba**: `admin / admin123` (o `optico / optico123`, `receptor / receptor123`).

Si trabajas con Docker Compose (PostgreSQL + app):
- Tras cambiar archivos en `src/main/resources` (SQL, HTML, JS, CSS) o Java, reconstruye solo la app:
  - `docker compose build app && docker compose up -d app`
  - Para forzar caché limpia: `docker compose build --no-cache app && docker compose up -d --force-recreate app`

> Si el login fallara en DEV, revisar que las contraseñas de `APP_USER` incluyan el prefijo `{noop}` (ver sección “Pruebas en H2”).

---

## Pruebas y datos de ejemplo

PostgreSQL (Docker) usa migraciones Flyway:
- `V1__baseline.sql`: crea el esquema inicial.
- `V2__seed_demo_data.sql`: inserta datos demo mínimos (pacientes, operativo, receta, boleta).

H2 (DEV puro) — verificación rápida:

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
LETELIER — Panel clínico (estado actual)

Resumen general

- WebApp SPA con login por sesión (JSESSIONID) y vistas protegidas.
- Header fijo (siempre visible). En móvil, menú hamburguesa con efecto “vidrio”.
- Tema claro/oscuro con interruptor.
- Vistas principales: Archivo (búsqueda por RUT) e Ingresar Paciente (datos + receta).

Cómo ejecutar (DEV)

1) Requisitos: Java 17+, Maven.
2) Arranque: mvn clean spring-boot:run
3) Navegador: http://localhost:8080/
4) Usuarios de prueba H2: admin/admin123, optico/optico123, receptor/receptor123

Login

- UI tipo overlay. Al iniciar sesión se oculta y habilita el resto de la interfaz.
- Endpoints:
  - POST /api/auth/login – autentica (crea cookie JSESSIONID)
  - GET  /api/auth/me – usuario actual
  - POST /api/auth/logout – cierra sesión

Vista: Archivo (buscador por RUT)

- Campo único de búsqueda (flexible):
  - Acepta RUT con puntos, sin puntos, con/sin guion, y prefijos numéricos.
  - Ejemplos válidos: 22.222.222-2, 22222222-2, 22222222, 22
- Resultados en tabla: RUT, Nombre Paciente, Lugar Operativo (si aplica).
- Backend normaliza el RUT para coincidencias parciales.

Vista: Ingresar Paciente

- Tarjeta 1 — Datos del paciente
  - Campos: nombre, rut, dirección, fecha de nacimiento, operativo, etc.
  - Botón “guardar” estilo viñeta (icono flecha hacia arriba).
- Tarjeta 2 — Receta (compacta en tabla por ojo)
  - Columnas: OJO, ESF, CIL, EJE, ADD, DP, ALT (filas OD y OI).
  - Se habilita automáticamente al completar nombre + rut + dirección (no es obligatorio guardar antes).
  - Ítems complementarios: DP de cerca (opcional) y Observaciones.

Estilo y accesibilidad

- Panel de fondo tipo “vidrio” y tarjetas alineadas a sus gutters laterales.
- Tipografía de formularios monoespaciada (números tabulares) para legibilidad.
- Date picker con icono visible en tema oscuro y placeholders grises.

Pruebas rápidas en H2

1) Abrir http://localhost:8080/h2
2) Conectar con la misma URL JDBC de src/main/resources/application.properties
3) Consultas útiles:

```sql
-- Conteo rápido de pacientes
SELECT COUNT(*) AS total_pacientes FROM PATIENT;

-- Últimos RUTs (para probar la vista Archivo)
SELECT RUT, NOMBRES, APELLIDOS
FROM PATIENT
WHERE RUT IS NOT NULL AND RUT <> ''
ORDER BY ID DESC
LIMIT 20;

-- Búsqueda flexible por prefijo normalizado de RUT (sin puntos/guion/espacios)
SELECT p.ID, p.RUT, p.NOMBRES, p.APELLIDOS
FROM PATIENT p
WHERE LOWER(REPLACE(REPLACE(REPLACE(p.RUT, '.', ''), '-', ''), ' ', '')) LIKE LOWER('%2222%')
ORDER BY p.ID DESC
LIMIT 20;

-- Pacientes con su(s) operativos (si existen)
SELECT p.RUT, p.NOMBRES, p.APELLIDOS, o.LUGAR
FROM PATIENT p
LEFT JOIN PATIENT_OPERATIVE po ON po.PATIENT_ID = p.ID
LEFT JOIN OPERATIVE o         ON o.ID = po.OPERATIVE_ID
ORDER BY p.ID DESC
LIMIT 50;
```

Notas de seguridad (DEV)

- Autenticación por sesión (cookie JSESSIONID).
- PasswordEncoder delegante: soporta {noop}, {bcrypt}, etc.
- CORS/CSRF relajados en desarrollo (endurecer en producción).
- Rutas públicas típicas: /, /index.html, /assets/**, /api/auth/**, /h2/** (DEV).

Tips

- Si la consola H2 en el “Explorador simple” de VS Code no muestra la pestaña de resultados, abrir /h2 en un navegador externo.
- El encabezado es fijo; las vistas agregan padding superior para que las tarjetas nunca queden bajo el header.


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

## Notas t�cnicas (r�pidas)

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


