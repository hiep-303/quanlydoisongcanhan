const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');

router.get('/profile', requireAuth, userController.getProfile);
router.patch('/profile', requireAuth, userController.updateProfile);
router.post('/change-password', requireAuth, userController.changePassword);
router.get('/export', requireAuth, userController.exportData);
router.delete('/account', requireAuth, userController.deleteAccount);

module.exports = router;
