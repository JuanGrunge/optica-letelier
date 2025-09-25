# �ptica Letelier � SPA de Gesti�n

Aplicaci�n web para gestionar pacientes, recetas y boletas. Pensada para uso diario en mesa de recepci�n, �pticos y administraci�n. Enfocada en rapidez, legibilidad y pasos claros.

--

## Resumen de Funcionalidades

- Cuenta: ver usuario/rol y seleccionar tu �lugar de operativo�.
- Archivo (buscador): encontrar pacientes por RUT y abrir su ficha.
- Ficha del Paciente: datos, �ltima receta y boletas recientes; accesos a Editar / Nueva receta (seg�n permisos).
- Nuevo Paciente: registrar un paciente y, opcionalmente, continuar a �Nueva receta�.
- Mapas en 1 clic: abrir direcciones en tu app de mapas. Los �conos de pin se muestran en rojo para mayor contraste.
- Confirmaciones y avisos: se piden confirmaciones para acciones cr�ticas y se muestran toasts de resultado.

--

## Roles y Permisos

- Admin
  - Acceso total. Puede eliminar paciente (con sus registros), recetas individualmente y anular boletas.
- �ptico
  - Puede ver Archivo y crear recetas. No puede crear ni editar pacientes.
- Receptor
  - Puede ver Archivo y crear pacientes. No puede crear recetas.

Notas
- Todos pueden acceder a �Cuenta�.
- La app oculta botones/men�s no permitidos por tu rol, y bloquea la navegaci�n restringida.
- Para crear/editar, debes seleccionar antes un �lugar de operativo�. Si falta, ver�s un aviso y un tooltip explicativo.

--

## Flujo R�pido (Paso a Paso)

1) Inicia sesi�n con tu usuario y contrase�a.
2) Ve a Cuenta y selecciona tu �lugar de operativo�.
   - Ver�s un aviso amarillo si falta, y verde cuando ya est� seleccionado.
3) Desde Inicio o el Header, entra a Archivo y busca por RUT.
4) Abre la ficha del paciente para ver datos, receta reciente y boletas.
5) Acciones seg�n tu rol:
   - Receptor: �Nuevo Paciente�. Tras crear, puedes ver la ficha.
   - �ptico/Admin: �Nueva Receta� desde la ficha (o al terminar de crear paciente si aplica).
   - Admin: eliminar paciente / receta y anular boleta (siempre con confirmaci�n).

--

## Cuenta (Operativo)

- Muestra tu usuario y rol.
- Selecciona tu �lugar de operativo� desde la lista (usa el bot�n de actualizar para refrescarla).
- El aviso encima del selector te gu�a: amarillo si falta, verde si est� configurado.

--

## Archivo (Buscador)

- Escribe un RUT y presiona �Buscar�.
- Si no ingresas RUT, ver�s una lista paginada.
- Haz clic en un paciente para abrir su ficha.

--

## Ficha del Paciente

- Datos: Nombre, RUT, Fecha de nacimiento, Tel�fono, Email, Direcci�n (con acceso a mapas) y Lugar Operativo.
- Receta reciente: muestra OD/OI y observaciones.
- Boletas recientes: fecha, total y estado (Anulado si corresponde).
- Acciones (seg�n permisos y operativo):
  - Editar paciente.
  - Nueva receta.
  - Eliminar paciente (admin).
  - Eliminar receta (admin) y Anular boleta (admin). Siempre se pide confirmaci�n.

--

## Nuevo Paciente

- Completa Nombres, Apellidos, RUT, Fecha Nac., Tel�fono, Email, Direcci�n y Comuna.
- Al guardar:
  - �ptico/Admin: puedes ir a �Nueva receta� o ver la ficha.
  - Receptor: podr�s ver la ficha.

--

## Mapas

- El �cono de pin (rojo) abre la ubicaci�n:
  - Android: selector del sistema (elige tu app favorita).
  - iOS: app de mapas nativa.
  - Computador: Google Maps en el navegador.

--

## Interfaz y Accesibilidad

- Botones de acci�n s�lidos (guardar/editar/eliminar) son compactos para mejor proporci�n.
- Avisos de color con alto contraste: amarillo (pendiente) y verde (ok).
- Tooltips explican por qu� un bot�n puede estar deshabilitado (operativo faltante).
- Confirmaciones en acciones cr�ticas para evitar errores.

--

## Ayuda

�Problemas o ideas? Indica qu� intentaste, qu� esperabas y el mensaje/resultado que viste. Si puedes, agrega una captura.
