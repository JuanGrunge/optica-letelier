-- Normalización de datos demo: nombres con tildes/Ñ, direcciones y comunas (RM), textos sin mojibake

-- Pacientes (10 demo por RUT)
UPDATE patient SET nombres='JUAN', apellidos='PÉREZ', direccion='AV. SIEMPRE VIVA 123', comuna='SANTIAGO' WHERE rut='11.111.111-1';
UPDATE patient SET nombres='MARÍA', apellidos='GONZÁLEZ', direccion='CALLE FALSA 456', comuna='ÑUÑOA' WHERE rut='22.222.222-2';
UPDATE patient SET nombres='CARLOS', apellidos='RAMÍREZ', direccion='AV. LIBERTAD 1234', comuna='PROVIDENCIA' WHERE rut='12.345.678-5';
UPDATE patient SET nombres='DANIELA', apellidos='MORALES', direccion='PASAJE LAS ROSAS 456', comuna='ÑUÑOA' WHERE rut='15.123.456-9';
UPDATE patient SET nombres='FELIPE', apellidos='SOTO', direccion='LOS ALERCES 789', comuna='MAIPÚ' WHERE rut='9.876.543-3';
UPDATE patient SET nombres='CAMILA', apellidos='VARGAS', direccion='AV. MATTA 100', comuna='SANTIAGO' WHERE rut='16.789.012-1';
UPDATE patient SET nombres='RODRIGO', apellidos='PÉREZ', direccion='EL TRÉBOL 220', comuna='LA FLORIDA' WHERE rut='7.654.321-6';
UPDATE patient SET nombres='VALENTINA', apellidos='MENDOZA', direccion='CAMINO REAL 456', comuna='PROVIDENCIA' WHERE rut='18.234.567-9';
UPDATE patient SET nombres='JAVIER', apellidos='CONTRERAS', direccion='CALLE LARGA 77', comuna='MACUL' WHERE rut='20.135.579-6';
UPDATE patient SET nombres='SOFÍA', apellidos='RIQUELME', direccion='AV. GRECIA 1550', comuna='PEÑALOLÉN' WHERE rut='14.902.468-9';

-- Corregir observaciones con acentos (si existen mojibake)
UPDATE prescription SET observaciones='Miopía leve' WHERE observaciones IS NOT NULL AND observaciones LIKE 'Miop%a leve';
UPDATE prescription SET observaciones='Miopía moderada' WHERE observaciones IS NOT NULL AND observaciones LIKE 'Miop%a moderada';
UPDATE prescription SET observaciones='Miopía con astigmatismo' WHERE observaciones IS NOT NULL AND observaciones LIKE 'Miop%a con astigmatismo';
UPDATE prescription SET observaciones='Miopía avanzada' WHERE observaciones IS NOT NULL AND observaciones LIKE 'Miop%a avanzada';
UPDATE prescription SET observaciones='Leve corrección' WHERE observaciones IS NOT NULL AND observaciones LIKE 'Leve correcci%';
UPDATE prescription SET observaciones='Astigmatismo leve' WHERE observaciones IS NOT NULL AND observaciones LIKE 'Astigmatismo leve';
UPDATE prescription SET observaciones='Astigmatismo moderado' WHERE observaciones IS NOT NULL AND observaciones LIKE 'Astigmatismo moderado';

-- Operativos del día (si existen), fijar comuna (RM)
UPDATE operative SET lugar='CESFAM CENTRO', direccion='CALLE SALUD 100', comuna='SANTIAGO' WHERE nombre='Operativo Centro' AND fecha=CURRENT_DATE;
UPDATE operative SET lugar='CLÍNICA NORTE', direccion='AV. NORTE 200', comuna='QUILICURA' WHERE nombre='Operativo Norte' AND fecha=CURRENT_DATE;

-- Uppercase de columnas relevantes (por si existen registros no cubiertos arriba)
UPDATE patient SET nombres=UPPER(nombres), apellidos=UPPER(apellidos), direccion=UPPER(direccion), comuna=UPPER(comuna);
UPDATE operative SET nombre=UPPER(nombre), lugar=UPPER(lugar), direccion=UPPER(direccion), comuna=UPPER(comuna), observaciones=UPPER(observaciones);
UPDATE prescription SET observaciones=UPPER(observaciones);
UPDATE invoice SET detalle=UPPER(detalle);
UPDATE app_user SET username=UPPER(username), role=UPPER(role);
UPDATE audit_log SET usuario=UPPER(usuario), accion=UPPER(accion), entidad=UPPER(entidad), detalle=UPPER(detalle);
