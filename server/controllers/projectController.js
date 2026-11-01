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

// PUT /api/projects/:id  (protected + only the owner)
exports.updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return next(new ErrorHandler('Project not found', 404));

    // Authorization: a signed-in visitor must not rewrite somebody else's project
    if (project.user.toString() !== req.user._id.toString()) {
      return next(new ErrorHandler('You can only edit your own projects', 403));
    }

    const { title, description, imageUrl, repoUrl, liveUrl } = req.body;
    project.title = title ?? project.title;
    project.description = description ?? project.description;
    project.imageUrl = imageUrl ?? project.imageUrl;
    project.repoUrl = repoUrl ?? project.repoUrl;
    project.liveUrl = liveUrl ?? project.liveUrl;

    await project.save();
    res.status(200).json(await project.populate('user', 'username'));
  } catch (error) {
    next(error);
  }
};

// DELETE /api/projects/:id  (protected + only the owner)
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return next(new ErrorHandler('Project not found', 404));

    if (project.user.toString() !== req.user._id.toString()) {
      return next(new ErrorHandler('You can only delete your own projects', 403));
    }

    await project.deleteOne();
    res.status(200).json({ success: true, message: 'Project deleted', _id: project._id });
  } catch (error) {
    next(error);
  }
};
