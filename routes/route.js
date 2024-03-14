const { Router } = require('express');
const ctrl = require('../controllers/ctrl');

const router = Router();

router.post('/test', ctrl.test);
router.post('/authen', ctrl.Authen);
router.post('/inserthis', ctrl.insertData);
router.post('/getcurrentvalues', ctrl.getcurrentvalues);

router.get('/getvesselcurrentInfo', ctrl.getvesselcurrentInfo);

module.exports = router;