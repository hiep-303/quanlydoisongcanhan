const express = require('express');
const router = express.Router();
const habitController = require('../controllers/habitController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', habitController.getHabits);
router.post('/', habitController.createHabit);
router.patch('/:id', habitController.updateHabit);
router.post('/:id/toggle-log', habitController.toggleHabitLog);
router.delete('/:id', habitController.deleteHabit);

module.exports = router;
