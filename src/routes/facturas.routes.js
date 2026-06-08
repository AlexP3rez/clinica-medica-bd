const { Router } = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/facturas.controller');

const router = Router();

router.get('/', controller.getFacturas);

router.post(
  '/',
  [
    body('cita_id').isInt({ min: 1 }).withMessage('cita_id debe ser entero positivo'),
    body('servicios').isArray({ min: 1 }).withMessage('servicios debe ser un array con al menos un elemento'),
    body('servicios.*.servicio_id').isInt({ min: 1 }).withMessage('servicio_id debe ser entero positivo'),
    body('servicios.*.cantidad').isInt({ min: 1 }).withMessage('cantidad debe ser entero positivo'),
  ],
  controller.crearFactura
);

module.exports = router;
