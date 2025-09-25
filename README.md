# Óptica Letelier — SPA de Gestión

Aplicación web para gestionar pacientes, recetas y boletas. Pensada para uso diario en mesa de recepción, ópticos y administración. Enfocada en rapidez, legibilidad y pasos claros.

--

## Resumen de Funcionalidades

- Cuenta: ver usuario/rol y seleccionar tu “lugar de operativo”.
- Archivo (buscador): encontrar pacientes por RUT y abrir su ficha.
- Ficha del Paciente: datos, última receta y boletas recientes; accesos a Editar / Nueva receta (según permisos).
- Nuevo Paciente: registrar un paciente y, opcionalmente, continuar a “Nueva receta”.
- Mapas en 1 clic: abrir direcciones en tu app de mapas. Los íconos de pin se muestran en rojo para mayor contraste.
- Confirmaciones y avisos: se piden confirmaciones para acciones críticas y se muestran toasts de resultado.

--

## Roles y Permisos

- Admin
  - Acceso total. Puede eliminar paciente (con sus registros), recetas individualmente y anular boletas.
- Óptico
  - Puede ver Archivo y crear recetas. No puede crear ni editar pacientes.
- Receptor
  - Puede ver Archivo y crear pacientes. No puede crear recetas.

Notas
- Todos pueden acceder a “Cuenta”.
- La app oculta botones/menús no permitidos por tu rol, y bloquea la navegación restringida.
- Para crear/editar, debes seleccionar antes un “lugar de operativo”. Si falta, verás un aviso y un tooltip explicativo.

--

## Flujo Rápido (Paso a Paso)

1) Inicia sesión con tu usuario y contraseña.
2) Ve a Cuenta y selecciona tu “lugar de operativo”.
   - Verás un aviso amarillo si falta, y verde cuando ya esté seleccionado.
3) Desde Inicio o el Header, entra a Archivo y busca por RUT.
4) Abre la ficha del paciente para ver datos, receta reciente y boletas.
5) Acciones según tu rol:
   - Receptor: “Nuevo Paciente”. Tras crear, puedes ver la ficha.
   - Óptico/Admin: “Nueva Receta” desde la ficha (o al terminar de crear paciente si aplica).
   - Admin: eliminar paciente / receta y anular boleta (siempre con confirmación).

--

## Cuenta (Operativo)

- Muestra tu usuario y rol.
- Selecciona tu “lugar de operativo” desde la lista (usa el botón de actualizar para refrescarla).
- El aviso encima del selector te guía: amarillo si falta, verde si está configurado.

--

## Archivo (Buscador)

- Escribe un RUT y presiona “Buscar”.
- Si no ingresas RUT, verás una lista paginada.
- Haz clic en un paciente para abrir su ficha.

--

## Ficha del Paciente

- Datos: Nombre, RUT, Fecha de nacimiento, Teléfono, Email, Dirección (con acceso a mapas) y Lugar Operativo.
- Receta reciente: muestra OD/OI y observaciones.
- Boletas recientes: fecha, total y estado (Anulado si corresponde).
- Acciones (según permisos y operativo):
  - Editar paciente.
  - Nueva receta.
  - Eliminar paciente (admin).
  - Eliminar receta (admin) y Anular boleta (admin). Siempre se pide confirmación.

--

## Nuevo Paciente

- Completa Nombres, Apellidos, RUT, Fecha Nac., Teléfono, Email, Dirección y Comuna.
- Al guardar:
  - Óptico/Admin: puedes ir a “Nueva receta” o ver la ficha.
  - Receptor: podrás ver la ficha.

--

## Mapas

- El ícono de pin (rojo) abre la ubicación:
  - Android: selector del sistema (elige tu app favorita).
  - iOS: app de mapas nativa.
  - Computador: Google Maps en el navegador.

--

## Interfaz y Accesibilidad

- Botones de acción sólidos (guardar/editar/eliminar) son compactos para mejor proporción.
- Avisos de color con alto contraste: amarillo (pendiente) y verde (ok).
- Tooltips explican por qué un botón puede estar deshabilitado (operativo faltante).
- Confirmaciones en acciones críticas para evitar errores.

--

## Ayuda

¿Problemas o ideas? Indica qué intentaste, qué esperabas y el mensaje/resultado que viste. Si puedes, agrega una captura.
