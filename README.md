# LETELIER – Proyecto unificado (Spring Boot + Front incrustado)

## Estado actual (resumen)
- ✅ Autenticación **JWT** operativa.
- ✅ Consola **H2** disponible en desarrollo.
- ✅ **CRUD backend**: Pacientes, Recetas, Operativos y Boletas (paginación, DTOs, borrado lógico, `@PreAuthorize`).
- 🛠️ Integrando el **Front** a la **API** (reemplazo de `localStorage` por `fetch()`).

---

## Cómo correr
1. Requisitos: Java 21 (o 17) y Maven.
2. Ejecuta:
   ```bash
   mvn spring-boot:run