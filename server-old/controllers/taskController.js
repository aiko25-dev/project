const Task = require('../models/Task');
const Project = require('../models/Project');

const getTasks = async (req, res) => {
  try {
    const { projectId, status, assignedTo } = req.query;
    let filter = {};

    if (projectId) filter.projectId = projectId;
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('projectId', 'name')
      .sort('-createdAt');

    res.json(tasks);
  } catch (error) {
    console.error('GetTasks қатесі:', error);
    res.status(500).json({ message: 'Серверде қате кетті', error: error.message });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('projectId', 'name');

    if (!task) {
      return res.status(404).json({ message: 'Тапсырма табылмады' });
    }

    res.json(task);
  } catch (error) {
    console.error('GetTaskById қатесі:', error);
    res.status(500).json({ message: 'Серверде қате кетті', error: error.message });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, priority, dueDate } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ message: 'Тапсырма атауы мен жоба ID міндетті' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Жоба табылмады' });
    }

    const isMember = project.members.some(member => member.toString() === req.user._id.toString());
    const isCreator = project.createdBy.toString() === req.user._id.toString();
    
    if (!isMember && !isCreator) {
      return res.status(403).json({ message: 'Бұл жобаға тапсырма қосуға рұқсатыңыз жоқ' });
    }

    const task = await Task.create({
      title,
      description: description || '',
      projectId,
      assignedTo: assignedTo || req.user._id,
      createdBy: req.user._id,
      priority: priority || 'medium',
      dueDate
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('projectId', 'name');

    res.status(201).json(populatedTask);
  } catch (error) {
    console.error('CreateTask қатесі:', error);
    res.status(500).json({ message: 'Серверде қате кетті', error: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Тапсырма табылмады' });
    }

    const isCreator = task.createdBy.toString() === req.user._id.toString();
    const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();
    
    if (!isCreator && !isAssigned) {
      return res.status(403).json({ message: 'Бұл тапсырманы өңдеуге рұқсатыңыз жоқ' });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('assignedTo', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .populate('projectId', 'name');

    res.json(updatedTask);
  } catch (error) {
    console.error('UpdateTask қатесі:', error);
    res.status(500).json({ message: 'Серверде қате кетті', error: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Тапсырма табылмады' });
    }

    if (task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Тек тапсырманы жасаушы ғана жоя алады' });
    }

    await task.deleteOne();
    res.json({ message: 'Тапсырма сәтті жойылды' });
  } catch (error) {
    console.error('DeleteTask қатесі:', error);
    res.status(500).json({ message: 'Серверде қате кетті', error: error.message });
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};