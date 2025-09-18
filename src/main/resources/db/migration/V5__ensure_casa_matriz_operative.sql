-- V5__ensure_casa_matriz_operative.sql
-- Asegura la existencia del operativo "Operativo Casa Matriz" para la fecha actual

INSERT INTO operative (nombre, lugar, direccion, fecha, observaciones, activo)
SELECT 'Operativo Casa Matriz', 'Casa Matriz', 'Casa Matriz 100', CURRENT_DATE, 'Sede principal', TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM operative WHERE nombre='Operativo Casa Matriz' AND fecha=CURRENT_DATE
);

