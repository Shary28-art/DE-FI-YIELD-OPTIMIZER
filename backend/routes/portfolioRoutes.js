const express = require('express');
const router = express.Router();
const {
  getPortfolio,
  addInvestment,
  withdrawInvestment,
  getTransactions,
} = require('../controllers/portfolioController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, getPortfolio);
router.post('/investments', authMiddleware, addInvestment);
router.post('/withdraw', authMiddleware, withdrawInvestment);
router.get('/transactions', authMiddleware, getTransactions);

module.exports = router;
