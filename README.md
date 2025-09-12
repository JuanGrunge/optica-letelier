# LETELIER – Proyecto unificado (Spring Boot + Front incrustado)

> **Estado:** fase temprana con avances confirmados  
> **Última actualización:** 12 Sep 2025

---

## Estado actual (resumen)
- ✅ Autenticación **JWT** operativa (login + filtro).
- ✅ Consola **H2** disponible en desarrollo (`/h2-console/`).
- ✅ **CRUD backend**: **Pacientes**, **Recetas**, **Operativos** y **Boletas**  
  *(paginación, DTOs, borrado lógico, `@PreAuthorize` por rol)*.
- 🛠️ Integración del **Front** con la **API** en curso (reemplazo de `localStorage` por `fetch()`).
- 🧪 H2 en **memoria** para iteración rápida (reiniciar la app limpia los datos).

---

## Cómo correr (paso a paso)
1) **Requisitos**: Java 21 (o 17) y Maven instalados y en el PATH.  
2) **Clona** el repo y entra al proyecto:
   ```bash
   git clone <tu-repo> optica-letelier
   cd optica-letelier
   ```
3) **Configura H2 (desarrollo, volátil)** — en `src/main/resources/application.properties` deja:
   ```properties
   spring.datasource.url=jdbc:h2:mem:letelier;MODE=PostgreSQL;DB_CLOSE_DELAY=-1
   spring.datasource.username=sa
   spring.datasource.password=
   spring.jpa.hibernate.ddl-auto=update
   spring.h2.console.enabled=true
   ```
4) **Compila** y **levanta** el backend:
   ```bash
   mvn clean compile
   mvn spring-boot:run
   ```
5) **Abre** en el navegador y verifica:
   - App: `http://localhost:8080`  
   - Health: `http://localhost:8080/health`  
   - H2 Console (si está habilitada): `http://localhost:8080/h2-console/`  
     - JDBC: `jdbc:h2:mem:letelier` · Usuario: `sa` · Contraseña: *(vacío)*
6) **Prueba la API** con un JWT válido (header `Authorization: Bearer <token>`).  
   Ejemplo (listar pacientes):
   ```bash
   curl -H "Authorization: Bearer <TOKEN>" http://localhost:8080/api/patients
   ```

---

## Semilla de datos H2 (opcional, para pruebas)
Coloca tu script en: **`src/main/resources/db/seed/seed-letelier.sql`**

### Opción A — Ejecutar desde la H2 Console (desarrollo)
1. Abre `http://localhost:8080/h2-console/` y conecta.  
2. Menú **Tools → Run Script…** → selecciona `src/main/resources/db/seed/seed-letelier.sql`.  
3. Ejecuta. El script es **idempotente**.

### Opción B — Ejecutar automáticamente al arrancar
Añade a `application.properties`:
```properties
spring.sql.init.mode=always
spring.sql.init.data-locations=classpath:db/seed/seed-letelier.sql
spring.jpa.defer-datasource-initialization=true
```
> Con H2 en memoria, JPA crea el esquema y **luego** se carga el seed en cada arranque.

---

## API clínica (endpoints)
- **Pacientes**: `GET/POST/PUT/DELETE /api/patients` (+ `/{id}`)
- **Recetas**: `GET/POST/PUT/DELETE /api/prescriptions` (+ `/{id}`)
- **Operativos**: `GET/POST/PUT/DELETE /api/operatives` (+ `/{id}`)
- **Boletas**: `GET/POST/PUT /api/invoices` (+ `/{id}`) · `POST /api/invoices/{id}/annul`

### Seguridad (roles)
- Lectura: **ADMIN**, **OPTICO**, **RECEPTOR**  
- Escritura: **ADMIN**, **OPTICO**  
- Operaciones sensibles (anulación/borrado): **ADMIN**

---

## Notas
- `ViewController` enruta `/, /pacientes, /archivo, /login` → `index.html`.
- No se cambió tu front: se sirve desde `src/main/resources/static/`.
- **Semilla H2**: `src/main/resources/db/seed/seed-letelier.sql` (H2 Console o auto-init con `spring.sql.init.*`).
- Próximas actualizaciones: cablear front a la API; administración de usuarios (roles); deploy del backend para consumo desde GitHub Pages.
