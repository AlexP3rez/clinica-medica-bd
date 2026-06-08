-- SCRIPT 05: DATOS DE PRUEBA

BEGIN;

-- ESPECIALIDADES (5)
INSERT INTO especialidades (nombre, descripcion) VALUES
    ('Medicina General',   'Atención primaria y consulta general'),
    ('Cardiología',        'Diagnóstico y tratamiento de enfermedades cardiovasculares'),
    ('Pediatría',          'Atención médica a niños y adolescentes'),
    ('Dermatología',       'Enfermedades de la piel, cabello y uñas'),
    ('Ginecología',        'Salud reproductiva y sistema reproductor femenino');


-- MÉDICOS (10 — 2 por especialidad)
INSERT INTO medicos (especialidad_id, nombres, apellidos, numero_colegiado) VALUES
    (1, 'Roberto',   'López Fuentes',     'MG-001'),
    (1, 'Carmen',    'Salazar Mendoza',   'MG-002'),
    (2, 'Andrés',    'Morales Cifuentes', 'CA-001'),
    (2, 'Patricia',  'Herrera Sandoval',  'CA-002'),
    (3, 'Miguel',    'García Reyes',      'PE-001'),
    (3, 'Sandra',    'Velásquez Cruz',    'PE-002'),
    (4, 'Fernando',  'Castillo Juárez',   'DE-001'),
    (4, 'Lucía',     'Ramírez Torres',    'DE-002'),
    (5, 'Carlos',    'Díaz Camposeco',    'GI-001'),
    (5, 'María',     'Pérez Santos',      'GI-002');


-- HORARIOS (5 días/semana por médico = 50 registros)
-- Médicos 1-5: turno mañana 08:00-13:00
-- Médicos 6-10: turno tarde 14:00-19:00
DO $$
DECLARE
    v_medico INT;
    v_dia    INT;
BEGIN
    FOR v_medico IN 1..10 LOOP
        FOR v_dia IN 1..5 LOOP
            IF v_medico <= 5 THEN
                INSERT INTO horarios_medico (medico_id, dia_semana, hora_inicio, hora_fin)
                VALUES (v_medico, v_dia, '08:00', '13:00');
            ELSE
                INSERT INTO horarios_medico (medico_id, dia_semana, hora_inicio, hora_fin)
                VALUES (v_medico, v_dia, '14:00', '19:00');
            END IF;
        END LOOP;
    END LOOP;
END;
$$;


-- PACIENTES (30 con edades variadas)
INSERT INTO pacientes (dpi, nombres, apellidos, fecha_nacimiento, telefono) VALUES
    ('1234567890101', 'Ana María',       'González López',     '1985-03-15', '55551001'),
    ('2345678901202', 'Juan Carlos',     'Pérez Morales',      '1990-07-22', '55551002'),
    ('3456789012303', 'María Elena',     'Rodríguez Cifuentes','2010-11-08', '55551003'),
    ('4567890123404', 'Pedro Antonio',   'Hernández García',   '1978-01-30', '55551004'),
    ('5678901234505', 'Sofía Isabel',    'Martínez Cruz',      '2015-05-19', '55551005'),
    ('6789012345606', 'Luis Fernando',   'López Sandoval',     '1965-09-12', '55551006'),
    ('7890123456707', 'Gabriela',        'Vasquez Reyes',      '1995-04-03', '55551007'),
    ('8901234567808', 'Diego Alejandro', 'Fuentes Juárez',     '2001-12-25', '55551008'),
    ('9012345678909', 'Valentina',       'Morales Torres',     '2018-06-14', '55551009'),
    ('0123456789010', 'Roberto Carlos',  'Salazar Mendez',     '1972-08-07', '55551010'),
    ('1122334455011', 'Elena Patricia',  'Castro Herrera',     '1988-02-28', '55551011'),
    ('2233445566122', 'Marco Antonio',   'Lima Revolorio',     '1983-10-16', '55551012'),
    ('3344556677233', 'Claudia María',   'Ajú Tipaz',          '1992-07-05', '55551013'),
    ('4455667788344', 'Héctor Manuel',   'Chavarría Coché',    '2005-03-21', '55551014'),
    ('5566778899455', 'Roxana Beatriz',  'Quiñónez Choc',      '1970-11-30', '55551015'),
    ('6677889900566', 'Julio César',     'Acabal Ixcoy',       '1998-09-09', '55551016'),
    ('7788990011677', 'Norma Consuelo',  'Chacón Tzul',        '1960-04-17', '55551017'),
    ('8899001122788', 'Oscar Renato',    'Coyoy Ajpacajá',     '2003-12-01', '55551018'),
    ('9900112233899', 'Iris Marleny',    'Bamac Socop',        '1993-06-23', '55551019'),
    ('0011223344900', 'Erick Javier',    'Tux Cuc',            '1987-01-11', '55551020'),
    ('1023456789001', 'Brenda Liseth',   'Soch Quiej',         '2012-08-18', '55551021'),
    ('2034567890102', 'Kevin Josué',     'Noj Tzep',           '2008-03-07', '55551022'),
    ('3045678901203', 'Wendy Carolina',  'Ajú Calel',          '1975-10-24', '55551023'),
    ('4056789012304', 'Emmanuel',        'Tzul Xiloj',         '1999-05-31', '55551024'),
    ('5067890123405', 'Dulce María',     'Coché Velásquez',    '2016-01-13', '55551025'),
    ('6078901234506', 'Freddy Ariel',    'Batz Socop',         '1968-07-04', '55551026'),
    ('7089012345607', 'Sandra Yolanda',  'Ujpán Xuc',          '1996-11-22', '55551027'),
    ('8090123456708', 'Armando',         'Miculax Saquic',     '1980-04-09', '55551028'),
    ('9001234567809', 'Lesvia Estela',   'Xum Cholotío',       '2007-09-15', '55551029'),
    ('0012345678910', 'Rodrigo Alonso',  'Itzep Mendoza',      '1962-12-28', '55551030');


