-- SCRIPT 04: VISTAS NORMALES Y MATERIALIZADAS

-- V1: v_agenda_diaria — Vista NORMAL
-- Elegimos una vista NORMAL porque Recepción necesita ver la agenda en estricto "tiempo real". 
-- Si fuera materializada, una secretaria no vería las cancelaciones de última hora y podría agendar a otro paciente encima, rompiendo la regla de solapamiento.
CREATE OR REPLACE VIEW v_agenda_diaria AS
SELECT
    c.id                                AS cita_id,
    c.fecha,
    c.hora,
    c.estado,
    CONCAT(p.nombres, ' ', p.apellidos) AS paciente,
    p.telefono                          AS telefono_paciente,
    CONCAT(m.nombres, ' ', m.apellidos) AS medico,
    e.nombre                            AS especialidad
FROM   citas c
JOIN   pacientes p      ON p.id = c.paciente_id
JOIN   medicos   m      ON m.id = c.medico_id
JOIN   especialidades e ON e.id = m.especialidad_id
ORDER  BY c.fecha ASC, c.hora ASC;


-- V2: v_facturas_pendientes — Vista NORMAL (RC-02)
-- Vista NORMAL obligatoria por integridad financiera. 
-- Si un paciente hace un pago en caja, el saldo debe reflejarse instantáneamente en cero. Si usáramos una vista materializada con retraso, el sistema le seguiría cobrando una deuda que ya pagó.
CREATE OR REPLACE VIEW v_facturas_pendientes AS
SELECT
    f.id                                     AS factura_id,
    f.fecha_emision,
    f.total                                  AS total_factura,
    COALESCE(SUM(pg.monto), 0)               AS total_pagado,
    f.total - COALESCE(SUM(pg.monto), 0)     AS saldo_pendiente,
    f.estado,
    CONCAT(p.nombres, ' ', p.apellidos)      AS paciente,
    p.telefono,
    (CURRENT_DATE - f.fecha_emision::DATE)   AS dias_antiguedad
FROM   facturas f
JOIN   citas c     ON c.id = f.cita_id
JOIN   pacientes p ON p.id = c.paciente_id
LEFT JOIN pagos pg ON pg.factura_id = f.id
WHERE  f.estado IN ('pendiente', 'pagada_parcial')
GROUP  BY f.id, f.fecha_emision, f.total, f.estado,
          p.nombres, p.apellidos, p.telefono
ORDER  BY f.fecha_emision ASC;


-- VM1: vm_ranking_trimestral_medicos — Vista MATERIALIZADA
-- Aquí cambiamos estratégicamente a Vista MATERIALIZADA. 
-- Este es un reporte gerencial que cruza citas, facturas y médicos de los últimos 3 meses. Recalcular esos JOINs cada vez que gerencia abre el reporte mataría el CPU del servidor. Como son datos históricos, pre-calcularlos y guardarlos en disco es lo óptimo.
CREATE MATERIALIZED VIEW vm_ranking_trimestral_medicos AS
SELECT
    m.id                                     AS medico_id,
    CONCAT(m.nombres, ' ', m.apellidos)      AS medico,
    e.nombre                                 AS especialidad,
    COUNT(c.id)                              AS total_citas_atendidas,
    COALESCE(SUM(f.total), 0)                AS monto_facturado,
    NOW()                                    AS ultima_actualizacion
FROM   medicos m
JOIN   especialidades e ON e.id = m.especialidad_id
LEFT JOIN citas c ON c.medico_id = m.id
    AND c.estado = 'atendida'
    AND c.fecha >= DATE_TRUNC('quarter', NOW()) - INTERVAL '3 months'
    AND c.fecha <  DATE_TRUNC('quarter', NOW())
LEFT JOIN facturas f ON f.cita_id = c.id
    AND f.estado <> 'anulada'
GROUP  BY m.id, m.nombres, m.apellidos, e.nombre
ORDER  BY total_citas_atendidas DESC, monto_facturado DESC
WITH DATA;

-- Este índice UNIQUE es un truco técnico avanzado. 
-- Es un requisito estricto de PostgreSQL para poder usar el comando `REFRESH MATERIALIZED VIEW CONCURRENTLY`. Al hacerlo concurrente, la vista se actualiza en segundo plano sin bloquear (lock) las lecturas si alguien entra al reporte justo a esa hora.
CREATE UNIQUE INDEX idx_vm_ranking_medico_id
    ON vm_ranking_trimestral_medicos (medico_id);


-- VM2: vm_facturacion_mensual — Vista MATERIALIZADA
-- Vista MATERIALIZADA para el cierre contable. 
-- Los meses anteriores ya están cerrados financieramente y son inmutables. Obligar al motor a sumar todas las facturas del año pasado en cada consulta es un desperdicio de recursos transaccionales.
CREATE MATERIALIZED VIEW vm_facturacion_mensual AS
SELECT
    DATE_TRUNC('month', f.fecha_emision)::DATE  AS mes,
    e.nombre                                    AS especialidad,
    COUNT(DISTINCT f.id)                        AS total_facturas,
    SUM(f.total)                                AS total_facturado,
    COALESCE(SUM(pag.total_pagado), 0)          AS total_cobrado,
    SUM(f.total) - COALESCE(SUM(pag.total_pagado), 0) AS saldo_pendiente,
    NOW()                                       AS ultima_actualizacion
FROM   facturas f
JOIN   citas c     ON c.id = f.cita_id
JOIN   medicos m   ON m.id = c.medico_id
JOIN   especialidades e ON e.id = m.especialidad_id
LEFT JOIN (
    SELECT factura_id, SUM(monto) AS total_pagado
    FROM   pagos
    GROUP  BY factura_id
) pag ON pag.factura_id = f.id
WHERE  f.estado <> 'anulada'
GROUP  BY DATE_TRUNC('month', f.fecha_emision), e.nombre
ORDER  BY mes DESC, e.nombre ASC
WITH DATA;

-- Indices B-Tree creados directamente sobre la vista materializada. 
-- Una vez que los datos pesados ya se pre-calcularon y están en disco, estos índices hacen que los filtros por mes o por especialidad en el dashboard gerencial sean de respuesta inmediata.
CREATE INDEX idx_vm_facturacion_mes
    ON vm_facturacion_mensual (mes);
CREATE INDEX idx_vm_facturacion_especialidad
    ON vm_facturacion_mensual (especialidad);