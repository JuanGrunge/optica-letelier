-- Seed mínimo para login real en Postgres
-- Nota: PasswordEncoder delegante acepta {noop} y {bcrypt}. Para pruebas iniciales usamos {noop}.
-- Cambia a {bcrypt} en cuanto valides el flujo.

INSERT INTO app_user (username, password, role, enabled) VALUES
  ('admin',    '{noop}admin123',    'ADMIN',   TRUE)
ON CONFLICT (username) DO NOTHING;

INSERT INTO app_user (username, password, role, enabled) VALUES
  ('optico',   '{noop}optico123',   'OPTICO',  TRUE)
ON CONFLICT (username) DO NOTHING;

INSERT INTO app_user (username, password, role, enabled) VALUES
  ('receptor', '{noop}receptor123', 'RECEPTOR', TRUE)
ON CONFLICT (username) DO NOTHING;