-- SERVICIOS (15)
INSERT INTO servicios (nombre, precio_actual) VALUES
    ('Consulta General',           150.00),
    ('Consulta Especializada',     250.00),
    ('Electrocardiograma',         350.00),
    ('Ultrasonido',                400.00),
    ('Análisis de Sangre',         180.00),
    ('Perfil Lipídico',            220.00),
    ('Consulta Pediátrica',        200.00),
    ('Vacuna (aplicación)',         80.00),
    ('Biopsia de Piel',            500.00),
    ('Consulta Dermatológica',     280.00),
    ('Papanicolaou',               300.00),
    ('Ultrasonido Obstétrico',     450.00),
    ('Control Prenatal',           200.00),
    ('Inyección / Curación',        60.00),
    ('Certificado Médico',         120.00);


-- CITAS (200 distribuidas en los últimos 6 meses)
-- 120 atendidas | 40 programadas | 20 confirmadas
-- 15 canceladas | 5 no_asistio
DO $$
DECLARE
    v_i           INT;
    v_paciente_id INT;
    v_medico_id   INT;
    v_fecha       DATE;
    v_hora        TIME;
    v_estado      VARCHAR;
    v_motivo      TEXT;
    horas_manana  TIME[] := ARRAY['08:00','08:30','09:00','09:30','10:00',
                                  '10:30','11:00','11:30','12:00','12:30']::TIME[];
    horas_tarde   TIME[] := ARRAY['14:00','14:30','15:00','15:30','16:00',
                                  '16:30','17:00','17:30','18:00','18:30']::TIME[];
    motivos       TEXT[] := ARRAY[
        'Paciente no pudo asistir por trabajo',
        'Emergencia familiar',
        'Se recuperó espontáneamente',
        'Reagendó para la siguiente semana',
        'Viaje imprevisto'
    ];
