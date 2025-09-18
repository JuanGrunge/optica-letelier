-- V3__seed_more_demo_data.sql
-- Semillas adicionales: 8 pacientes completos con 1 receta cada uno
-- y 1–2 boletas por paciente. Idempotente por RUT/detalle.

-- Nota: El RUT chileno no codifica fecha de nacimiento; aquí se usan fechas plausibles.

-- =========================
-- Pacientes (8 registros)
-- =========================
INSERT INTO patient (nombres, apellidos, rut, fecha_nac, telefono, email, direccion, activo)
SELECT 'Carlos', 'Ramírez', '12.345.678-5', DATE '1984-03-12', '987654321', 'carlos.ramirez@example.com', 'Av. Libertad 1234, Santiago', TRUE
WHERE NOT EXISTS (SELECT 1 FROM patient WHERE rut='12.345.678-5');

INSERT INTO patient (nombres, apellidos, rut, fecha_nac, telefono, email, direccion, activo)
SELECT 'Daniela', 'Morales', '15.123.456-9', DATE '1992-07-25', '912300456', 'daniela.morales@example.com', 'Pasaje Las Rosas 456, Ñuñoa', TRUE
WHERE NOT EXISTS (SELECT 1 FROM patient WHERE rut='15.123.456-9');

INSERT INTO patient (nombres, apellidos, rut, fecha_nac, telefono, email, direccion, activo)
SELECT 'Felipe', 'Soto', '9.876.543-3', DATE '1978-11-03', '922334455', 'felipe.soto@example.com', 'Los Alerces 789, Maipú', TRUE
WHERE NOT EXISTS (SELECT 1 FROM patient WHERE rut='9.876.543-3');

INSERT INTO patient (nombres, apellidos, rut, fecha_nac, telefono, email, direccion, activo)
SELECT 'Camila', 'Vargas', '16.789.012-1', DATE '1989-02-14', '933221199', 'camila.vargas@example.com', 'Av. Matta 100, Stgo. Centro', TRUE
WHERE NOT EXISTS (SELECT 1 FROM patient WHERE rut='16.789.012-1');

INSERT INTO patient (nombres, apellidos, rut, fecha_nac, telefono, email, direccion, activo)
SELECT 'Rodrigo', 'Pérez', '7.654.321-6', DATE '1981-05-30', '945667788', 'rodrigo.perez@example.com', 'El Trébol 220, La Florida', TRUE
WHERE NOT EXISTS (SELECT 1 FROM patient WHERE rut='7.654.321-6');

INSERT INTO patient (nombres, apellidos, rut, fecha_nac, telefono, email, direccion, activo)
SELECT 'Valentina', 'Mendoza', '18.234.567-9', DATE '1995-10-09', '956778899', 'valentina.mendoza@example.com', 'Camino Real 456, Providencia', TRUE
WHERE NOT EXISTS (SELECT 1 FROM patient WHERE rut='18.234.567-9');

INSERT INTO patient (nombres, apellidos, rut, fecha_nac, telefono, email, direccion, activo)
SELECT 'Javier', 'Contreras', '20.135.579-6', DATE '1986-01-22', '967889900', 'javier.contreras@example.com', 'Calle Larga 77, Macul', TRUE
WHERE NOT EXISTS (SELECT 1 FROM patient WHERE rut='20.135.579-6');

INSERT INTO patient (nombres, apellidos, rut, fecha_nac, telefono, email, direccion, activo)
SELECT 'Sofía', 'Riquelme', '14.902.468-9', DATE '1993-12-02', '978990011', 'sofia.riquelme@example.com', 'Av. Grecia 1550, Peñalolén', TRUE
WHERE NOT EXISTS (SELECT 1 FROM patient WHERE rut='14.902.468-9');

