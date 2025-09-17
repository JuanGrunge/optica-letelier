-- Seed de datos demo (PostgreSQL)
-- Inserta pacientes, operativos y relaciones mínimas para pruebas manuales.
-- Idempotente mediante WHERE NOT EXISTS.

-- Pacientes demo
INSERT INTO patient (nombres, apellidos, rut, fecha_nac, telefono, email, direccion, activo)
SELECT 'Juan', 'Perez', '11.111.111-1', DATE '1985-05-10', '912345678', 'juan.perez@example.com', 'Av. Siempre Viva 123', TRUE
WHERE NOT EXISTS (SELECT 1 FROM patient WHERE rut = '11.111.111-1');

INSERT INTO patient (nombres, apellidos, rut, fecha_nac, telefono, email, direccion, activo)
SELECT 'Maria', 'Gonzalez', '22.222.222-2', DATE '1990-09-21', '976543210', 'maria.gonzalez@example.com', 'Calle Falsa 456', TRUE
WHERE NOT EXISTS (SELECT 1 FROM patient WHERE rut = '22.222.222-2');

-- Operativos demo (para la fecha actual)
INSERT INTO operative (nombre, lugar, direccion, fecha, observaciones, activo)
SELECT 'Operativo Centro', 'CESFAM Centro', 'Calle Salud 100', CURRENT_DATE, 'Jornada mañana', TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM operative WHERE nombre='Operativo Centro' AND fecha=CURRENT_DATE
);

INSERT INTO operative (nombre, lugar, direccion, fecha, observaciones, activo)
SELECT 'Operativo Norte', 'Clínica Norte', 'Av. Norte 200', CURRENT_DATE, 'Jornada tarde', TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM operative WHERE nombre='Operativo Norte' AND fecha=CURRENT_DATE
);

-- Relación paciente-operativo
INSERT INTO patient_operative (patient_id, operative_id)
SELECT p.id, o.id
FROM patient p
JOIN operative o ON o.nombre='Operativo Centro' AND o.fecha=CURRENT_DATE
WHERE p.rut='11.111.111-1'
  AND NOT EXISTS (
    SELECT 1 FROM patient_operative x WHERE x.patient_id=p.id AND x.operative_id=o.id
  );

-- Receta demo para Juan
INSERT INTO prescription (paciente_id, od_esfera, od_cilindro, od_eje, oi_esfera, oi_cilindro, oi_eje, add_power, observaciones, fecha, activo)
SELECT p.id, -1.25, -0.50, 90, -1.00, -0.25, 80, 1.50, 'Miopía leve', CURRENT_DATE, TRUE
FROM patient p WHERE p.rut='11.111.111-1'
AND NOT EXISTS (
  SELECT 1 FROM prescription r WHERE r.paciente_id=p.id
);

-- Boleta demo para Juan
INSERT INTO invoice (paciente_id, prescription_id, fecha, total, detalle, anulado)
SELECT p.id, r.id, CURRENT_DATE, 35000, 'Lentes monofocales', FALSE
FROM patient p
JOIN prescription r ON r.paciente_id=p.id
WHERE p.rut='11.111.111-1'
AND NOT EXISTS (
  SELECT 1 FROM invoice i WHERE i.paciente_id=p.id AND i.prescription_id=r.id
);

