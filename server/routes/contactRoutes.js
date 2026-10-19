const router = require('express').Router();
const {
  createMessage,
  getMessages,
  deleteMessage,
} = require('../controllers/contactController');
const { protect } = require('../middleware/auth');

router.route('/').post(createMessage).get(protect, getMessages);
router.route('/:id').delete(protect, deleteMessage);

module.exports = router;
