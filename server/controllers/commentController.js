const Comment = require('../models/Comment');
const BlogPost = require('../models/BlogPost');
const ErrorHandler = require('../utils/ErrorHandler');

// GET /api/blog/:postId/comments  (public)
exports.getComments = async (req, res, next) => {
  try {
    const post = await BlogPost.findById(req.params.postId);
    if (!post) return next(new ErrorHandler('Blog post not found', 404));

    const comments = await Comment.find({ post: post._id })
      .populate('author', 'username')
      .sort({ createdAt: 1 });

    res.status(200).json(comments);
  } catch (error) {
    next(error);
  }
};

// POST /api/blog/:postId/comments  (protected)
exports.createComment = async (req, res, next) => {
  try {
    const post = await BlogPost.findById(req.params.postId);
    if (!post) return next(new ErrorHandler('Blog post not found', 404));

    const comment = await Comment.create({
      body: req.body.body,
      author: req.user._id,
      post: post._id,
    });

    res.status(201).json(await comment.populate('author', 'username'));
  } catch (error) {
    next(error);
  }
};
