-- Agregar columna comuna a patient y operative (solo si no existen)
ALTER TABLE patient ADD COLUMN IF NOT EXISTS comuna VARCHAR(120);
ALTER TABLE operative ADD COLUMN IF NOT EXISTS comuna VARCHAR(120);

