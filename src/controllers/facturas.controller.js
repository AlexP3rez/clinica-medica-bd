const { validationResult } = require('express-validator');
const pgService = require('../services/postgres.service');

async function getFacturas(req, res) {
  try {
    const { paciente_id, estado } = req.query;
    const data = await pgService.getFacturas(
      paciente_id ? parseInt(paciente_id, 10) : null,
      estado || null
    );
    return res.status(200).json({ success: true, data, error: null });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error getFacturas:`, err.message);
    return res.status(500).json({ success: false, data: null, error: err.message });
  }
}

async function crearFactura(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, data: null, error: errors.array() });
  }
  try {
    const { cita_id, servicios } = req.body;
    const factura = await pgService.crearFactura(cita_id, servicios);
    return res.status(201).json({ success: true, data: factura, error: null });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error crearFactura:`, err.message);
    return res.status(500).json({ success: false, data: null, error: err.message });
  }
}

module.exports = { getFacturas, crearFactura };
