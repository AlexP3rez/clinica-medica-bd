const { Router } = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/pacientes.controller');

const router = Router();

router.get('/', controller.getPacientes);

router.post(
  '/',
  [
    body('dpi').notEmpty().withMessage('dpi es requerido'),
    body('nombres').notEmpty().withMessage('nombres es requerido'),
    body('apellidos').notEmpty().withMessage('apellidos es requerido'),
    body('fecha_nacimiento').isDate().withMessage('fecha_nacimiento debe ser una fecha válida (YYYY-MM-DD)'),
  ],
  controller.crearPaciente
);

router.put(
  '/:id',
  [
    body('dpi').notEmpty().withMessage('dpi es requerido'),
    body('nombres').notEmpty().withMessage('nombres es requerido'),
    body('apellidos').notEmpty().withMessage('apellidos es requerido'),
    body('fecha_nacimiento').isDate().withMessage('fecha_nacimiento debe ser una fecha válida (YYYY-MM-DD)'),
  ],
  controller.actualizarPaciente
);

module.exports = router;
