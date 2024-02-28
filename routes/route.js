const { Router } = require('express');
const ctrl = require('../controllers/ctrl');

const router = Router();

router.post('/test', ctrl.test);

module.exports = router;