const mongoService = require('../services/mongo.service');

async function crearHistorial(req, res) {
  try {
    const resultado = mongoService.validarYNormalizar(req.body);

    if (!resultado.valido) {
      return res.status(400).json({
        success: false,
        data: null,
        error: resultado.error,
      });
    }

    const doc = await mongoService.insertarHistorial(resultado.documento);
    return res.status(201).json({ success: true, data: doc, error: null });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error crearHistorial:`, err.message);
    return res.status(500).json({ success: false, data: null, error: err.message });
  }
}

async function getHistorialPorPaciente(req, res) {
  const paciente_id = parseInt(req.params.id, 10);

  try {
    const historial = await mongoService.getHistorialPorPaciente(paciente_id);

    if (!historial || historial.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        error: 'No se encontraron historiales para este paciente',
      });
    }

    return res.status(200).json({ success: true, data: historial, error: null });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error getHistorialPorPaciente:`, err.message);
    return res.status(500).json({ success: false, data: null, error: err.message });
  }
}

module.exports = { crearHistorial, getHistorialPorPaciente };
