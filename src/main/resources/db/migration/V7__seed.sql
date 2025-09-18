-- V7__seed.sql
-- Agrega created_at a patient de forma segura e idempotente

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patient' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE patient ADD COLUMN created_at TIMESTAMP;
  END IF;
END $$;

-- Establecer valores por defecto donde esté nulo
UPDATE patient SET created_at = NOW() WHERE created_at IS NULL;

