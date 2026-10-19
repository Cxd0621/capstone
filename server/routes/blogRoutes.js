const router = require('express').Router();
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
} = require('../controllers/blogController');
const { getComments, createComment } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

// Comments belong to a post, so they live under /api/blog/:postId/comments
router.route('/:postId/comments').get(getComments).post(protect, createComment);

// Posts
router.route('/').get(getPosts).post(protect, createPost);
router.route('/:id').get(getPost).put(protect, updatePost).delete(protect, deletePost);

module.exports = router;
