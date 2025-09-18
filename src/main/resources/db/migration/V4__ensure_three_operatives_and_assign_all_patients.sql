-- V4__ensure_three_operatives_and_assign_all_patients.sql
-- Crea 3 lugares de operativo (si no existen) y asigna un operativo
-- a todos los pacientes que aún no tengan vínculo en patient_operative.

-- Asegurar 3 operativos para la fecha actual
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

INSERT INTO operative (nombre, lugar, direccion, fecha, observaciones, activo)
SELECT 'Operativo Sur', 'Consultorio Sur', 'Av. Sur 300', CURRENT_DATE, 'Jornada completa', TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM operative WHERE nombre='Operativo Sur' AND fecha=CURRENT_DATE
);

-- Asignar a cada paciente sin vínculo uno de los 3 operativos (round-robin por id)
INSERT INTO patient_operative (patient_id, operative_id)
SELECT p.id,
       (
         SELECT o.id FROM operative o
         WHERE o.nombre = CASE MOD(p.id, 3)
                            WHEN 0 THEN 'Operativo Centro'
                            WHEN 1 THEN 'Operativo Norte'
                            ELSE 'Operativo Sur'
                          END
           AND o.fecha = CURRENT_DATE
         LIMIT 1
       ) as operative_id
FROM patient p
WHERE NOT EXISTS (
  SELECT 1 FROM patient_operative x WHERE x.patient_id = p.id
);

