const { Op } = require('sequelize');
const { Project, Task, User } = require('../models');

const projectInclude = [
  {
    model: User,
    as: 'creator',
    attributes: ['id', 'name', 'email', 'avatar']
  },
  {
    model: User,
    as: 'members',
    attributes: ['id', 'name', 'email', 'avatar'],
    through: { attributes: [] }
  }
];

const getProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({
      include: projectInclude,
      where: {
        [Op.or]: [{ createdBy: req.user.id }, { '$members.id$': req.user.id }]
      },
      order: [['createdAt', 'DESC']],
      distinct: true,
      subQuery: false
    });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Серверде қате орын алды.' });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: projectInclude
    });

    if (!project) {
      return res.status(404).json({ message: 'Жоба табылмады.' });
    }

    const isMember = project.members.some((member) => member.id === req.user.id);
    const isCreator = project.createdBy === req.user.id;

    if (!isMember && !isCreator) {
      return res.status(403).json({ message: 'Бұл жобаға қолжетімділігіңіз жоқ.' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Серверде қате орын алды.' });
  }
};

const createProject = async (req, res) => {
  try {
    const { name, description, memberIds = [] } = req.body;

    if (!name?.trim() || !description?.trim()) {
      return res.status(400).json({ message: 'Жоба атауы мен сипаттамасын енгізу қажет.' });
    }

    const project = await Project.create({
      name: name.trim(),
      description: description.trim(),
      createdBy: req.user.id
    });

    const uniqueMemberIds = [...new Set([req.user.id, ...memberIds.filter(Boolean)])];
    const members = await User.findAll({ where: { id: uniqueMemberIds } });
    await project.setMembers(members);

    const fullProject = await Project.findByPk(project.id, {
      include: projectInclude
    });

    res.status(201).json(fullProject);
  } catch (error) {
    res.status(500).json({ message: 'Серверде қате орын алды.' });
  }
};

const updateProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Жоба табылмады.' });
    }

    if (project.createdBy !== req.user.id) {
      return res.status(403).json({ message: 'Жобаны тек иесі ғана жаңарта алады.' });
    }

    const { name, description, status, memberIds } = req.body;

    await project.update({
      name: name?.trim() ?? project.name,
      description: description?.trim() ?? project.description,
      status: status ?? project.status
    });

    if (Array.isArray(memberIds)) {
      const uniqueMemberIds = [...new Set([req.user.id, ...memberIds.filter(Boolean)])];
      const members = await User.findAll({ where: { id: uniqueMemberIds } });
      await project.setMembers(members);
    }

    const updatedProject = await Project.findByPk(project.id, {
      include: projectInclude
    });

    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: 'Серверде қате орын алды.' });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Жоба табылмады.' });
    }

    if (project.createdBy !== req.user.id) {
      return res.status(403).json({ message: 'Жобаны тек иесі ғана жоя алады.' });
    }

    await Task.destroy({ where: { projectId: project.id } });
    await project.destroy();

    res.json({ message: 'Жоба сәтті жойылды.' });
  } catch (error) {
    res.status(500).json({ message: 'Серверде қате орын алды.' });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
};
