const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', goalController.getGoals);
router.post('/', goalController.createGoal);
router.patch('/:id', goalController.updateGoal);
router.patch('/:id/milestones/:milestoneId', goalController.toggleMilestone);
router.delete('/:id', goalController.deleteGoal);
router.post('/suggest-milestones', goalController.suggestMilestones);

module.exports = router;
