# LETELIER – Proyecto unificado (Spring Boot + Front incrustado)

> **Estado:** fase temprana con **avances confirmados**  
> **Última actualización:** 12 Sep 2025

---

## Estado actual (resumen)
- ✅ Autenticación **JWT** operativa (filtro y flujo de login estabilizados).
- ✅ **Consola H2** disponible en desarrollo (`/h2-console/`).
- ✅ **CRUD backend** implementado: **Pacientes**, **Recetas**, **Operativos** y **Boletas**  
  *(paginación, DTOs, borrado lógico, `@PreAuthorize` por rol)*.
- 🛠️ Integración del **Front** con la **API** en curso (reemplazo de `localStorage` por `fetch()`).
- 🧪 H2 en **memoria** para iteración rápida (reiniciar la app limpia los datos).

---

## Cómo correr (paso a paso)
1. **Requisitos**: Java 21 (o 17) y Maven instalados y en el PATH.  
2. **Clona** el repo y entra a la carpeta del proyecto:
   ```bash
   git clone <tu-repo> optica-letelier
   cd optica-letelier
   ```
3. **Configura H2 (desarrollo, volátil)** — deja estas propiedades en `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:h2:mem:letelier;MODE=PostgreSQL;DB_CLOSE_DELAY=-1
   spring.datasource.username=sa
   spring.datasource.password=
   spring.jpa.hibernate.ddl-auto=update
   spring.h2.console.enabled=true
   ```
4. **Compila y levanta** en modo dev:
   ```bash
   mvn clean compile
   mvn spring-boot:run
   ```
5. **Verifica** en el navegador:  
   - App: `http://localhost:8080`  
   - Health: `http://localhost:8080/health`  
   - H2 Console (si está habilitada): `http://localhost:8080/h2-console/`  
     - JDBC: `jdbc:h2:mem:letelier` · Usuario: `sa` · Contraseña: *(vacío)*
6. **Probar API**: usa tu flujo de login para obtener un **JWT** y llama a los endpoints con el header:  
   `Authorization: Bearer <token>`  
   Ejemplo rápido (listar pacientes):
   ```bash
   curl -H "Authorization: Bearer <TOKEN>" http://localhost:8080/api/patients
   ```
> **Tip:** si quieres datos demo al arrancar, usa la consola H2 (**Tools → Run Script…**) y ejecuta tu seed.

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
- **Próximas actualizaciones**:  
  1) Cablear front a la API (fetch, validaciones y estados de carga).  
  2) Módulo de administración de usuarios (roles, altas/bajas, reseteo).  
  3) Deploy del backend (Render/Railway/Fly) para consumo desde GitHub Pages.  
  4) Migraciones y datos iniciales (Flyway/data.sql) según flujos.  
  5) Observabilidad mínima (logs estructurados) y auditoría.

