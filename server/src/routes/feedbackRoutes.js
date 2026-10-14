const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { requireAdmin } = require('../middleware/auth');

router.post('/', feedbackController.submitFeedback);
router.get('/', requireAdmin, feedbackController.listFeedback);

module.exports = router;
