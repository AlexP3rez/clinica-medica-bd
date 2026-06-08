-- SCRIPT 02: FUNCIONES

-- F1: calcular_disponibilidad
CREATE OR REPLACE FUNCTION calcular_disponibilidad(
    p_medico_id INT,
    p_fecha     DATE,
    p_hora      TIME
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_conflicto INT;
BEGIN
    -- En lugar de repetir la lógica de solapamiento en la API o en otros procedimientos, 
    -- todo el sistema llama a esta función escalar, garantizando consistencia.
    SELECT COUNT(*)
    INTO   v_conflicto
    FROM   citas
    WHERE  medico_id = p_medico_id
      AND  fecha     = p_fecha
      AND  hora      = p_hora
      -- Es vital excluir estos dos estados. Si no lo hiciéramos, un espacio 
      -- cancelado seguiría marcando "conflicto" y el médico perdería la oportunidad de atender a otro paciente en esa hora.
      AND  estado    NOT IN ('cancelada', 'no_asistio');

    -- Retorna TRUE solo si el COUNT es exactamente 0 (no hay conflictos).
    RETURN v_conflicto = 0;
END;
$$;


-- F2: get_saldo_paciente
CREATE OR REPLACE FUNCTION get_saldo_paciente(p_paciente_id INT)
RETURNS TABLE (
    factura_id      INT,
    fecha_emision   TIMESTAMP,
    total_factura   NUMERIC,
    total_pagado    NUMERIC,
    saldo_pendiente NUMERIC,
    estado          VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        f.id                                    AS factura_id,
        f.fecha_emision                         AS fecha_emision,
        f.total                                 AS total_factura,
        -- Si una factura nueva no tiene pagos, 
        -- el SUM devolvería NULL. Una resta matemática con NULL destruye el cálculo del saldo. COALESCE fuerza que sea un 0 seguro.
        COALESCE(SUM(p.monto), 0)               AS total_pagado,
        f.total - COALESCE(SUM(p.monto), 0)     AS saldo_pendiente,
        f.estado                                AS estado
    FROM   facturas f
    JOIN   citas c    ON c.id = f.cita_id
    -- LEFT JOIN es obligatorio aquí. Si usáramos INNER JOIN, las facturas que 
    -- aún no tienen ningún abono desaparecerían del reporte de deuda, lo cual sería un error financiero grave.
    LEFT JOIN pagos p ON p.factura_id = f.id
    WHERE  c.paciente_id = p_paciente_id
      AND  f.estado IN ('pendiente', 'pagada_parcial')
    GROUP  BY f.id, f.fecha_emision, f.total, f.estado
    ORDER  BY f.fecha_emision ASC;
END;
$$;


-- F3: get_horarios_libres
CREATE OR REPLACE FUNCTION get_horarios_libres(
    p_medico_id INT,
    p_fecha     DATE
)
RETURNS TABLE (hora_libre TIME)
LANGUAGE plpgsql
AS $$
DECLARE
    v_dia_semana  INT;
    v_hora_inicio TIME;
    v_hora_fin    TIME;
    v_slot        TIME;
BEGIN
    -- PostgreSQL usa 0 para el domingo en la función EXTRACT(DOW). 
    -- Nuestro esquema de negocio usa de 1 (Lunes) a 7 (Domingo).
    v_dia_semana := CASE EXTRACT(DOW FROM p_fecha)
                        WHEN 0 THEN 7
                        ELSE EXTRACT(DOW FROM p_fecha)::INT
                    END;

    SELECT hora_inicio, hora_fin
    INTO   v_hora_inicio, v_hora_fin
    FROM   horarios_medico
    WHERE  medico_id  = p_medico_id
      AND  dia_semana = v_dia_semana;

    IF NOT FOUND THEN
        RETURN;
    END IF;

    -- En lugar de crear miles de registros físicos en una tabla de "slots_disponibles", 
    -- usamos este ciclo WHILE para generar dinámicamente bloques de 30 minutos en memoria, ahorrando espacio en disco.
    v_slot := v_hora_inicio;
    WHILE v_slot < v_hora_fin LOOP
        -- Reutilización de código. Invocamos a la Función 1 para evaluar cada bloque generado.
        IF calcular_disponibilidad(p_medico_id, p_fecha, v_slot) THEN
            hora_libre := v_slot;
            -- RETURN NEXT acumula el resultado en la tabla virtual que devolverá la función al terminar el ciclo.
            RETURN NEXT;
        END IF;
        v_slot := v_slot + INTERVAL '30 minutes';
    END LOOP;
END;
$$;