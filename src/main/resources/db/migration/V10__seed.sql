-- V10__seed.sql
-- Normalización incremental: separar dirección y comuna y corregir acentuación/mojibake.
-- Política: no modifica seeds anteriores; aplica cambios idempotentes.

-- 1) Separar dirección y comuna si están combinadas como "Dirección, Comuna"
-- Pacientes
UPDATE patient
SET
  comuna = COALESCE(NULLIF(TRIM(SUBSTRING(direccion, POSITION(',' IN direccion)+1)), ''), comuna),
  direccion = TRIM(SUBSTRING(direccion, 1, POSITION(',' IN direccion)-1))
WHERE direccion LIKE '%,%'
  AND (comuna IS NULL OR comuna='');

-- Operativos
UPDATE operative
SET
  comuna = COALESCE(NULLIF(TRIM(SUBSTRING(direccion, POSITION(',' IN direccion)+1)), ''), comuna),
  direccion = TRIM(SUBSTRING(direccion, 1, POSITION(',' IN direccion)-1))
WHERE direccion LIKE '%,%'
  AND (comuna IS NULL OR comuna='');

-- 2) Corregir textos con acentos (mojibake) en pacientes demo (por RUT)
UPDATE patient SET nombres='JUAN',      apellidos='PÉREZ'     WHERE rut='11.111.111-1' AND apellidos <> 'PÉREZ';
UPDATE patient SET nombres='MARÍA',     apellidos='GONZÁLEZ'  WHERE rut='22.222.222-2' AND apellidos <> 'GONZÁLEZ';
UPDATE patient SET nombres='CARLOS',    apellidos='RAMÍREZ'   WHERE rut='12.345.678-5' AND apellidos <> 'RAMÍREZ';
UPDATE patient SET nombres='DANIELA',   apellidos='MORALES'   WHERE rut='15.123.456-9' AND apellidos <> 'MORALES';
UPDATE patient SET nombres='FELIPE',    apellidos='SOTO'      WHERE rut='9.876.543-3'  AND apellidos <> 'SOTO';
UPDATE patient SET nombres='CAMILA',    apellidos='VARGAS'    WHERE rut='16.789.012-1' AND apellidos <> 'VARGAS';
UPDATE patient SET nombres='RODRIGO',   apellidos='PÉREZ'     WHERE rut='7.654.321-6'  AND apellidos <> 'PÉREZ';
UPDATE patient SET nombres='VALENTINA', apellidos='MENDOZA'   WHERE rut='18.234.567-9' AND apellidos <> 'MENDOZA';
UPDATE patient SET nombres='JAVIER',    apellidos='CONTRERAS' WHERE rut='20.135.579-6' AND apellidos <> 'CONTRERAS';
UPDATE patient SET nombres='SOFÍA',     apellidos='RIQUELME'  WHERE rut='14.902.468-9' AND apellidos <> 'RIQUELME';

-- Comunas correctas para esos pacientes (si difieren)
UPDATE patient SET comuna='SANTIAGO'    WHERE rut='11.111.111-1' AND (comuna IS NULL OR comuna <> 'SANTIAGO');
UPDATE patient SET comuna='ÑUÑOA'       WHERE rut='22.222.222-2' AND (comuna IS NULL OR comuna <> 'ÑUÑOA');
UPDATE patient SET comuna='PROVIDENCIA' WHERE rut='12.345.678-5' AND (comuna IS NULL OR comuna <> 'PROVIDENCIA');
UPDATE patient SET comuna='ÑUÑOA'       WHERE rut='15.123.456-9' AND (comuna IS NULL OR comuna <> 'ÑUÑOA');
UPDATE patient SET comuna='MAIPÚ'       WHERE rut='9.876.543-3'  AND (comuna IS NULL OR comuna <> 'MAIPÚ');
UPDATE patient SET comuna='SANTIAGO'    WHERE rut='16.789.012-1' AND (comuna IS NULL OR comuna <> 'SANTIAGO');
UPDATE patient SET comuna='LA FLORIDA'  WHERE rut='7.654.321-6'  AND (comuna IS NULL OR comuna <> 'LA FLORIDA');
UPDATE patient SET comuna='PROVIDENCIA' WHERE rut='18.234.567-9' AND (comuna IS NULL OR comuna <> 'PROVIDENCIA');
UPDATE patient SET comuna='MACUL'       WHERE rut='20.135.579-6' AND (comuna IS NULL OR comuna <> 'MACUL');
UPDATE patient SET comuna='PEÑALOLÉN'   WHERE rut='14.902.468-9' AND (comuna IS NULL OR comuna <> 'PEÑALOLÉN');

-- Direcciones base (sin comuna) para esos pacientes
UPDATE patient SET direccion='AV. SIEMPRE VIVA 123'  WHERE rut='11.111.111-1' AND direccion IS NOT NULL;
UPDATE patient SET direccion='CALLE FALSA 456'       WHERE rut='22.222.222-2' AND direccion IS NOT NULL;
UPDATE patient SET direccion='AV. LIBERTAD 1234'     WHERE rut='12.345.678-5' AND direccion IS NOT NULL;
UPDATE patient SET direccion='PASAJE LAS ROSAS 456'  WHERE rut='15.123.456-9' AND direccion IS NOT NULL;
UPDATE patient SET direccion='LOS ALERCES 789'       WHERE rut='9.876.543-3'  AND direccion IS NOT NULL;
UPDATE patient SET direccion='AV. MATTA 100'         WHERE rut='16.789.012-1' AND direccion IS NOT NULL;
UPDATE patient SET direccion='EL TRÉBOL 220'         WHERE rut='7.654.321-6'  AND direccion IS NOT NULL;
UPDATE patient SET direccion='CAMINO REAL 456'       WHERE rut='18.234.567-9' AND direccion IS NOT NULL;
UPDATE patient SET direccion='CALLE LARGA 77'        WHERE rut='20.135.579-6' AND direccion IS NOT NULL;
UPDATE patient SET direccion='AV. GRECIA 1550'       WHERE rut='14.902.468-9' AND direccion IS NOT NULL;

-- 3) Corregir textos de observaciones con acentos si vienen rotos
UPDATE prescription SET observaciones='Miopía leve'              WHERE observaciones IS NOT NULL AND observaciones LIKE 'Miop%a leve';
UPDATE prescription SET observaciones='Miopía moderada'          WHERE observaciones IS NOT NULL AND observaciones LIKE 'Miop%a moderada';
UPDATE prescription SET observaciones='Miopía con astigmatismo'  WHERE observaciones IS NOT NULL AND observaciones LIKE 'Miop%a con astigmatismo';
UPDATE prescription SET observaciones='Miopía avanzada'          WHERE observaciones IS NOT NULL AND observaciones LIKE 'Miop%a avanzada';
UPDATE prescription SET observaciones='Leve corrección'          WHERE observaciones IS NOT NULL AND observaciones LIKE 'Leve correcci%';

-- 4) Operativos del día: corregir acentos en nombres/lugares si aplica
UPDATE operative SET lugar='CESFAM CENTRO'  WHERE nombre='Operativo Centro' AND fecha=CURRENT_DATE;
UPDATE operative SET lugar='CLÍNICA NORTE'  WHERE nombre='Operativo Norte'  AND fecha=CURRENT_DATE;

