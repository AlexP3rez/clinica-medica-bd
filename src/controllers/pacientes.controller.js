const { validationResult } = require('express-validator');
const pgService = require('../services/postgres.service');

async function getPacientes(req, res) {
  try {
    const { search } = req.query;
    const data = await pgService.getPacientes(search || null);
    return res.status(200).json({ success: true, data, error: null });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error getPacientes:`, err.message);
    return res.status(500).json({ success: false, data: null, error: err.message });
  }
}

async function crearPaciente(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, data: null, error: errors.array() });
  }
  try {
    const { dpi, nombres, apellidos, fecha_nacimiento, telefono } = req.body;
    const paciente = await pgService.crearPaciente(dpi, nombres, apellidos, fecha_nacimiento, telefono);
    return res.status(201).json({ success: true, data: paciente, error: null });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error crearPaciente:`, err.message);
    if (err.code === '23505') {
      return res.status(409).json({ success: false, data: null, error: 'Ya existe un paciente con ese DPI' });
    }
    return res.status(500).json({ success: false, data: null, error: err.message });
  }
}

async function actualizarPaciente(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, data: null, error: errors.array() });
  }
  try {
    const { dpi, nombres, apellidos, fecha_nacimiento, telefono } = req.body;
    const paciente = await pgService.actualizarPaciente(
      parseInt(req.params.id, 10), dpi, nombres, apellidos, fecha_nacimiento, telefono
    );
    if (!paciente) {
      return res.status(404).json({ success: false, data: null, error: 'Paciente no encontrado' });
    }
    return res.status(200).json({ success: true, data: paciente, error: null });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error actualizarPaciente:`, err.message);
    return res.status(500).json({ success: false, data: null, error: err.message });
  }
}

module.exports = { getPacientes, crearPaciente, actualizarPaciente };
