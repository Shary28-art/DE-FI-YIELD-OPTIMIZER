const express = require('express');
const router = express.Router();
const { runOptimizer, deployStrategy } = require('../controllers/optimizerController');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

router.post('/optimize', runOptimizer);
router.post('/deploy', authMiddleware, deployStrategy);

module.exports = router;
