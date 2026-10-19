const BlogPost = require('../models/BlogPost');
const Comment = require('../models/Comment');
const ErrorHandler = require('../utils/ErrorHandler');

// GET /api/blog  (public) - author username populated
exports.getPosts = async (req, res, next) => {
  try {
    const posts = await BlogPost.find()
      .populate('author', 'username')
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
};

// GET /api/blog/:id  (public) - author + comments populated
exports.getPost = async (req, res, next) => {
  try {
    const post = await BlogPost.findById(req.params.id).populate('author', 'username');

    if (!post) return next(new ErrorHandler('Blog post not found', 404));

    const comments = await Comment.find({ post: post._id })
      .populate('author', 'username')
      .sort({ createdAt: 1 });

    res.status(200).json({ ...post.toObject(), comments });
  } catch (error) {
    next(error);
  }
};

// POST /api/blog  (protected)
exports.createPost = async (req, res, next) => {
  try {
    const { title, content } = req.body;

    const post = await BlogPost.create({ title, content, author: req.user._id });
    const populated = await post.populate('author', 'username');

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// PUT /api/blog/:id  (protected + only the author)
exports.updatePost = async (req, res, next) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return next(new ErrorHandler('Blog post not found', 404));

    // Authorization: only the original author may edit
    if (post.author.toString() !== req.user._id.toString()) {
      return next(new ErrorHandler('You can only edit your own posts', 403));
    }

    post.title = req.body.title ?? post.title;
    post.content = req.body.content ?? post.content;
    await post.save();

    res.status(200).json(await post.populate('author', 'username'));
  } catch (error) {
    next(error);
  }
};

// DELETE /api/blog/:id  (protected + only the author)
exports.deletePost = async (req, res, next) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return next(new ErrorHandler('Blog post not found', 404));

    if (post.author.toString() !== req.user._id.toString()) {
      return next(new ErrorHandler('You can only delete your own posts', 403));
    }

    // Remove the post and its comments together, so nothing is left orphaned
    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();

    res.status(200).json({ success: true, message: 'Blog post deleted', _id: post._id });
  } catch (error) {
    next(error);
  }
};
