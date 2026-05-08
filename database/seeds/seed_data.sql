-- =============================================================================
-- ECOBOL — Datos de prueba (seeds)
-- Ejecutar DESPUÉS de schema.sql o después de: python manage.py migrate
-- Para Django: python manage.py shell < backend/seed_data.py
-- =============================================================================

-- 1. Estados (6 estados del ciclo de vida — RF04)
INSERT INTO "estados" ("nombre", "descripcion", "orden") VALUES
  ('REGISTRADO',          'Envío registrado en la sucursal de origen',            1),
  ('EN_TRANSITO',         'Envío en tránsito entre sucursales',                   2),
  ('EN_SUCURSAL_DESTINO', 'Envío llegó a la sucursal de destino',                 3),
  ('EN_RUTA_ENTREGA',     'Envío en ruta hacia el domicilio del destinatario',    4),
  ('ENTREGADO',           'Envío entregado correctamente al destinatario',        5),
  ('DEVUELTO',            'Envío devuelto a la sucursal de origen',               6)
ON CONFLICT (nombre) DO NOTHING;

-- 2. Sucursales (9 capitales departamentales de Bolivia — UC09)
INSERT INTO "sucursales" ("nombre", "departamento", "ciudad", "direccion", "telefono", "activa") VALUES
  ('Sucursal Central La Paz',  'La Paz',     'La Paz',     'Av. Mariscal Santa Cruz 1392, Edif. Cámara de Comercio', '222312345', TRUE),
  ('Sucursal Santa Cruz',      'Santa Cruz', 'Santa Cruz', 'Av. Monseñor Rivero 320, Centro Comercial El Dorado',    '333456789', TRUE),
  ('Sucursal Cochabamba',      'Cochabamba', 'Cochabamba', 'Av. Heroínas 542 esq. 25 de Mayo',                       '444234567', TRUE),
  ('Sucursal Oruro',           'Oruro',      'Oruro',      'Calle La Plata 456 esq. Pagador',                        '522345678', TRUE),
  ('Sucursal Potosí',          'Potosi',     'Potosí',     'Calle Padilla 123, Plaza 10 de Noviembre',               '622345678', TRUE),
  ('Sucursal Sucre',           'Sucre',      'Sucre',      'Av. del Ejército 123, frente al Parque Bolívar',         '644123456', TRUE),
  ('Sucursal Tarija',          'Tarija',     'Tarija',     'Calle Colón 890 esq. General Trigo',                     '666234567', TRUE),
  ('Sucursal Trinidad',        'Trinidad',   'Trinidad',   'Av. 6 de Agosto 234, frente a la Plazuela Loreto',       '464789012', TRUE),
  ('Sucursal Cobija',          'Cobija',     'Cobija',     'Av. Internacional 78, Zona Norte',                       '389012345', TRUE)
ON CONFLICT DO NOTHING;

-- 3. Usuarios
-- IMPORTANTE: Las contraseñas deben ser hasheadas con Django PBKDF2-SHA256.
-- Use: python manage.py shell < backend/seed_data.py
-- Las contraseñas en texto plano son:
--   admin@ecobol.bo    → Admin2026!
--   gerente@ecobol.bo  → Gerente2026!
--   empleado@ecobol.bo → Empleado2026!
--
-- Insertar directamente en SQL requiere el hash generado por Django, ej.:
--   pbkdf2_sha256$870000$<salt>$<hash>
-- Se recomienda usar seed_data.py con el ORM de Django en su lugar.

-- 4. Envíos de ejemplo (requiere usuarios y sucursales cargados)
-- Ejecutar solo después de tener usuarios creados con el ORM de Django.
--
-- Ejemplo de envío:
-- INSERT INTO "envios" (
--   "codigo_rastreo","remitente_nombre","remitente_telefono","remitente_ci",
--   "destinatario_nombre","destinatario_telefono","destinatario_direccion",
--   "descripcion","peso_kg","precio_bs",
--   "sucursal_origen_id","sucursal_destino_id","estado_actual_id","registrado_por_id"
-- ) VALUES (
--   'ECO-2026-A1B2C', 'Juan Quispe Mamani', '70012345', '12345678 LP',
--   'Ana Condori Flores', '71234567', 'Calle Murillo 45, Santa Cruz',
--   'Documentos notariales', 1.50, 32.50,
--   1, 2, 1, 1
-- );
