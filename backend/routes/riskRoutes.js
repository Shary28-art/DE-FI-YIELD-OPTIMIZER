const express = require('express');
const router = express.Router();
const { getProtocolRisk, getRiskOverview } = require('../controllers/riskController');

router.get('/overview', getRiskOverview);
router.get('/:protocolId', getProtocolRisk);

module.exports = router;
