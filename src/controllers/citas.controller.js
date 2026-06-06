const { validationResult } = require('express-validator');
const pgService = require('../services/postgres.service');

async function crearCita(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, data: null, error: errors.array() });
  }

  const { paciente_id, medico_id, fecha, hora } = req.body;

  try {
    const disponible = await pgService.calcularDisponibilidad(medico_id, fecha, hora);

    if (!disponible) {
      return res.status(409).json({
        success: false,
        data: null,
        error: 'Horario no disponible',
      });
    }

    const cita = await pgService.crearCita(paciente_id, medico_id, fecha, hora);
    return res.status(201).json({ success: true, data: cita, error: null });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error crearCita:`, err.message);
    return res.status(500).json({ success: false, data: null, error: err.message });
  }
}

async function cancelarCita(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, data: null, error: errors.array() });
  }

  const cita_id = parseInt(req.params.id, 10);
  const { motivo, usuario } = req.body;

  try {
    await pgService.cancelarCita(cita_id, motivo, usuario);
    return res.status(200).json({
      success: true,
      data: { cita_id, mensaje: 'Cita cancelada exitosamente' },
      error: null,
    });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error cancelarCita:`, err.message);
    return res.status(400).json({ success: false, data: null, error: err.message });
  }
}

async function getHorariosLibres(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, data: null, error: errors.array() });
  }

  const { medico_id, fecha } = req.query;

  try {
    const horarios = await pgService.getHorariosLibres(
      parseInt(medico_id, 10),
      fecha
    );
    return res.status(200).json({ success: true, data: horarios, error: null });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error getHorariosLibres:`, err.message);
    return res.status(500).json({ success: false, data: null, error: err.message });
  }
}

module.exports = { crearCita, cancelarCita, getHorariosLibres };
