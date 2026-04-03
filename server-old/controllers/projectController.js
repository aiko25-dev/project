const Project = require('../models/Project');
const Task = require('../models/Task');

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { createdBy: req.user._id },
        { members: req.user._id }
      ]
    })
    .populate('createdBy', 'name email avatar')
    .populate('members', 'name email avatar')
    .sort('-createdAt');

    res.json(projects);
  } catch (error) {
    console.error('GetProjects қатесі:', error);
    res.status(500).json({ message: 'Серверде қате кетті', error: error.message });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email avatar')
      .populate('members', 'name email avatar');

    if (!project) {
      return res.status(404).json({ message: 'Жоба табылмады' });
    }

    const isMember = project.members.some(member => member._id.toString() === req.user._id.toString());
    const isCreator = project.createdBy._id.toString() === req.user._id.toString();
    
    if (!isMember && !isCreator) {
      return res.status(403).json({ message: 'Бұл жобаны көруге рұқсатыңыз жоқ' });
    }

    res.json(project);
  } catch (error) {
    console.error('GetProjectById қатесі:', error);
    res.status(500).json({ message: 'Серверде қате кетті', error: error.message });
  }
};

const createProject = async (req, res) => {
  try {
    const { name, description, members } = req.body;

    if (!name || !description) {
      return res.status(400).json({ message: 'Жоба атауы мен сипаттамасы міндетті' });
    }

    const project = await Project.create({
      name,
      description,
      createdBy: req.user._id,
      members: [req.user._id, ...(members || [])]
    });

    const populatedProject = await Project.findById(project._id)
      .populate('createdBy', 'name email avatar')
      .populate('members', 'name email avatar');

    res.status(201).json(populatedProject);
  } catch (error) {
    console.error('CreateProject қатесі:', error);
    res.status(500).json({ message: 'Серверде қате кетті', error: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Жоба табылмады' });
    }

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Тек жоба иесі ғана өңдей алады' });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('createdBy', 'name email avatar')
    .populate('members', 'name email avatar');

    res.json(updatedProject);
  } catch (error) {
    console.error('UpdateProject қатесі:', error);
    res.status(500).json({ message: 'Серверде қате кетті', error: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Жоба табылмады' });
    }

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Тек жоба иесі ғана жоя алады' });
    }

    await Task.deleteMany({ projectId: req.params.id });
    await project.deleteOne();
    
    res.json({ message: 'Жоба және оған байланысты тапсырмалар сәтті жойылды' });
  } catch (error) {
    console.error('DeleteProject қатесі:', error);
    res.status(500).json({ message: 'Серверде қате кетті', error: error.message });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
};