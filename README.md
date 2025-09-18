# LETELIER - Panel clínico (Óptica)

Aplicación web (SPA) para operativos, recetas y boletas de una óptica popular.

---

## Estado actual

- Autenticación por sesión (cookie `JSESSIONID`)
  - Login en overlay dentro de la SPA; logout limpia estado y vuelve a login.
  - Endpoints: `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`.

- Selector de “Lugar Operativo”
  - Se alimenta desde `GET /api/operatives/places` (público) con lugares únicos (incluye Casa Matriz).
  - En alta, si no se elige, se usa “Casa Matriz”.

- Archivo (búsqueda) y ficha
  - Búsqueda por RUT flexible; si se envía vacío, carga lista por defecto (primera página + total).
  - Paginación: 5 por página. Tabla con RUT y Nombre.
  - Ficha muestra “Lugar Operativo”; recetas con OD/OI vertical en móvil y horizontal en desktop; fechas a la derecha.

- Interfaz
  - Conmutador de tema claro/oscuro (persistencia localStorage).
  - Tablas con fallbacks para iOS antiguos.

---

## Cómo ejecutar (DEV)

Requisitos: Java 17+, Maven (y Docker opcional).

Opción 1 – Spring Boot local
```
mvn clean spring-boot:run
```
Abrir http://localhost:8080/ y usar `admin/admin123` (o `optico/optico123`, `receptor/receptor123`).

Opción 2 – Docker Compose (PostgreSQL + app)
```
docker compose up -d db app
# Tras cambios en Java o recursos estáticos
docker compose build app && docker compose up -d app
# Caché limpia
docker compose build --no-cache app && docker compose up -d --force-recreate app
```

Verificación rápida
- `GET /health` → 200 OK
- Login responde 200 y devuelve `Set-Cookie: JSESSIONID=...`
- `GET /api/auth/me` → 200 tras login

---

## Migraciones y seeds (Flyway)

- `V1__baseline.sql` – esquema inicial
- `V2__seed_demo_data.sql` – demo mínima
- `V3__seed_more_demo_data.sql` – +8 pacientes (cada uno con 1 receta) y boletas; vínculos a operativos
- `V4__ensure_three_operatives_and_assign_all_patients.sql` – asegura 3 operativos (Centro/Norte/Sur) y asigna a todos los pacientes
- `V5__ensure_casa_matriz_operative.sql` – asegura “Operativo Casa Matriz”
- `V6__seed.sql` – placeholder (convención futura V{n}__seed.sql)
- `V7__seed.sql` – agrega `patient.created_at` e inicializa

Convención: futuras seeds usarán nombres cortos `V{n}__seed.sql`.

---

## Notas técnicas

- SPA con control de visibilidad por clase `no-session` en `body`.
- PasswordEncoder delegante ({noop}/{bcrypt}).
- CORS/CSRF relajados en DEV (endurecer en PROD).
- Rutas públicas: `/`, `/index.html`, `/assets/**`, `/api/auth/**`, `/api/operatives/places`.

---

## Soporte

Para incidencias o nuevas funcionalidades: detalla pasos, navegador y captura/log si es posible.

