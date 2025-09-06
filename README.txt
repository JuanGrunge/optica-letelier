PARCHE MINIMO - LOGIN / SESION (compat y robustez)

Archivos incluidos:
- assets/js/auth.js   (reemplazar)

Recomendado (si aún ves el menú por un instante al cargar):
- Edita assets/css/core.css y agrega al final:



/* Autenticación: ocultar zonas protegidas mientras carga JS (preboot) */
body.preboot [data-auth="protected"] {
  display: none !important;
}

