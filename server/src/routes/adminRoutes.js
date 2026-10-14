const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/auth');

router.use(requireAdmin);

router.get('/overview', adminController.getOverviewStats);
router.get('/users', adminController.getUsers);
router.patch('/users/:id/lock', adminController.toggleLockUser);
router.patch('/users/:id/role', adminController.updateUserRole);
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;