BEGIN
    FOR v_i IN 1..200 LOOP
        v_paciente_id := (v_i % 30) + 1;
        v_medico_id   := (v_i % 10) + 1;
        v_fecha       := CURRENT_DATE - ((v_i * 0.9)::INT % 180);

        IF v_medico_id <= 5 THEN
            v_hora := horas_manana[((v_i - 1) % 10) + 1];
        ELSE
            v_hora := horas_tarde[((v_i - 1) % 10) + 1];
        END IF;

        IF v_i <= 120 THEN
            v_estado := 'atendida';
            v_motivo := NULL;
        ELSIF v_i <= 140 THEN
            v_estado := 'programada';
            v_motivo := NULL;
        ELSIF v_i <= 160 THEN
            v_estado := 'confirmada';
            v_motivo := NULL;
        ELSIF v_i <= 175 THEN
            v_estado := 'cancelada';
            v_motivo := motivos[((v_i - 1) % 5) + 1];
        ELSE
            v_estado := 'no_asistio';
            v_motivo := NULL;
        END IF;

        BEGIN
            INSERT INTO citas (paciente_id, medico_id, fecha, hora, estado, motivo_cancelacion)
            VALUES (v_paciente_id, v_medico_id, v_fecha, v_hora, v_estado, v_motivo);
        EXCEPTION
            WHEN unique_violation THEN
                BEGIN
                    INSERT INTO citas (paciente_id, medico_id, fecha, hora, estado, motivo_cancelacion)
                    VALUES (v_paciente_id, v_medico_id, v_fecha,
                            v_hora + INTERVAL '15 minutes', v_estado, v_motivo);
                EXCEPTION
                    WHEN OTHERS THEN NULL;
                END;
        END;
    END LOOP;
END;
$$;


-- FACTURAS (100 — una por cada cita atendida, primeras 100)
DO $$
DECLARE
    v_cita      RECORD;
    v_serv_id   INT;
    v_precio    NUMERIC;
    v_total     NUMERIC;
    v_i         INT := 0;
BEGIN
    FOR v_cita IN
        SELECT id, medico_id FROM citas WHERE estado = 'atendida' ORDER BY id LIMIT 100
    LOOP
        v_i := v_i + 1;

        v_serv_id := CASE
            WHEN v_cita.medico_id IN (1,2) THEN 1
            WHEN v_cita.medico_id IN (3,4) THEN 2
            WHEN v_cita.medico_id IN (5,6) THEN 7
            WHEN v_cita.medico_id IN (7,8) THEN 10
            ELSE 13
        END;

        SELECT precio_actual INTO v_precio FROM servicios WHERE id = v_serv_id;
        v_total := v_precio;
        IF v_i % 3 = 0 THEN
            v_total := v_total + 180.00;
        END IF;

        INSERT INTO facturas (cita_id, fecha_emision, total, estado)
        VALUES (v_cita.id,
                NOW() - ((100 - v_i) || ' days')::INTERVAL,
                v_total,
                'pendiente');
    END LOOP;
END;
$$;


-- DETALLES DE FACTURA
DO $$
DECLARE
    v_factura RECORD;
    v_med_id  INT;
    v_serv_id INT;
    v_precio  NUMERIC;
    v_i       INT := 0;
BEGIN
    FOR v_factura IN SELECT f.id, f.cita_id FROM facturas f ORDER BY f.id LOOP
        v_i := v_i + 1;
        SELECT c.medico_id INTO v_med_id FROM citas c WHERE c.id = v_factura.cita_id;

        v_serv_id := CASE
            WHEN v_med_id IN (1,2) THEN 1
            WHEN v_med_id IN (3,4) THEN 2
            WHEN v_med_id IN (5,6) THEN 7
            WHEN v_med_id IN (7,8) THEN 10
            ELSE 13
        END;

        SELECT precio_actual INTO v_precio FROM servicios WHERE id = v_serv_id;

        INSERT INTO detalles_factura (factura_id, servicio_id, cantidad, precio_unitario)
        VALUES (v_factura.id, v_serv_id, 1, v_precio);

        IF v_i % 3 = 0 THEN
            INSERT INTO detalles_factura (factura_id, servicio_id, cantidad, precio_unitario)
            VALUES (v_factura.id, 5, 1, 180.00);
        END IF;
    END LOOP;
END;
$$;


-- PAGOS (80)
-- Facturas 1-40:  pagadas completo
-- Facturas 41-60: pagadas parcial (50%)
-- Facturas 61-100: sin pago (quedan pendiente)
DO $$
DECLARE
    v_factura RECORD;
    v_i       INT := 0;
BEGIN
    FOR v_factura IN SELECT id, total FROM facturas ORDER BY id LOOP
        v_i := v_i + 1;

        IF v_i <= 40 THEN
            INSERT INTO pagos (factura_id, monto, fecha_pago)
            VALUES (v_factura.id, v_factura.total,
                    NOW() - ((80 - v_i) || ' days')::INTERVAL);
            UPDATE facturas SET estado = 'pagada' WHERE id = v_factura.id;

        ELSIF v_i <= 60 THEN
            INSERT INTO pagos (factura_id, monto, fecha_pago)
            VALUES (v_factura.id, ROUND(v_factura.total * 0.5, 2),
                    NOW() - ((60 - v_i) || ' days')::INTERVAL);
            UPDATE facturas SET estado = 'pagada_parcial' WHERE id = v_factura.id;
        END IF;
    END LOOP;