-- =========================
-- Relación paciente-operativo (asignar a Centro/Norte)
-- =========================
INSERT INTO patient_operative (patient_id, operative_id)
SELECT p.id, o.id FROM patient p JOIN operative o ON o.nombre='Operativo Centro' AND o.fecha=CURRENT_DATE
WHERE p.rut IN ('12.345.678-5','9.876.543-3','7.654.321-6','20.135.579-6')
AND NOT EXISTS (SELECT 1 FROM patient_operative x WHERE x.patient_id=p.id AND x.operative_id=o.id);

INSERT INTO patient_operative (patient_id, operative_id)
SELECT p.id, o.id FROM patient p JOIN operative o ON o.nombre='Operativo Norte' AND o.fecha=CURRENT_DATE
WHERE p.rut IN ('15.123.456-9','16.789.012-1','18.234.567-9','14.902.468-9')
AND NOT EXISTS (SELECT 1 FROM patient_operative x WHERE x.patient_id=p.id AND x.operative_id=o.id);

-- Asegurar vínculo también para paciente demo previo (María 22.222.222-2)
INSERT INTO patient_operative (patient_id, operative_id)
SELECT p.id, o.id FROM patient p JOIN operative o ON o.nombre='Operativo Centro' AND o.fecha=CURRENT_DATE
WHERE p.rut = '22.222.222-2'
AND NOT EXISTS (SELECT 1 FROM patient_operative x WHERE x.patient_id=p.id AND x.operative_id=o.id);

-- =========================
-- Receta: 1 por paciente (si no existe)
-- =========================
-- Carlos 12.345.678-5
INSERT INTO prescription (paciente_id, od_esfera, od_cilindro, od_eje, oi_esfera, oi_cilindro, oi_eje, add_power, observaciones, fecha, activo)
SELECT p.id, -2.00, -0.50, 85, -1.75, -0.25, 95, 1.50, 'Miopía moderada', CURRENT_DATE, TRUE
FROM patient p WHERE p.rut='12.345.678-5'
AND NOT EXISTS (SELECT 1 FROM prescription r WHERE r.paciente_id=p.id);

-- Daniela 15.123.456-9
INSERT INTO prescription (paciente_id, od_esfera, od_cilindro, od_eje, oi_esfera, oi_cilindro, oi_eje, add_power, observaciones, fecha, activo)
SELECT p.id, -1.00, -0.25, 80, -1.25, -0.25, 90, 1.25, 'Miopía leve', CURRENT_DATE, TRUE
FROM patient p WHERE p.rut='15.123.456-9'
AND NOT EXISTS (SELECT 1 FROM prescription r WHERE r.paciente_id=p.id);

-- Felipe 9.876.543-3
INSERT INTO prescription (paciente_id, od_esfera, od_cilindro, od_eje, oi_esfera, oi_cilindro, oi_eje, add_power, observaciones, fecha, activo)
SELECT p.id, -0.75, -0.50, 100, -0.50, -0.25, 95, 0.75, 'Astigmatismo leve', CURRENT_DATE, TRUE
FROM patient p WHERE p.rut='9.876.543-3'
AND NOT EXISTS (SELECT 1 FROM prescription r WHERE r.paciente_id=p.id);

-- Camila 16.789.012-1
INSERT INTO prescription (paciente_id, od_esfera, od_cilindro, od_eje, oi_esfera, oi_cilindro, oi_eje, add_power, observaciones, fecha, activo)
SELECT p.id, -2.50, -1.00, 70, -2.25, -0.75, 80, 1.75, 'Miopía con astigmatismo', CURRENT_DATE, TRUE
FROM patient p WHERE p.rut='16.789.012-1'
AND NOT EXISTS (SELECT 1 FROM prescription r WHERE r.paciente_id=p.id);

-- Rodrigo 7.654.321-6
INSERT INTO prescription (paciente_id, od_esfera, od_cilindro, od_eje, oi_esfera, oi_cilindro, oi_eje, add_power, observaciones, fecha, activo)
SELECT p.id, -3.00, -1.25, 110, -2.75, -1.00, 95, 2.00, 'Miopía avanzada', CURRENT_DATE, TRUE
FROM patient p WHERE p.rut='7.654.321-6'
AND NOT EXISTS (SELECT 1 FROM prescription r WHERE r.paciente_id=p.id);

