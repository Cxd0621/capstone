const Project = require('../models/Project');
const ErrorHandler = require('../utils/ErrorHandler');

// GET /api/projects  (public)
exports.getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find()
      .populate('user', 'username')
      .sort({ createdAt: -1 });
    res.status(200).json(projects);
  } catch (error) {
    next(error);
  }
};

// GET /api/projects/:id  (public)
exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate('user', 'username');
    if (!project) return next(new ErrorHandler('Project not found', 404));
    res.status(200).json(project);
  } catch (error) {
    next(error);
  }
};

// POST /api/projects  (protected)
exports.createProject = async (req, res, next) => {
  try {
    const { title, description, imageUrl, repoUrl, liveUrl } = req.body;

    const project = await Project.create({
      title,
      description,
      imageUrl,
      repoUrl,
      liveUrl,
      user: req.user._id,
    });

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

// PUT /api/projects/:id  (protected)
exports.updateProject = async (req, res, next) => {
  try {
    const { title, description, imageUrl, repoUrl, liveUrl } = req.body;

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { title, description, imageUrl, repoUrl, liveUrl },
      { new: true, runValidators: true }
    );

    if (!project) return next(new ErrorHandler('Project not found', 404));
    res.status(200).json(project);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/projects/:id  (protected)
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return next(new ErrorHandler('Project not found', 404));
    res.status(200).json({ success: true, message: 'Project deleted', _id: project._id });
  } catch (error) {
    next(error);
  }
};
