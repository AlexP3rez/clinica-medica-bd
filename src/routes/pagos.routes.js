const { Router } = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/pagos.controller');

const router = Router();

router.post(
  '/',
  [
    body('factura_id').isInt({ min: 1 }).withMessage('factura_id debe ser entero positivo'),
    body('monto').isFloat({ min: 0.01 }).withMessage('monto debe ser un numero positivo'),
    body('usuario').notEmpty().withMessage('usuario es requerido'),
  ],
  controller.registrarPago
);

router.get('/saldo/:paciente_id', controller.getSaldoPaciente);

module.exports = router;
