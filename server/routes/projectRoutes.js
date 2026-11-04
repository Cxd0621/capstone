const router = require('express').Router();
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const { protect, adminOnly } = require('../middleware/auth');

router.route('/').get(getProjects).post(protect, adminOnly, createProject);
router
  .route('/:id')
  .get(getProject)
  .put(protect, adminOnly, updateProject)
  .delete(protect, adminOnly, deleteProject);

module.exports = router;
