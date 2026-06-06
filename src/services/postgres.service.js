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
};
