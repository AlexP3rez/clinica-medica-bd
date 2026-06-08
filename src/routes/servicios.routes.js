const { Router } = require('express');
const controller = require('../controllers/servicios.controller');

const router = Router();

router.get('/', controller.getServicios);

module.exports = router;
