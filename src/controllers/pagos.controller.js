const { validationResult } = require('express-validator');
const pgService = require('../services/postgres.service');

async function registrarPago(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, data: null, error: errors.array() });
  }

  const { factura_id, monto, usuario } = req.body;

  try {
    await pgService.registrarPago(factura_id, monto, usuario);
    return res.status(201).json({
      success: true,
      data: { factura_id, monto, mensaje: 'Pago registrado exitosamente' },
      error: null,
    });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error registrarPago:`, err.message);
    return res.status(400).json({ success: false, data: null, error: err.message });
  }
}

async function getSaldoPaciente(req, res) {
  const paciente_id = parseInt(req.params.paciente_id, 10);

  try {
    const saldo = await pgService.getSaldoPaciente(paciente_id);

    if (!saldo || saldo.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        error: 'Paciente no encontrado o sin facturas',
      });
    }

    return res.status(200).json({ success: true, data: saldo, error: null });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error getSaldoPaciente:`, err.message);
    return res.status(500).json({ success: false, data: null, error: err.message });
  }
}

module.exports = { registrarPago, getSaldoPaciente };
