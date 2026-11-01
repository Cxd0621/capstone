const router = require('express').Router();
const {
  createMessage,
  getMessages,
  deleteMessage,
} = require('../controllers/contactController');
const { protect, adminOnly } = require('../middleware/auth');
const { contactLimit } = require('../middleware/limits');

// Anyone may write once every so often; only the owner may read or delete.
router.route('/').post(contactLimit, createMessage).get(protect, adminOnly, getMessages);
router.route('/:id').delete(protect, adminOnly, deleteMessage);

module.exports = router;
