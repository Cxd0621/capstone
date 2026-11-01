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

// DELETE /api/blog/:postId/comments/:commentId  (protected)
exports.deleteComment = async (req, res, next) => {
  try {
    const post = await BlogPost.findById(req.params.postId);
    if (!post) return next(new ErrorHandler('Blog post not found', 404));

    // Look the comment up inside this post, so an id from another post cannot be used here
    const comment = await Comment.findOne({
      _id: req.params.commentId,
      post: post._id,
    });
    if (!comment) return next(new ErrorHandler('Comment not found on this post', 404));

    const wroteComment = comment.author.toString() === req.user._id.toString();
    const ownsPost = post.author.toString() === req.user._id.toString();

    if (!wroteComment && !ownsPost) {
      return next(
        new ErrorHandler('Only the comment author or the post author can delete it', 403)
      );
    }

    await comment.deleteOne();
    res.status(200).json({ success: true, message: 'Comment deleted', _id: comment._id });
  } catch (error) {
    next(error);
  }
};
