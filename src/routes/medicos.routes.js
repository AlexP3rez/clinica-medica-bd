const { Router } = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/medicos.controller');

const router = Router();

router.get('/', controller.getMedicos);
router.get('/:id', controller.getMedicoById);
router.get('/:id/horarios', controller.getHorariosMedico);

router.post(
  '/',
  [
    body('especialidad_id').isInt({ min: 1 }).withMessage('especialidad_id debe ser entero positivo'),
    body('nombres').notEmpty().withMessage('nombres es requerido'),
    body('apellidos').notEmpty().withMessage('apellidos es requerido'),
    body('numero_colegiado').notEmpty().withMessage('numero_colegiado es requerido'),
  ],
  controller.crearMedico
);

router.put(
  '/:id',
  [
    body('especialidad_id').isInt({ min: 1 }).withMessage('especialidad_id debe ser entero positivo'),
    body('nombres').notEmpty().withMessage('nombres es requerido'),
    body('apellidos').notEmpty().withMessage('apellidos es requerido'),
    body('numero_colegiado').notEmpty().withMessage('numero_colegiado es requerido'),
  ],
  controller.actualizarMedico
);

router.post('/:id/horarios', controller.upsertHorariosMedico);

module.exports = router;
