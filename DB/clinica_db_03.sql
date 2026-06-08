-- SCRIPT 03: STORED PROCEDURES

-- cancelar_cita
CREATE OR REPLACE PROCEDURE cancelar_cita(
    p_cita_id INT,
    p_motivo  TEXT,
    p_usuario VARCHAR DEFAULT 'sistema'
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_estado_actual VARCHAR;
BEGIN
    -- Implementamos un bloqueo pesimista a nivel de fila (Row-Level Lock) usando FOR UPDATE. 
    -- Si dos recepcionistas intentan cancelar esta misma cita en el mismo milisegundo, la base de datos 
    -- encola la segunda petición. Esto previene la "Condición de Carrera" (Race Condition) y asegura la consistencia.
    SELECT estado
    INTO   v_estado_actual
    FROM   citas
    WHERE  id = p_cita_id
    FOR UPDATE;

    -- Bloque de validaciones en cascada. El procedure actúa como un guardián; 
    -- si alguna de estas reglas se rompe, se lanza una excepción y la transacción se aborta inmediatamente sin alterar datos.
    IF NOT FOUND THEN
        RAISE EXCEPTION 'ERROR: La cita con id % no existe.', p_cita_id;
    END IF;

    IF v_estado_actual = 'atendida' THEN
        RAISE EXCEPTION 'ERROR: No se puede cancelar una cita con estado "atendida". ID: %', p_cita_id;
    END IF;

    IF v_estado_actual = 'cancelada' THEN
        RAISE EXCEPTION 'ERROR: La cita % ya se encuentra cancelada.', p_cita_id;
    END IF;

    -- Validación estricta del motivo. Usamos TRIM para evitar que envíen espacios en blanco engañando al sistema.
    IF p_motivo IS NULL OR TRIM(p_motivo) = '' THEN
        RAISE EXCEPTION 'ERROR: El motivo de cancelación es obligatorio (RN-07).';
    END IF;

    -- Actualizar la cita
    UPDATE citas
    SET    estado             = 'cancelada',
           motivo_cancelacion = p_motivo
    WHERE  id = p_cita_id;

    -- La auditoría se inserta dentro de la misma transacción. 
    -- Esto garantiza el principio de Atomicidad (ACID). Si el UPDATE falla o si este INSERT falla, 
    -- no se guarda ninguno de los dos. Es "todo o nada".
    INSERT INTO log_auditoria (entidad_afectada, entidad_id, accion, usuario, detalles)
    VALUES (
        'citas',
        p_cita_id,
        'CANCELACION_CITA',
        p_usuario,
        jsonb_build_object(
            'estado_anterior', v_estado_actual,
            'estado_nuevo',    'cancelada',
            'motivo',          p_motivo,
            'timestamp',       NOW()
        )
    );

EXCEPTION
    -- Capturador de errores global. Si alguna regla falló o hubo un error de constraint, 
    -- PostgreSQL hace un ROLLBACK implícito de los datos, y re-lanzamos el mensaje (RAISE) para que la API en Node.js capture el texto exacto.
    WHEN OTHERS THEN
        RAISE;
END;
$$;


-- registrar_pago
CREATE OR REPLACE PROCEDURE registrar_pago(
    p_factura_id INT,
    p_monto      NUMERIC,
    p_usuario    VARCHAR DEFAULT 'sistema'
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_estado_factura  VARCHAR;
    v_total_factura   NUMERIC;
    v_total_pagado    NUMERIC;
    v_saldo_pendiente NUMERIC;
    v_nuevo_estado    VARCHAR;
BEGIN
    -- Igual que en citas, bloqueamos la factura. Evitamos que dos pagos simultáneos (ej. una transferencia y un pago en efectivo al mismo tiempo) sobregiren el saldo de la factura por leer el mismo saldo inicial.
    SELECT estado, total
    INTO   v_estado_factura, v_total_factura
    FROM   facturas
    WHERE  id = p_factura_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'ERROR: La factura con id % no existe.', p_factura_id;
    END IF;

    IF v_estado_factura = 'anulada' THEN
        RAISE EXCEPTION 'ERROR: No se pueden registrar pagos sobre facturas anuladas (RN-05). Factura: %', p_factura_id;
    END IF;

    IF v_estado_factura = 'pagada' THEN
        RAISE EXCEPTION 'ERROR: La factura % ya está completamente pagada.', p_factura_id;
    END IF;

    IF p_monto <= 0 THEN
        RAISE EXCEPTION 'ERROR: El monto debe ser mayor a cero. Recibido: %', p_monto;
    END IF;

    -- Calculamos lo que ya se ha pagado en tiempo real sumando la tabla de pagos. 
    -- COALESCE asegura que si es el primer pago (y la suma da NULL), se convierta en un 0 para que la matemática no falle.
    SELECT COALESCE(SUM(monto), 0)
    INTO   v_total_pagado
    FROM   pagos
    WHERE  factura_id = p_factura_id;

    v_saldo_pendiente := v_total_factura - v_total_pagado;

    -- Aquí el motor valida que no nos estén pagando de más. Si el abono excede la deuda actual, rechaza la transacción.
    IF p_monto > v_saldo_pendiente THEN
        RAISE EXCEPTION 'ERROR: El monto Q% excede el saldo pendiente de Q% (RN-04). Factura: %',
                        p_monto, v_saldo_pendiente, p_factura_id;
    END IF;

    -- Insertar el pago
    INSERT INTO pagos (factura_id, monto, fecha_pago)
    VALUES (p_factura_id, p_monto, NOW());

    -- Recalcular total pagado con el nuevo pago
    v_total_pagado := v_total_pagado + p_monto;

    -- La base de datos se auto-regula. Calcula automáticamente si la factura ya se pagó completa o solo a medias, y asigna el estado correspondiente sin depender de que la capa de aplicación (API) mande el estado correcto.
    IF v_total_pagado >= v_total_factura THEN
        v_nuevo_estado := 'pagada';
    ELSIF v_total_pagado > 0 THEN
        v_nuevo_estado := 'pagada_parcial';
    ELSE
        v_nuevo_estado := 'pendiente';
    END IF;

    UPDATE facturas
    SET    estado = v_nuevo_estado
    WHERE  id = p_factura_id;

    -- Registrar en log de auditoría
    INSERT INTO log_auditoria (entidad_afectada, entidad_id, accion, usuario, detalles)
    VALUES (
        'facturas',
        p_factura_id,
        'REGISTRO_PAGO',
        p_usuario,
        jsonb_build_object(
            'monto_pagado',       p_monto,
            'total_pagado_ahora', v_total_pagado,
            'saldo_anterior',     v_saldo_pendiente,
            'estado_anterior',    v_estado_factura,
            'estado_nuevo',       v_nuevo_estado,
            'timestamp',          NOW()
        )
    );

EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END;
$$;