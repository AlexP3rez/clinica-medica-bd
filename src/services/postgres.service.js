const pool = require('../config/postgres');

async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] PG query ejecutada en ${duration}ms`);
    return result;
  } catch (err) {
    console.error(`[${new Date().toISOString()}] PG query error:`, err.message);
    throw err;
  }
}

async function calcularDisponibilidad(medico_id, fecha, hora) {
  const result = await query('SELECT calcular_disponibilidad($1, $2, $3) AS disponible', [
    medico_id, fecha, hora,
  ]);
  return result.rows[0]?.disponible;
}

async function getHorariosLibres(medico_id, fecha) {
  const result = await query('SELECT * FROM get_horarios_libres($1, $2)', [
    medico_id, fecha,
  ]);
  return result.rows;
}

async function crearCita(paciente_id, medico_id, fecha, hora) {
  const result = await query(
    'INSERT INTO citas (paciente_id, medico_id, fecha, hora, estado) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [paciente_id, medico_id, fecha, hora, 'programada']
  );
  return result.rows[0];
}

async function cancelarCita(cita_id, motivo, usuario) {
  await query('CALL cancelar_cita($1, $2, $3)', [cita_id, motivo, usuario]);
}

async function registrarPago(factura_id, monto, usuario) {
  await query('CALL registrar_pago($1, $2, $3)', [factura_id, monto, usuario]);
}

async function getSaldoPaciente(paciente_id) {
  const result = await query('SELECT * FROM get_saldo_paciente($1)', [paciente_id]);
  return result.rows;
}

async function getAgendaDiaria() {
  const result = await query('SELECT * FROM v_agenda_diaria');
  return result.rows;
}

async function getFacturasPendientes() {
  const result = await query('SELECT * FROM v_facturas_pendientes');
  return result.rows;
}

async function getRankingTrimestralMedicos() {
  const result = await query('SELECT * FROM vm_ranking_trimestral_medicos');
  return result.rows;
}

async function getFacturacionMensual() {
  const result = await query('SELECT * FROM vm_facturacion_mensual');
  return result.rows;
}

async function getEspecialidades() {
  const result = await query('SELECT id, nombre, descripcion FROM especialidades ORDER BY nombre');
  return result.rows;
}

async function getMedicos(especialidad_id) {
  let sql = 'SELECT m.id, m.nombres, m.apellidos, m.numero_colegiado, m.especialidad_id, e.nombre AS especialidad FROM medicos m JOIN especialidades e ON e.id = m.especialidad_id';
  const params = [];
  if (especialidad_id) {
    sql += ' WHERE m.especialidad_id = $1';
    params.push(especialidad_id);
  }
  sql += ' ORDER BY m.apellidos, m.nombres';
  const result = await query(sql, params);
  return result.rows;
}

async function getMedicoById(medico_id) {
  const result = await query(
    'SELECT m.id, m.nombres, m.apellidos, m.numero_colegiado, m.especialidad_id, e.nombre AS especialidad FROM medicos m JOIN especialidades e ON e.id = m.especialidad_id WHERE m.id = $1',
    [medico_id]
  );
  return result.rows[0] || null;
}

async function crearMedico(especialidad_id, nombres, apellidos, numero_colegiado) {
  const result = await query(
    'INSERT INTO medicos (especialidad_id, nombres, apellidos, numero_colegiado) VALUES ($1, $2, $3, $4) RETURNING *',
    [especialidad_id, nombres, apellidos, numero_colegiado]
  );
  return result.rows[0];
}

async function actualizarMedico(medico_id, especialidad_id, nombres, apellidos, numero_colegiado) {
  const result = await query(
    'UPDATE medicos SET especialidad_id = $2, nombres = $3, apellidos = $4, numero_colegiado = $5 WHERE id = $1 RETURNING *',
    [medico_id, especialidad_id, nombres, apellidos, numero_colegiado]
  );
  return result.rows[0] || null;
}

async function getHorariosMedico(medico_id) {
  const result = await query(
    'SELECT id, dia_semana, hora_inicio, hora_fin FROM horarios_medico WHERE medico_id = $1 ORDER BY dia_semana',
    [medico_id]
  );
  return result.rows;
}

async function upsertHorariosMedico(medico_id, horarios) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM horarios_medico WHERE medico_id = $1', [medico_id]);
    for (const h of horarios) {
      await client.query(
        'INSERT INTO horarios_medico (medico_id, dia_semana, hora_inicio, hora_fin) VALUES ($1, $2, $3, $4)',
        [medico_id, h.dia_semana, h.hora_inicio, h.hora_fin]
      );
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function getPacientes(search) {
  let sql = 'SELECT id, dpi, nombres, apellidos, fecha_nacimiento, telefono FROM pacientes';
  const params = [];
  if (search) {
    sql += ' WHERE LOWER(nombres) LIKE LOWER($1) OR LOWER(apellidos) LIKE LOWER($1) OR dpi LIKE $1';
    params.push(`%${search}%`);
  }
  sql += ' ORDER BY apellidos, nombres LIMIT 50';
  const result = await query(sql, params);
  return result.rows;
}

async function crearPaciente(dpi, nombres, apellidos, fecha_nacimiento, telefono) {
  const result = await query(
    'INSERT INTO pacientes (dpi, nombres, apellidos, fecha_nacimiento, telefono) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [dpi, nombres, apellidos, fecha_nacimiento, telefono]
  );
  return result.rows[0];
}

async function actualizarPaciente(paciente_id, dpi, nombres, apellidos, fecha_nacimiento, telefono) {
  const result = await query(
    'UPDATE pacientes SET dpi = $2, nombres = $3, apellidos = $4, fecha_nacimiento = $5, telefono = $6 WHERE id = $1 RETURNING *',
    [paciente_id, dpi, nombres, apellidos, fecha_nacimiento, telefono]
  );
  return result.rows[0] || null;
}

async function getCitas(fecha, estado, paciente_id) {
  let sql = `SELECT c.id, c.paciente_id, c.medico_id, c.fecha, c.hora, c.estado, c.motivo_cancelacion,
    CONCAT(p.nombres, ' ', p.apellidos) AS paciente,
    CONCAT(m.nombres, ' ', m.apellidos) AS medico,
    e.nombre AS especialidad
    FROM citas c
    JOIN pacientes p ON p.id = c.paciente_id
    JOIN medicos m ON m.id = c.medico_id
    JOIN especialidades e ON e.id = m.especialidad_id`;
  const conditions = [];
  const params = [];
  if (fecha) {
    conditions.push(`c.fecha = $${params.length + 1}`);
    params.push(fecha);
  }
  if (estado) {
    conditions.push(`c.estado = $${params.length + 1}`);
    params.push(estado);
  }
  if (paciente_id) {
    conditions.push(`c.paciente_id = $${params.length + 1}`);
    params.push(paciente_id);
  }
  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }
  sql += ' ORDER BY c.fecha DESC, c.hora DESC LIMIT 100';
  const result = await query(sql, params);
  return result.rows;
}

async function getCitaById(cita_id) {
  const result = await query(
    `SELECT c.id, c.paciente_id, c.medico_id, c.fecha, c.hora, c.estado, c.motivo_cancelacion,
      CONCAT(p.nombres, ' ', p.apellidos) AS paciente,
      CONCAT(m.nombres, ' ', m.apellidos) AS medico,
      e.nombre AS especialidad
      FROM citas c
      JOIN pacientes p ON p.id = c.paciente_id
      JOIN medicos m ON m.id = c.medico_id
      JOIN especialidades e ON e.id = m.especialidad_id
      WHERE c.id = $1`,
    [cita_id]
  );
  return result.rows[0] || null;
}

async function cambiarEstadoCita(cita_id, estado, usuario) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const citaRes = await client.query('SELECT estado FROM citas WHERE id = $1 FOR UPDATE', [cita_id]);
    if (citaRes.rows.length === 0) {
      throw new Error('ERROR: La cita no existe.');
    }

    const estadoActual = citaRes.rows[0].estado;
    const estadosPermitidos = ['confirmada', 'atendida', 'no_asistio'];
    if (!estadosPermitidos.includes(estado)) {
      throw new Error(`ERROR: Estado "${estado}" no permitido. Usar: ${estadosPermitidos.join(', ')}`);
    }
    if (estadoActual === 'cancelada') {
      throw new Error('ERROR: No se puede cambiar el estado de una cita cancelada.');
    }
    if (estadoActual === 'atendida' && estado !== 'atendida') {
      throw new Error('ERROR: Una cita atendida no puede cambiar a otro estado.');
    }

    await client.query(
      'UPDATE citas SET estado = $2 WHERE id = $1',
      [cita_id, estado]
    );

    await client.query(
      `INSERT INTO log_auditoria (entidad_afectada, entidad_id, accion, usuario, detalles)
       VALUES ($1, $2, $3, $4, $5)`,
      ['citas', cita_id, 'CAMBIO_ESTADO_CITA', usuario,
        JSON.stringify({ estado_anterior: estadoActual, estado_nuevo: estado, timestamp: new Date().toISOString() })]
    );

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function getFacturas(paciente_id, estado) {
  let sql = `SELECT f.id, f.cita_id, f.fecha_emision, f.total, f.estado,
    CONCAT(p.nombres, ' ', p.apellidos) AS paciente,
    COALESCE((SELECT SUM(pg.monto) FROM pagos pg WHERE pg.factura_id = f.id), 0) AS total_pagado,
    f.total - COALESCE((SELECT SUM(pg.monto) FROM pagos pg WHERE pg.factura_id = f.id), 0) AS saldo_pendiente
    FROM facturas f
    JOIN citas c ON c.id = f.cita_id
    JOIN pacientes p ON p.id = c.paciente_id`;
  const conditions = [];
  const params = [];
  if (paciente_id) {
    conditions.push(`c.paciente_id = $${params.length + 1}`);
    params.push(paciente_id);
  }
  if (estado) {
    conditions.push(`f.estado = $${params.length + 1}`);
    params.push(estado);
  }
  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }
  sql += ' ORDER BY f.fecha_emision DESC LIMIT 100';
  const result = await query(sql, params);
  return result.rows;
}

async function crearFactura(cita_id, servicios) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let total = 0;
    for (const s of servicios) {
      const res = await client.query('SELECT precio_actual FROM servicios WHERE id = $1', [s.servicio_id]);
      if (res.rows.length === 0) {
        throw new Error(`Servicio ID ${s.servicio_id} no encontrado`);
      }
      total += res.rows[0].precio_actual * s.cantidad;
    }

    const facturaRes = await client.query(
      'INSERT INTO facturas (cita_id, total, estado) VALUES ($1, $2, $3) RETURNING *',
      [cita_id, total, 'pendiente']
    );
    const factura = facturaRes.rows[0];

    for (const s of servicios) {
      const precioRes = await client.query('SELECT precio_actual FROM servicios WHERE id = $1', [s.servicio_id]);
      await client.query(
        'INSERT INTO detalles_factura (factura_id, servicio_id, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)',
        [factura.id, s.servicio_id, s.cantidad, precioRes.rows[0].precio_actual]
      );
    }

    await client.query('COMMIT');
    return factura;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function getServicios() {
  const result = await query('SELECT id, nombre, precio_actual FROM servicios ORDER BY nombre');
  return result.rows;
}

module.exports = {
  query,
  calcularDisponibilidad,
  getHorariosLibres,
  crearCita,
  cancelarCita,
  registrarPago,
  getSaldoPaciente,
  getAgendaDiaria,
  getFacturasPendientes,
  getRankingTrimestralMedicos,
  getFacturacionMensual,
  getEspecialidades,
  getMedicos,
  getMedicoById,
  crearMedico,
  actualizarMedico,
  getHorariosMedico,
  upsertHorariosMedico,
  getPacientes,
  crearPaciente,
  actualizarPaciente,
  getCitas,
  getCitaById,
  cambiarEstadoCita,
  getFacturas,
  crearFactura,
  getServicios,
};
