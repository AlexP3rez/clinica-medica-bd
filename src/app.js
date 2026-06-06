require('dotenv').config();

const express = require('express');
const { connectMongo } = require('./config/mongodb');

const citasRoutes = require('./routes/citas.routes');
const pagosRoutes = require('./routes/pagos.routes');
const historialesRoutes = require('./routes/historiales.routes');
const reportesRoutes = require('./routes/reportes.routes');

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 3000;

app.use(express.json());

app.use('/citas', citasRoutes);
app.use('/pagos', pagosRoutes);
app.use('/historiales', historialesRoutes);
app.use('/reportes', reportesRoutes);

app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, data: { status: 'ok' }, error: null });
});

app.use((err, _req, res, _next) => {
  console.error(`[${new Date().toISOString()}] Error no manejado:`, err.message);
  res.status(500).json({ success: false, data: null, error: 'Error interno del servidor' });
});

async function start() {
  try {
    await connectMongo();
    app.listen(PORT, () => {
      console.log(`[${new Date().toISOString()}] Servidor corriendo en puerto ${PORT}`);
    });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error al iniciar:`, err.message);
    process.exit(1);
  }
}

start();

module.exports = app;
