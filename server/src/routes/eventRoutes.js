const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', eventController.getEvents);
router.get('/upcoming', eventController.getUpcomingEvents);
router.post('/', eventController.createEvent);
router.patch('/:id', eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);

module.exports = router;
