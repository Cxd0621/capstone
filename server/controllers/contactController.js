const Message = require('../models/Message');
const ErrorHandler = require('../utils/ErrorHandler');

// POST /api/contact  (public) - the portfolio contact form
exports.createMessage = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return next(new ErrorHandler('Please provide your name, email and a message', 400));
    }

    const saved = await Message.create({ name, email, message });
    res.status(201).json({ success: true, message: 'Message received, thank you!', _id: saved._id });
  } catch (error) {
    next(error);
  }
};

// GET /api/contact  (protected) - the admin reads the messages
exports.getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/contact/:id  (protected)
exports.deleteMessage = async (req, res, next) => {
  try {
    const deleted = await Message.findByIdAndDelete(req.params.id);
    if (!deleted) return next(new ErrorHandler('Message not found', 404));
    res.status(200).json({ success: true, message: 'Message deleted', _id: deleted._id });
  } catch (error) {
    next(error);
  }
};
