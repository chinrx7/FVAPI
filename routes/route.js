const { Router } = require('express');
const ctrl = require('../controllers/ctrl');

const router = Router();

router.post('/test', ctrl.test);
router.post('/authen', ctrl.Authen);
router.post('/inserthis', ctrl.insertData);
router.post('/updaterealtime', ctrl.updateRealtime);
router.post('/getcurrentvalues', ctrl.getcurrentvalues);
router.post('/gettagconfig',ctrl.getTagConfigure);
router.post('/loggergethistorianvalues', ctrl.getHisvalues);
router.post('/ChartGetHistorianValues', ctrl.getChartValues);
router.post('/getdatacal', ctrl.getDataCal);
router.post('/getdatahour', ctrl.getDataCalHour);
router.post('/getflowdata', ctrl.getFlowData);
router.post('/getdataday', ctrl.getDataCalDay);
router.post('/getdistance', ctrl.getDistance);
router.post('/getmaxspeed', ctrl.getMaxSpeed);
router.post('/getavgspeed', ctrl.getAVGSpeed);
router.post('/getpoints', ctrl.getpoints);

router.get('/getvesselcurrentInfo', ctrl.getvesselcurrentInfo);

module.exports = router;