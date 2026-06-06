const { Router } = require('express');
const controller = require('../controllers/reportes.controller');

const router = Router();

router.get('/ranking-medicos', controller.getRankingMedicos);
router.get('/facturacion-mensual', controller.getFacturacionMensual);
router.get('/top-diagnosticos', controller.getTopDiagnosticos);
router.get('/medicamentos-por-especialidad', controller.getMedicamentosPorEspecialidad);
router.get('/analisis-avanzado', controller.getAnalisisAvanzado);

module.exports = router;
