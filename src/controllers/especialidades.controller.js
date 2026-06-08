const pgService = require('../services/postgres.service');

async function getEspecialidades(_req, res) {
  try {
    const data = await pgService.getEspecialidades();
    return res.status(200).json({ success: true, data, error: null });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error getEspecialidades:`, err.message);
    return res.status(500).json({ success: false, data: null, error: err.message });
  }
}

module.exports = { getEspecialidades };
