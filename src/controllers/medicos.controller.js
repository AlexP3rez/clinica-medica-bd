const { validationResult } = require('express-validator');
const pgService = require('../services/postgres.service');

async function getMedicos(req, res) {
  try {
    const { especialidad_id } = req.query;
    const data = await pgService.getMedicos(especialidad_id ? parseInt(especialidad_id, 10) : null);
    return res.status(200).json({ success: true, data, error: null });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error getMedicos:`, err.message);
    return res.status(500).json({ success: false, data: null, error: err.message });
  }
}

async function getMedicoById(req, res) {
  try {
    const medico = await pgService.getMedicoById(parseInt(req.params.id, 10));
    if (!medico) {
      return res.status(404).json({ success: false, data: null, error: 'Médico no encontrado' });
    }
    return res.status(200).json({ success: true, data: medico, error: null });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error getMedicoById:`, err.message);
    return res.status(500).json({ success: false, data: null, error: err.message });
  }
}

async function crearMedico(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, data: null, error: errors.array() });
  }
  try {
    const { especialidad_id, nombres, apellidos, numero_colegiado } = req.body;
    const medico = await pgService.crearMedico(especialidad_id, nombres, apellidos, numero_colegiado);
    return res.status(201).json({ success: true, data: medico, error: null });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error crearMedico:`, err.message);
    return res.status(500).json({ success: false, data: null, error: err.message });
  }
}

async function actualizarMedico(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, data: null, error: errors.array() });
  }
  try {
    const { especialidad_id, nombres, apellidos, numero_colegiado } = req.body;
    const medico = await pgService.actualizarMedico(
      parseInt(req.params.id, 10), especialidad_id, nombres, apellidos, numero_colegiado
    );
    if (!medico) {
      return res.status(404).json({ success: false, data: null, error: 'Médico no encontrado' });
    }
    return res.status(200).json({ success: true, data: medico, error: null });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error actualizarMedico:`, err.message);
    return res.status(500).json({ success: false, data: null, error: err.message });
  }
}

async function getHorariosMedico(req, res) {
  try {
    const horarios = await pgService.getHorariosMedico(parseInt(req.params.id, 10));
    return res.status(200).json({ success: true, data: horarios, error: null });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error getHorariosMedico:`, err.message);
    return res.status(500).json({ success: false, data: null, error: err.message });
  }
}

async function upsertHorariosMedico(req, res) {
  try {
    await pgService.upsertHorariosMedico(parseInt(req.params.id, 10), req.body);
    return res.status(200).json({ success: true, data: { mensaje: 'Horarios actualizados exitosamente' }, error: null });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error upsertHorariosMedico:`, err.message);
    return res.status(500).json({ success: false, data: null, error: err.message });
  }
}

module.exports = { getMedicos, getMedicoById, crearMedico, actualizarMedico, getHorariosMedico, upsertHorariosMedico };