-- Valentina 18.234.567-9
INSERT INTO prescription (paciente_id, od_esfera, od_cilindro, od_eje, oi_esfera, oi_cilindro, oi_eje, add_power, observaciones, fecha, activo)
SELECT p.id, -0.50, -0.25, 95, -0.75, -0.25, 85, 1.00, 'Leve corrección', CURRENT_DATE, TRUE
FROM patient p WHERE p.rut='18.234.567-9'
AND NOT EXISTS (SELECT 1 FROM prescription r WHERE r.paciente_id=p.id);

-- Javier 20.135.579-6
INSERT INTO prescription (paciente_id, od_esfera, od_cilindro, od_eje, oi_esfera, oi_cilindro, oi_eje, add_power, observaciones, fecha, activo)
SELECT p.id, -1.75, -0.75, 90, -1.50, -0.50, 100, 1.25, 'Astigmatismo moderado', CURRENT_DATE, TRUE
FROM patient p WHERE p.rut='20.135.579-6'
AND NOT EXISTS (SELECT 1 FROM prescription r WHERE r.paciente_id=p.id);

-- Sofía 14.902.468-9
INSERT INTO prescription (paciente_id, od_esfera, od_cilindro, od_eje, oi_esfera, oi_cilindro, oi_eje, add_power, observaciones, fecha, activo)
SELECT p.id, -2.00, -0.50, 80, -1.50, -0.25, 85, 1.50, 'Miopía media', CURRENT_DATE, TRUE
FROM patient p WHERE p.rut='14.902.468-9'
AND NOT EXISTS (SELECT 1 FROM prescription r WHERE r.paciente_id=p.id);

-- =========================
-- Boletas: 1–2 por paciente
-- =========================
-- Para evitar duplicados, se usa NOT EXISTS por (paciente_id, detalle)

-- Carlos
INSERT INTO invoice (paciente_id, prescription_id, fecha, total, detalle, anulado)
SELECT p.id, r.id, CURRENT_DATE, 15000, 'Consulta y evaluación', FALSE
FROM patient p JOIN prescription r ON r.paciente_id=p.id
WHERE p.rut='12.345.678-5'
AND NOT EXISTS (SELECT 1 FROM invoice i WHERE i.paciente_id=p.id AND i.detalle='Consulta y evaluación');

INSERT INTO invoice (paciente_id, prescription_id, fecha, total, detalle, anulado)
SELECT p.id, r.id, CURRENT_DATE, 38000, 'Lentes monofocales', FALSE
FROM patient p JOIN prescription r ON r.paciente_id=p.id
WHERE p.rut='12.345.678-5'
AND NOT EXISTS (SELECT 1 FROM invoice i WHERE i.paciente_id=p.id AND i.detalle='Lentes monofocales');

-- Daniela (solo 1 boleta)
INSERT INTO invoice (paciente_id, prescription_id, fecha, total, detalle, anulado)
SELECT p.id, r.id, CURRENT_DATE, 42000, 'Lentes con antirreflejo', FALSE
FROM patient p JOIN prescription r ON r.paciente_id=p.id
WHERE p.rut='15.123.456-9'
AND NOT EXISTS (SELECT 1 FROM invoice i WHERE i.paciente_id=p.id AND i.detalle='Lentes con antirreflejo');

-- Felipe (2 boletas)
INSERT INTO invoice (paciente_id, prescription_id, fecha, total, detalle, anulado)
SELECT p.id, r.id, CURRENT_DATE, 12000, 'Armazón básico', FALSE
FROM patient p JOIN prescription r ON r.paciente_id=p.id
WHERE p.rut='9.876.543-3'
AND NOT EXISTS (SELECT 1 FROM invoice i WHERE i.paciente_id=p.id AND i.detalle='Armazón básico');

