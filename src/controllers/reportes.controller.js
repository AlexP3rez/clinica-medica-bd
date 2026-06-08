const pgService = require('../services/postgres.service');
const mongoService = require('../services/mongo.service');

async function getRankingMedicos(_req, res) {
  try {
    const data = await pgService.getRankingTrimestralMedicos();
    return res.status(200).json({ success: true, data, error: null });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error getRankingMedicos:`, err.message);
    return res.status(500).json({ success: false, data: null, error: err.message });
  }
}

async function getFacturacionMensual(_req, res) {
  try {
    const data = await pgService.getFacturacionMensual();
    return res.status(200).json({ success: true, data, error: null });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error getFacturacionMensual:`, err.message);
    return res.status(500).json({ success: false, data: null, error: err.message });
  }
}

async function getTopDiagnosticos(req, res) {
  try {
    const fechaInicio = req.query.fecha_inicio
      ? new Date(req.query.fecha_inicio)
      : new Date(new Date().setMonth(new Date().getMonth() - 3));

    const data = await mongoService.getTopDiagnosticos(fechaInicio);
    return res.status(200).json({ success: true, data, error: null });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error getTopDiagnosticos:`, err.message);
    return res.status(500).json({ success: false, data: null, error: err.message });
  }
}

async function getMedicamentosPorEspecialidad(_req, res) {
  try {
    const data = await mongoService.getMedicamentosPorEspecialidad();
    return res.status(200).json({ success: true, data, error: null });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error getMedicamentosPorEspecialidad:`, err.message);
    return res.status(500).json({ success: false, data: null, error: err.message });
  }
}

async function getAnalisisAvanzado(_req, res) {
  try {
    const data = await mongoService.getAnalisisAvanzado();
    return res.status(200).json({ success: true, data: data[0] || {}, error: null });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error getAnalisisAvanzado:`, err.message);
    return res.status(500).json({ success: false, data: null, error: err.message });
  }
}

async function getAgendaDiaria(req, res) {
  try {
    const { fecha } = req.query;
    const targetDate = fecha || new Date().toISOString().slice(0, 10);
    const data = await pgService.query('SELECT * FROM v_agenda_diaria WHERE fecha = $1 ORDER BY hora', [targetDate]);
    return res.status(200).json({ success: true, data: data.rows, error: null });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error getAgendaDiaria:`, err.message);
    return res.status(500).json({ success: false, data: null, error: err.message });
  }
}

async function getFacturasPendientesReporte(_req, res) {
  try {
    const data = await pgService.getFacturasPendientes();
    return res.status(200).json({ success: true, data, error: null });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error getFacturasPendientesReporte:`, err.message);
    return res.status(500).json({ success: false, data: null, error: err.message });
  }
}

module.exports = {
  getRankingMedicos,
  getFacturacionMensual,
  getTopDiagnosticos,
  getMedicamentosPorEspecialidad,
  getAnalisisAvanzado,
  getAgendaDiaria,
  getFacturasPendientesReporte,
};
