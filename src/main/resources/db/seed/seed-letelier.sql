-- =====================================================
-- seed-letelier.sql (H2 2.x) - DEV ONLY
-- Idempotente. Alineado a entidades actuales:
--  - app_user(username UNIQUE, password, role ENUM en app, string en DB, enabled)
--  - patient, operative, patient_operative, prescription, invoice
-- No crea tablas: JPA (ddl-auto=update) y/o Flyway se encargan del esquema.
-- =====================================================

-- 1) Usuarios DEV (rol embebido)
MERGE INTO app_user (username, password, role, enabled) KEY(username)
  VALUES ('admin',    '{noop}admin123',    'ADMIN',    TRUE);
MERGE INTO app_user (username, password, role, enabled) KEY(username)
  VALUES ('optico',   '{noop}optico123',   'OPTICO',   TRUE);
MERGE INTO app_user (username, password, role, enabled) KEY(username)
  VALUES ('receptor', '{noop}receptor123', 'RECEPTOR', TRUE);

-- 2) Pacientes de ejemplo
INSERT INTO patient (nombres, apellidos, rut, fecha_nac, telefono, email, direccion, activo)
SELECT 'Juan', 'Pérez', '11.111.111-1', DATE '1985-05-10', '912345678', 'juan.perez@example.com', 'Av. Siempre Viva 123', TRUE
WHERE NOT EXISTS (SELECT 1 FROM patient WHERE rut = '11.111.111-1');

INSERT INTO patient (nombres, apellidos, rut, fecha_nac, telefono, email, direccion, activo)
SELECT 'María', 'González', '22.222.222-2', DATE '1990-09-21', '976543210', 'maria.gonzalez@example.com', 'Calle Falsa 456', TRUE
WHERE NOT EXISTS (SELECT 1 FROM patient WHERE rut = '22.222.222-2');

-- 3) Operativos de ejemplo
INSERT INTO operative (nombre, lugar, direccion, fecha, observaciones, activo)
SELECT 'Operativo Centro', 'CESFAM Centro', 'Calle Salud 100', CURRENT_DATE, 'Jornada mañana', TRUE
WHERE NOT EXISTS (SELECT 1 FROM operative WHERE nombre='Operativo Centro' AND fecha=CURRENT_DATE);

INSERT INTO operative (nombre, lugar, direccion, fecha, observaciones, activo)
SELECT 'Operativo Norte', 'Clínica Norte', 'Av. Norte 200', CURRENT_DATE, 'Jornada tarde', TRUE
WHERE NOT EXISTS (SELECT 1 FROM operative WHERE nombre='Operativo Norte' AND fecha=CURRENT_DATE);

-- 4) Vincular pacientes a operativos (si no existe)
INSERT INTO patient_operative (patient_id, operative_id)
SELECT p.id, o.id
FROM patient p, operative o
WHERE p.rut='11.111.111-1' AND o.nombre='Operativo Centro' AND o.fecha=CURRENT_DATE
AND NOT EXISTS (
  SELECT 1 FROM patient_operative x WHERE x.patient_id=p.id AND x.operative_id=o.id
);

-- 5) Recetas de ejemplo para Juan
INSERT INTO prescription (paciente_id, od_esfera, od_cilindro, od_eje, oi_esfera, oi_cilindro, oi_eje, add_power, observaciones, fecha, activo)
SELECT p.id, -1.25, -0.5,  90, -1.0, -0.25, 80, 1.5, 'Miopía leve', CURRENT_DATE, TRUE
FROM patient p WHERE p.rut='11.111.111-1'
AND NOT EXISTS (SELECT 1 FROM prescription r WHERE r.paciente_id=p.id);

-- 6) Boleta de ejemplo para Juan
INSERT INTO invoice (paciente_id, prescription_id, fecha, total, detalle, anulado)
SELECT p.id, r.id, CURRENT_DATE, 35000, 'Lentes monofocales', FALSE
FROM patient p
JOIN prescription r ON r.paciente_id=p.id
WHERE p.rut='11.111.111-1'
AND NOT EXISTS (SELECT 1 FROM invoice i WHERE i.paciente_id=p.id AND i.prescription_id=r.id);

