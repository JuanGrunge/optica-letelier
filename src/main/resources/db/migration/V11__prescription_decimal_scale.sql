-- Ensure prescription numeric fields use DECIMAL(x,2) with two decimal places
-- Works on PostgreSQL and H2

ALTER TABLE prescription
  ALTER COLUMN od_esfera TYPE DECIMAL(6,2);
ALTER TABLE prescription
  ALTER COLUMN od_cilindro TYPE DECIMAL(6,2);
ALTER TABLE prescription
  ALTER COLUMN oi_esfera TYPE DECIMAL(6,2);
ALTER TABLE prescription
  ALTER COLUMN oi_cilindro TYPE DECIMAL(6,2);
ALTER TABLE prescription
  ALTER COLUMN add_power TYPE DECIMAL(6,2);

-- Axis to DECIMAL too, but keep integer semantics at app level
ALTER TABLE prescription
  ALTER COLUMN od_eje TYPE DECIMAL(5,2);
ALTER TABLE prescription
  ALTER COLUMN oi_eje TYPE DECIMAL(5,2);

