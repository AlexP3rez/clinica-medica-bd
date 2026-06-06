const { Router } = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/historiales.controller');

const router = Router();

router.post(
  '/',
  [
    body('cita_id').isInt({ min: 1 }).withMessage('cita_id debe ser entero positivo'),
    body('paciente_id').isInt({ min: 1 }).withMessage('paciente_id debe ser entero positivo'),
    body('medico_id').isInt({ min: 1 }).withMessage('medico_id debe ser entero positivo'),
    body('especialidad').notEmpty().withMessage('especialidad es requerida'),
    body('fecha_consulta').notEmpty().withMessage('fecha_consulta es requerida'),
    body('datos_base').isObject().withMessage('datos_base debe ser un objeto'),
  ],
  controller.crearHistorial
);

router.get('/paciente/:id', controller.getHistorialPorPaciente);

module.exports = router;
