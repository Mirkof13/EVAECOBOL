-- =============================================================================
-- ECOBOL Tracking System — Schema SQL
-- Base de datos: PostgreSQL 15
-- Generado desde Django ORM (Python 3.14 + Django 5.1)
-- Arquitectura N-Tier: Capa de Persistencia
-- =============================================================================

-- Tabla 1: sucursales — Las 9 capitales departamentales de Bolivia
CREATE TABLE IF NOT EXISTS "sucursales" (
    "id"           BIGSERIAL    PRIMARY KEY,
    "nombre"       VARCHAR(100) NOT NULL,
    "departamento" VARCHAR(50)  NOT NULL
                   CHECK (departamento IN (
                     'La Paz','Santa Cruz','Cochabamba','Oruro',
                     'Potosi','Sucre','Tarija','Trinidad','Cobija'
                   )),
    "ciudad"       VARCHAR(100) NOT NULL,
    "direccion"    VARCHAR(200) NOT NULL,
    "telefono"     VARCHAR(20)  NOT NULL DEFAULT '',
    "activa"       BOOLEAN      NOT NULL DEFAULT TRUE
);

-- Tabla 2: estados — 6 estados del ciclo de vida de un envío (RF04)
CREATE TABLE IF NOT EXISTS "estados" (
    "id"          BIGSERIAL   PRIMARY KEY,
    "nombre"      VARCHAR(50) NOT NULL UNIQUE
                  CHECK (nombre IN (
                    'REGISTRADO','EN_TRANSITO','EN_SUCURSAL_DESTINO',
                    'EN_RUTA_ENTREGA','ENTREGADO','DEVUELTO'
                  )),
    "descripcion" TEXT        NOT NULL DEFAULT '',
    "orden"       INTEGER     NOT NULL
);

-- Tabla 3: usuarios — Sistema de roles con PBKDF2-SHA256 (RNF02)
CREATE TABLE IF NOT EXISTS "usuarios" (
    "id"             BIGSERIAL    PRIMARY KEY,
    "password"       VARCHAR(128) NOT NULL,
    "last_login"     TIMESTAMP WITH TIME ZONE,
    "is_superuser"   BOOLEAN      NOT NULL DEFAULT FALSE,
    "nombre"         VARCHAR(100) NOT NULL,
    "apellido"       VARCHAR(100) NOT NULL,
    "email"          VARCHAR(254) NOT NULL UNIQUE,
    "rol"            VARCHAR(20)  NOT NULL DEFAULT 'EMPLEADO'
                     CHECK (rol IN ('ADMIN','EMPLEADO','GERENTE')),
    "sucursal_id"    BIGINT       REFERENCES "sucursales"("id") ON DELETE SET NULL,
    "activo"         BOOLEAN      NOT NULL DEFAULT TRUE,
    "is_staff"       BOOLEAN      NOT NULL DEFAULT FALSE,
    "fecha_creacion" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "ultimo_acceso"  TIMESTAMP WITH TIME ZONE
);

-- Tabla 4: envios — Entidad central del sistema (RF01, RF02, RF07)
CREATE TABLE IF NOT EXISTS "envios" (
    "id"                    BIGSERIAL     PRIMARY KEY,
    "codigo_rastreo"        VARCHAR(20)   NOT NULL UNIQUE,   -- ECO-YYYY-XXXXX
    "remitente_nombre"      VARCHAR(100)  NOT NULL,
    "remitente_telefono"    VARCHAR(20)   NOT NULL,
    "remitente_ci"          VARCHAR(20)   NOT NULL DEFAULT '',
    "destinatario_nombre"   VARCHAR(100)  NOT NULL,
    "destinatario_telefono" VARCHAR(20)   NOT NULL,
    "destinatario_direccion" VARCHAR(200) NOT NULL,
    "descripcion"           TEXT          NOT NULL,
    "peso_kg"               NUMERIC(6,2)  NOT NULL
                            CHECK (peso_kg > 0 AND peso_kg <= 20),
    "precio_bs"             NUMERIC(8,2)  NOT NULL CHECK (precio_bs >= 0),
    "foto_envio"            VARCHAR(200),                    -- ruta relativa media/
    "fecha_registro"        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "fecha_estimada"        DATE,
    "sucursal_origen_id"    BIGINT        NOT NULL REFERENCES "sucursales"("id") ON DELETE RESTRICT,
    "sucursal_destino_id"   BIGINT        NOT NULL REFERENCES "sucursales"("id") ON DELETE RESTRICT,
    "estado_actual_id"      BIGINT        NOT NULL REFERENCES "estados"("id")    ON DELETE RESTRICT,
    "registrado_por_id"     BIGINT        NOT NULL REFERENCES "usuarios"("id")   ON DELETE RESTRICT,
    CONSTRAINT "origen_distinto_destino"
        CHECK (sucursal_origen_id <> sucursal_destino_id)
);

-- Tabla 5: historial_estados — Historial cronológico completo (RF04, RF05)
CREATE TABLE IF NOT EXISTS "historial_estados" (
    "id"               BIGSERIAL PRIMARY KEY,
    "fecha_cambio"     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "observacion"      TEXT      NOT NULL DEFAULT '',
    "envio_id"         BIGINT    NOT NULL REFERENCES "envios"("id")     ON DELETE CASCADE,
    "estado_id"        BIGINT    NOT NULL REFERENCES "estados"("id")    ON DELETE RESTRICT,
    "sucursal_id"      BIGINT    REFERENCES "sucursales"("id")          ON DELETE SET NULL,
    "actualizado_por_id" BIGINT  NOT NULL REFERENCES "usuarios"("id")  ON DELETE RESTRICT
);

-- =============================================================================
-- Índices de rendimiento (migration 0004) — RNF01: respuesta < 500ms
-- =============================================================================
CREATE INDEX IF NOT EXISTS "idx_envio_codigo"           ON "envios"           ("codigo_rastreo");
CREATE INDEX IF NOT EXISTS "idx_envio_remitente"        ON "envios"           ("remitente_nombre");
CREATE INDEX IF NOT EXISTS "idx_envio_destinatario"     ON "envios"           ("destinatario_nombre");
CREATE INDEX IF NOT EXISTS "idx_envio_fecha_registro"   ON "envios"           ("fecha_registro");
CREATE INDEX IF NOT EXISTS "idx_envio_origen_estado"    ON "envios"           ("sucursal_origen_id",  "estado_actual_id");
CREATE INDEX IF NOT EXISTS "idx_envio_destino_estado"   ON "envios"           ("sucursal_destino_id", "estado_actual_id");
CREATE INDEX IF NOT EXISTS "idx_historial_envio_fecha"  ON "historial_estados" ("envio_id", "fecha_cambio");
