-- SCRIPT 01: SCHEMA COMPLETO

-- TABLAS: FLUJO CITAS / AGENDA

CREATE TABLE especialidades (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT
);

CREATE TABLE medicos (
    id               SERIAL PRIMARY KEY,
    especialidad_id  INT          NOT NULL REFERENCES especialidades(id),
    nombres          VARCHAR(100) NOT NULL,
    apellidos        VARCHAR(100) NOT NULL,
    -- El colegiado debe ser UNIQUE para asegurar que no se ingrese dos veces al mismo profesional por un error de digitación.
    numero_colegiado VARCHAR(50)  NOT NULL UNIQUE
);

CREATE TABLE horarios_medico (
    id          SERIAL PRIMARY KEY,
    medico_id   INT  NOT NULL REFERENCES medicos(id),
    -- Limitamos el rango de 1 a 7 para mapear los días de la semana de forma estándar.
    dia_semana  INT  NOT NULL CHECK (dia_semana BETWEEN 1 AND 7),
    hora_inicio TIME NOT NULL,
    hora_fin    TIME NOT NULL,
    -- Este CHECK valida la coherencia temporal. Frena directamente en la base de datos que alguien intente registrar una hora de salida anterior a la hora de entrada.
    CHECK (hora_inicio < hora_fin),
    UNIQUE (medico_id, dia_semana)
);

CREATE TABLE pacientes (
    id               SERIAL PRIMARY KEY,
    -- El DPI se define como VARCHAR y no como INT o BIGINT porque puede contener ceros a la izquierda que se perderían al tratarse como un número.
    dpi              VARCHAR(20)  NOT NULL UNIQUE,
    nombres          VARCHAR(100) NOT NULL,
    apellidos        VARCHAR(100) NOT NULL,
    -- Guardar la fecha de nacimiento es un requerimiento técnico oculto para MongoDB. Necesitamos este dato aquí para poder inyectar la "edad" y ejecutar el pipeline del RC-09.
    fecha_nacimiento DATE         NOT NULL,
    telefono         VARCHAR(20)
);

CREATE TABLE citas (
    id                 SERIAL PRIMARY KEY,
    paciente_id        INT         NOT NULL REFERENCES pacientes(id),
    medico_id          INT         NOT NULL REFERENCES medicos(id),
    fecha              DATE        NOT NULL,
    hora               TIME        NOT NULL,
    estado             VARCHAR(20) NOT NULL DEFAULT 'programada'
                           CHECK (estado IN ('programada','confirmada','atendida','cancelada','no_asistio')),
    motivo_cancelacion TEXT,
    -- Restricción condicional. Obliga a que si la cita cambia a estado 'cancelada', el campo motivo_cancelacion no puede venir vacío. Protege la regla de negocio desde la raíz.
    CONSTRAINT chk_motivo_cancelacion
        CHECK (estado <> 'cancelada' OR motivo_cancelacion IS NOT NULL)
);

-- TABLAS: FLUJO FACTURACIÓN / PAGOS

CREATE TABLE servicios (
    id            SERIAL PRIMARY KEY,
    nombre        VARCHAR(150)  NOT NULL,
    -- Previene inconsistencias financieras. Nadie puede registrar un servicio gratis o con precio negativo.
    precio_actual NUMERIC(10,2) NOT NULL CHECK (precio_actual > 0)
);

CREATE TABLE facturas (
    id            SERIAL PRIMARY KEY,
    cita_id       INT           NOT NULL REFERENCES citas(id),
    fecha_emision TIMESTAMP     NOT NULL DEFAULT NOW(),
    total         NUMERIC(10,2) NOT NULL CHECK (total > 0),
    estado        VARCHAR(20)   NOT NULL DEFAULT 'pendiente'
                      -- Limita estrictamente los estados permitidos del ciclo de facturación.
                      CHECK (estado IN ('pendiente','pagada_parcial','pagada','anulada'))
);

CREATE TABLE detalles_factura (
    id              SERIAL PRIMARY KEY,
    factura_id      INT           NOT NULL REFERENCES facturas(id),
    servicio_id     INT           NOT NULL REFERENCES servicios(id),
    cantidad        INT           NOT NULL CHECK (cantidad > 0),
    -- Se guarda una copia estática del precio en el momento exacto de la venta. Si el servicio sube de precio mañana, las facturas históricas no sufren alteraciones.
    precio_unitario NUMERIC(10,2) NOT NULL CHECK (precio_unitario >= 0),
    -- Columna calculada de forma nativa por PostgreSQL. Evita que un error en la capa de aplicación (Node.js) inserte un subtotal matemático incorrecto.
    subtotal        NUMERIC(10,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED
);

CREATE TABLE pagos (
    id         SERIAL PRIMARY KEY,
    factura_id INT           NOT NULL REFERENCES facturas(id),
    -- Bloqueo preventivo contra ingresos de dinero negativos que cuadren mal el saldo de la factura.
    monto      NUMERIC(10,2) NOT NULL CHECK (monto > 0),
    fecha_pago TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE TABLE log_auditoria (
    id               SERIAL PRIMARY KEY,
    entidad_afectada VARCHAR(50)  NOT NULL,
    entidad_id       INT          NOT NULL,
    accion           VARCHAR(100) NOT NULL,
    usuario          VARCHAR(100) NOT NULL,
    fecha_hora       TIMESTAMP    NOT NULL DEFAULT NOW(),
    -- Tabla intencionalmente desacoplada (sin Foreign Keys). Usamos relación polimórfica y JSONB para guardar un "snapshot" de la acción. Así, si se elimina el registro operativo original por un borrado en cascada, la bitácora de auditoría queda intacta e inmutable.
    detalles         JSONB
);

-- INDICES JUSTIFICADOS

-- Este índice compuesto es la base técnica para prevenir que un médico tenga dos citas a la misma hora. Acelera el proceso para evitar escaneos secuenciales (Seq Scan).
CREATE INDEX idx_citas_medico_fecha
    ON citas (medico_id, fecha);

-- Indice Único PARCIAL. Crucial explicar esto: usamos el WHERE para excluir las citas canceladas. Así, si el paciente cancela su cita de la mañana, el motor sí le permite volver a agendar en la tarde con el mismo médico. Un UNIQUE normal nos bloquearía ese flujo válido de negocio.
CREATE UNIQUE INDEX idx_cita_paciente_medico_dia
    ON citas (paciente_id, medico_id, fecha)
    WHERE estado NOT IN ('cancelada', 'no_asistio');

-- Indice B-Tree clásico para acelerar transacciones exactas cuando el paciente llega a recepción y da su número de documento.
CREATE UNIQUE INDEX idx_pacientes_dpi
    ON pacientes (dpi);

-- Optimización para la Vista 2 (RC-02). Como la clínica necesita ver facturas pendientes constantemente, este índice agiliza ese filtro específico.
CREATE INDEX idx_facturas_estado
    ON facturas (estado);

-- Acelera la suma matemática "SUM(monto)" que hace el stored procedure (OC-01) al momento de recalcular el saldo pendiente tras un abono.
CREATE INDEX idx_pagos_factura_id
    ON pagos (factura_id);

-- Necesario para rastrear rápidamente todo el ciclo de vida de un solo registro (ejemplo: buscar en la bitácora todo lo que le pasó a la factura ID 50).
CREATE INDEX idx_auditoria_entidad
    ON log_auditoria (entidad_afectada, entidad_id);