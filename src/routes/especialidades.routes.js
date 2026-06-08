const { Router } = require('express');
const controller = require('../controllers/especialidades.controller');

const router = Router();

router.get('/', controller.getEspecialidades);

module.exports = router;
