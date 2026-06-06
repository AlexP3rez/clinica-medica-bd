const { Router } = require('express');
const { body, query } = require('express-validator');
const controller = require('../controllers/citas.controller');

const router = Router();

router.post(
  '/',
  [
    body('paciente_id').isInt({ min: 1 }).withMessage('paciente_id debe ser entero positivo'),
    body('medico_id').isInt({ min: 1 }).withMessage('medico_id debe ser entero positivo'),
    body('fecha').isDate().withMessage('fecha debe ser una fecha valida (YYYY-MM-DD)'),
    body('hora').matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('hora debe tener formato HH:MM o HH:MM:SS'),
  ],
  controller.crearCita
);

router.put(
  '/:id/cancelar',
  [
    query('id').optional().isInt(),
    body('motivo').notEmpty().withMessage('motivo es requerido'),
    body('usuario').notEmpty().withMessage('usuario es requerido'),
  ],
  controller.cancelarCita
);

router.get(
  '/horarios-libres',
  [
    query('medico_id').isInt({ min: 1 }).withMessage('medico_id debe ser entero positivo'),
    query('fecha').isDate().withMessage('fecha debe ser una fecha valida (YYYY-MM-DD)'),
  ],
  controller.getHorariosLibres
);

module.exports = router;
