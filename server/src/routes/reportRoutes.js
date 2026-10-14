const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/summary', reportController.getSummaryStats);
router.get('/export-csv', reportController.exportCsvReport);

module.exports = router;
