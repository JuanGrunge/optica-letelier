# LETELIER – Proyecto unificado (Spring Boot + Front incrustado)

## Cómo correr
1. Requisitos: Java 21 (o 17) y Maven.
2. Ejecuta:
   ```bash
   mvn spring-boot:run
   ```
3. Abre: http://localhost:8080
   - Tu front se sirve desde **/static** (está incrustado).
   - Healthcheck: http://localhost:8080/health
   - (Si H2 está presente) Consola H2: http://localhost:8080/h2

## Notas
- `ViewController` enruta `/, /pacientes, /archivo, /login` → `index.html`.
- No se cambió tu front: solo se movió a `src/main/resources/static/`.
- Próximos pasos: añadir seguridad JWT y CRUD reales sin romper el front.
