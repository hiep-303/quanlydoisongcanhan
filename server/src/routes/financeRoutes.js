const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/transactions', financeController.getTransactions);
router.post('/transactions', financeController.createTransaction);
router.patch('/transactions/:id', financeController.updateTransaction);
router.delete('/transactions/:id', financeController.deleteTransaction);

router.get('/budgets', financeController.getBudgets);
router.post('/budgets', financeController.setBudget);
router.delete('/budgets/:id', financeController.deleteBudget);

router.get('/analytics', financeController.getFinanceAnalytics);

module.exports = router;
