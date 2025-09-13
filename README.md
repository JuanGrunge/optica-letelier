# Proyecto Óptica Letelier

## Estado actual (Septiembre 2025)

Este prototipo refleja el **refactor completo del sistema**, cuyo objetivo principal fue:

- **Unificación de arquitectura (MPA):**
  Eliminación de lógicas antiguas de tipo SPA o repositorios locales.  
  Todo el flujo ahora responde al backend Java/Spring como fuente única de datos.

- **Limpieza de código y imports:**
  - Se retiraron `storage.js`, validadores de prueba y dependencias obsoletas.  
  - Se corrigieron imports inválidos (`requireAuth`, `openArchivo`) que impedían la carga del front.  
  - Los módulos actuales (`auth.js`, `router.js`, `theme.js`, `main.js`) están cohesionados y sin duplicidades.

- **Normalización de estilos y scripts:**
  - **Tema oscuro**: ahora consistente con `html[data-theme="dark"]` (JS y CSS hablan el mismo lenguaje).  
  - **Hamburguesa**: un solo controlador en `router.js`, clase `menu-open` para abrir/cerrar en mobile.  
  - **Header y logout**: en desktop se mantiene completo; en mobile se compacta pero siempre accesible tras login.

---

## Flujo actual de la aplicación

1. **Login**: formulario para personal del staff.  
2. **Navegación**:  
   - Vista `Archivo` → listado de pacientes y operativos.  
   - Vista `Ingresar` → formulario de paciente/receta.  
3. **Logout**: botón siempre disponible tras login.  
4. **Tema**: switch claro/oscuro persistente.  
5. **Responsive**:  
   - Desktop: navegación visible.  
   - Mobile: hamburguesa abre/cierra menú sin romper el layout.

---

## Pruebas con H2 (base de datos en memoria)

Para validar el backend en desarrollo, entrar a la consola H2 en  
`http://localhost:8080/h2-console` y ejecutar:

```sql
SELECT * FROM PATIENT ORDER BY ID;
```

Esto devuelve la tabla de pacientes actual.  
De momento es suficiente para testear inserciones y consultas.

---

## Próximos pasos

- Levantar y poblar más tablas (recetas, boletas, operativos).  
- Integrar la generación de boletas en la vista correspondiente.  
- Continuar pruebas de UI con el cliente para pulir detalles visuales y de flujo.  

---

## Notas internas (para desarrollo)

- El proyecto se ejecuta desde la raíz (`optica-letelier/`) con `mvn spring-boot:run`.  
- Módulos front clave:
  - `auth.js` → login/logout + estado de sesión.  
  - `router.js` → navegación + hamburguesa.  
  - `theme.js` → control de tema.  
  - `main.js` → inicialización general.  
- CSS relevantes:
  - `theme-dark.css` → normalizado a `data-theme`.  
  - `components-header.css` → header unificado, responsive, logout fijo.  

---

## Para el cliente

En esta etapa el sistema ya está consolidado técnicamente:  
- Login/Logout operativo.  
- Gestión de pacientes accesible.  
- Interfaz responsive y usable tanto en computador como en celular.  
- Cambio de tema claro/oscuro integrado.  

A partir de esta base estable, avanzaremos hacia funcionalidades finales: recetas, boletas y reportes.
