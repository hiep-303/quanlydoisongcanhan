const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', noteController.getNotes);
router.post('/', noteController.createNote);
router.patch('/:id', noteController.updateNote);
router.patch('/:id/pin', noteController.togglePinNote);
router.delete('/:id', noteController.deleteNote);

module.exports = router;
