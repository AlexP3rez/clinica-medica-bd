const pgService = require('../services/postgres.service');

async function getServicios(_req, res) {
  try {
    const data = await pgService.getServicios();
    return res.status(200).json({ success: true, data, error: null });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error getServicios:`, err.message);
    return res.status(500).json({ success: false, data: null, error: err.message });
  }
}

module.exports = { getServicios };
