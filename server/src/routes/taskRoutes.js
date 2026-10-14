const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', taskController.getTasks);
router.get('/stats', taskController.getTaskStats);
router.post('/', taskController.createTask);
router.patch('/:id', taskController.updateTask);
router.patch('/:id/toggle', taskController.toggleTaskStatus);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
