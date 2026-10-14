const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.post('/chat', aiController.chat);
router.get('/history', aiController.getChatHistory);
router.delete('/history', aiController.clearChatHistory);

module.exports = router;