INSERT INTO invoice (paciente_id, prescription_id, fecha, total, detalle, anulado)
SELECT p.id, r.id, CURRENT_DATE, 18000, 'Cristales orgánicos', FALSE
FROM patient p JOIN prescription r ON r.paciente_id=p.id
WHERE p.rut='9.876.543-3'
AND NOT EXISTS (SELECT 1 FROM invoice i WHERE i.paciente_id=p.id AND i.detalle='Cristales orgánicos');

-- Camila (1 boleta)
INSERT INTO invoice (paciente_id, prescription_id, fecha, total, detalle, anulado)
SELECT p.id, r.id, CURRENT_DATE, 52000, 'Lentes bifocales', FALSE
FROM patient p JOIN prescription r ON r.paciente_id=p.id
WHERE p.rut='16.789.012-1'
AND NOT EXISTS (SELECT 1 FROM invoice i WHERE i.paciente_id=p.id AND i.detalle='Lentes bifocales');

-- Rodrigo (2 boletas)
INSERT INTO invoice (paciente_id, prescription_id, fecha, total, detalle, anulado)
SELECT p.id, r.id, CURRENT_DATE, 8000, 'Mantención y ajuste', FALSE
FROM patient p JOIN prescription r ON r.paciente_id=p.id
WHERE p.rut='7.654.321-6'
AND NOT EXISTS (SELECT 1 FROM invoice i WHERE i.paciente_id=p.id AND i.detalle='Mantención y ajuste');

INSERT INTO invoice (paciente_id, prescription_id, fecha, total, detalle, anulado)
SELECT p.id, r.id, CURRENT_DATE, 60000, 'Lentes progresivos', FALSE
FROM patient p JOIN prescription r ON r.paciente_id=p.id
WHERE p.rut='7.654.321-6'
AND NOT EXISTS (SELECT 1 FROM invoice i WHERE i.paciente_id=p.id AND i.detalle='Lentes progresivos');

-- Valentina (1 boleta)
INSERT INTO invoice (paciente_id, prescription_id, fecha, total, detalle, anulado)
SELECT p.id, r.id, CURRENT_DATE, 20000, 'Gafas de lectura', FALSE
FROM patient p JOIN prescription r ON r.paciente_id=p.id
WHERE p.rut='18.234.567-9'
AND NOT EXISTS (SELECT 1 FROM invoice i WHERE i.paciente_id=p.id AND i.detalle='Gafas de lectura');

-- Javier (2 boletas)
INSERT INTO invoice (paciente_id, prescription_id, fecha, total, detalle, anulado)
SELECT p.id, r.id, CURRENT_DATE, 25000, 'Lentes filtro azul', FALSE
FROM patient p JOIN prescription r ON r.paciente_id=p.id
WHERE p.rut='20.135.579-6'
AND NOT EXISTS (SELECT 1 FROM invoice i WHERE i.paciente_id=p.id AND i.detalle='Lentes filtro azul');

INSERT INTO invoice (paciente_id, prescription_id, fecha, total, detalle, anulado)
SELECT p.id, r.id, CURRENT_DATE, 5000, 'Estuche y paño', FALSE
FROM patient p JOIN prescription r ON r.paciente_id=p.id
WHERE p.rut='20.135.579-6'
AND NOT EXISTS (SELECT 1 FROM invoice i WHERE i.paciente_id=p.id AND i.detalle='Estuche y paño');

-- Sofía (1 boleta)
INSERT INTO invoice (paciente_id, prescription_id, fecha, total, detalle, anulado)
SELECT p.id, r.id, CURRENT_DATE, 30000, 'Cristales policarbonato', FALSE
FROM patient p JOIN prescription r ON r.paciente_id=p.id
WHERE p.rut='14.902.468-9'
AND NOT EXISTS (SELECT 1 FROM invoice i WHERE i.paciente_id=p.id AND i.detalle='Cristales policarbonato');