END;
$$;


-- LOG DE AUDITORÍA (500+ entradas)
DO $$
DECLARE
    v_cita    RECORD;
    v_pago    RECORD;
    usuarios  TEXT[] := ARRAY['recepcion_maria','recepcion_carlos','recepcion_bryan',
                              'admin_sistema','recepcion_jorge','recepcion_ana'];
BEGIN
    -- Log de creación de citas (~200 entradas)
    FOR v_cita IN SELECT id FROM citas ORDER BY id LOOP
        INSERT INTO log_auditoria (entidad_afectada, entidad_id, accion, usuario, fecha_hora, detalles)
        VALUES (
            'citas', v_cita.id, 'CREACION_CITA',
            usuarios[((v_cita.id - 1) % 6) + 1],
            NOW() - ((200 - v_cita.id) || ' days')::INTERVAL,
            jsonb_build_object('estado_inicial','programada','timestamp', NOW())
        );
    END LOOP;

    -- Log de cancelaciones (~15 entradas)
    FOR v_cita IN SELECT id FROM citas WHERE estado = 'cancelada' ORDER BY id LOOP
        INSERT INTO log_auditoria (entidad_afectada, entidad_id, accion, usuario, fecha_hora, detalles)
        VALUES (
            'citas', v_cita.id, 'CANCELACION_CITA',
            usuarios[((v_cita.id - 1) % 6) + 1],
            NOW() - ((100 - (v_cita.id % 100)) || ' days')::INTERVAL,
            jsonb_build_object('estado_anterior','programada','estado_nuevo','cancelada')
        );
    END LOOP;

    -- Log de pagos (~80 entradas)
    FOR v_pago IN SELECT id, factura_id, monto FROM pagos ORDER BY id LOOP
        INSERT INTO log_auditoria (entidad_afectada, entidad_id, accion, usuario, fecha_hora, detalles)
        VALUES (
            'facturas', v_pago.factura_id, 'REGISTRO_PAGO',
            usuarios[((v_pago.id - 1) % 6) + 1],
            NOW() - ((80 - v_pago.id) || ' days')::INTERVAL,
            jsonb_build_object('monto_pagado', v_pago.monto, 'timestamp', NOW())
        );
    END LOOP;

    -- Logs de cambio de estado para llegar a 500+
    FOR v_cita IN SELECT id FROM citas WHERE estado IN ('confirmada','atendida') ORDER BY id LOOP
        INSERT INTO log_auditoria (entidad_afectada, entidad_id, accion, usuario, fecha_hora, detalles)
        VALUES (
            'citas', v_cita.id, 'CAMBIO_ESTADO_CITA',
            usuarios[((v_cita.id - 1) % 6) + 1],
            NOW() - ((100 - (v_cita.id % 100)) || ' days')::INTERVAL,
            jsonb_build_object('estado_anterior','programada','estado_nuevo','confirmada')
        );
    END LOOP;
END;
$$;

COMMIT;


-- VERIFICACIÓN DE CONTEOS POST-SEED
SELECT 'especialidades'   AS tabla, COUNT(*) AS registros FROM especialidades
UNION ALL SELECT 'medicos',          COUNT(*) FROM medicos
UNION ALL SELECT 'horarios_medico',  COUNT(*) FROM horarios_medico
UNION ALL SELECT 'pacientes',        COUNT(*) FROM pacientes
UNION ALL SELECT 'citas',            COUNT(*) FROM citas
UNION ALL SELECT 'servicios',        COUNT(*) FROM servicios
UNION ALL SELECT 'facturas',         COUNT(*) FROM facturas
UNION ALL SELECT 'detalles_factura', COUNT(*) FROM detalles_factura
UNION ALL SELECT 'pagos',            COUNT(*) FROM pagos
UNION ALL SELECT 'log_auditoria',    COUNT(*) FROM log_auditoria
ORDER BY tabla;
