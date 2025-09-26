-- Ensure operatives default to inactive and normalize existing rows
ALTER TABLE operative ALTER COLUMN activo SET DEFAULT FALSE;
UPDATE operative SET activo = FALSE WHERE activo IS DISTINCT FROM FALSE;

