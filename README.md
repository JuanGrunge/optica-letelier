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

3) **Compila** y **levanta** el backend:
   ```bash
   mvn clean compile
   mvn spring-boot:run
   ```
4) **Abre** en el navegador y verifica:
   - App: `http://localhost:8080`  
   - Health: `http://localhost:8080/health`  
   - H2 Console (si está habilitada): `http://localhost:8080/h2-console/`  
     - JDBC: `jdbc:h2:mem:letelier` · Usuario: `sa` · Contraseña: *(vacío)*
5) **Prueba la API** con un JWT válido (header `Authorization: Bearer <token>`).  
   Ejemplo (listar pacientes):
   ```bash
   curl -H "Authorization: Bearer <TOKEN>" http://localhost:8080/api/patients
   ```

---

## Consultas de verificación (H2 Console)
Ejecuta estas **solo para pruebas** (el seed **no** incluye SELECTs):

**Totales por entidad**
```sql
SELECT COUNT(*) AS pacientes   FROM PATIENT;
SELECT COUNT(*) AS recetas     FROM PRESCRIPTION;
SELECT COUNT(*) AS operativos  FROM OPERATIVE;
SELECT COUNT(*) AS boletas     FROM INVOICE;
```

**Listados rápidos**
```sql
SELECT * FROM PATIENT ORDER BY ID;
```


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
- Próximas actualizaciones: cablear front a la API; administración de usuarios (roles); deploy del backend para consumo desde GitHub Pages.
