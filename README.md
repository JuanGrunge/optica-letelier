# Óptica Letelier — SPA de Gestión

Aplicación web para gestionar pacientes, recetas y boletas. Diseñada para recepción, ópticos y administración. Enfocada en rapidez, legibilidad y pasos claros.

--

## Resumen

- Cuenta: ver usuario/rol y (solo no‑admin) seleccionar el lugar de operativo.
- Archivo: buscar pacientes por RUT y abrir su ficha.
- Ficha del Paciente: datos, receta reciente y boletas; accesos a Editar / Nueva receta (según permisos).
- Nuevo Paciente (recepción): registrar un paciente.
- Mapas en 1 clic: abrir direcciones en tu app de mapas.
- Confirmaciones y avisos para acciones críticas.

--

## Roles y permisos

- Admin
  - Acceso total. Puede eliminar paciente (y sus registros), eliminar recetas y anular boletas.
  - No depende de “lugar de operativo” y no ve el selector en Cuenta.
- Óptico
  - Ver Archivo y crear recetas. No crea/edita pacientes.
- Receptor
  - Ver Archivo y crear pacientes. No crea recetas.

Notas
- Todos pueden acceder a “Cuenta”.
- La UI oculta botones/menús no permitidos y bloquea rutas restringidas.
- Solo no‑admin: para crear/editar debes seleccionar antes un “lugar de operativo”. Si falta o está inactivo, verás un aviso.

--

## Flujo rápido

1) Inicia sesión con tu usuario y contraseña.
2) (No‑admin) Ve a Cuenta y selecciona tu “lugar de operativo”.
3) Desde Inicio o Header, entra a Archivo y busca por RUT.
4) Abre la ficha del paciente para ver datos, receta reciente y boletas.
5) Acciones por rol:
   - Receptor: “Nuevo Paciente”.
   - Óptico/Admin: “Nueva Receta”.
   - Admin: además puede eliminar paciente/receta y anular boleta (con confirmación).

--

## Nueva Receta (óptico)

- Buscar por RUT (botón solo‑ícono transparente a la derecha).
- Si no existe el RUT: se expande la misma tarjeta para ingresar Nombre(s) y Apellido(s) obligatorios y crear el paciente (asociado al operativo del usuario si aplica).
- Si existe: se identifica y se muestra el formulario clínico.
- Al identificar/crear paciente, el buscador se limpia y desaparece el mini‑form para mantener la vista limpia.

--

## Archivo y Operativos

- Listado de pacientes y pacientes por operativo muestran un badge “Incompleto” si faltan datos mínimos (nombres, apellidos o comuna).
- Ese badge es un botón que dirige a “Editar paciente”.

--

## Operativos

- El switch de “Activo/Inactivo” se gestiona solo dentro de la ficha del operativo (no en el listado).

--

## Orden de navegación

- Header e Inicio priorizan: Nuevo Paciente, Nueva Receta, Archivo, Operativos (admin), Cuenta.

--

## Proxy de mantención (demo / túnel)

- Nginx en `:8080` sirve una página de mantención si la app aún no responde (500/502/503/504). Útil cuando se levanta Docker (3–5 min) o en demos con Cloudflare Tunnel.
- Toggle claro/oscuro en header (botón “invisible”, sol blanco en modo oscuro).

--

## Sesión y seguridad

- HttpSession (JSESSIONID) con inactividad de 60 min.
- Si la sesión vence (401), se redirige a Login con aviso.
- Recomendado (HTTPS):
  - `server.servlet.session.cookie.secure=true`
  - `server.servlet.session.cookie.same-site=Lax`

--

## Ayuda

¿Problemas o ideas? Indica qué intentaste, qué esperabas y el mensaje/resultado observado. Si puedes, agrega una captura.

