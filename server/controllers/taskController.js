const { Op } = require('sequelize');
const { Project, Task, User } = require('../models');

const taskInclude = [
  {
    model: User,
    as: 'assignee',
    attributes: ['id', 'name', 'email', 'avatar']
  },
  {
    model: User,
    as: 'creator',
    attributes: ['id', 'name', 'email', 'avatar']
  },
  {
    model: Project,
    as: 'project',
    attributes: ['id', 'name', 'status']
  }
];

const getAccessibleProject = async (projectId, userId) => {
  const project = await Project.findByPk(projectId, {
    include: [
      {
        model: User,
        as: 'members',
        attributes: ['id'],
        through: { attributes: [] }
      }
    ]
  });

  if (!project) {
    return null;
  }

  const isCreator = project.createdBy === userId;
  const isMember = project.members.some((member) => member.id === userId);

  return isCreator || isMember ? project : null;
};

const getTasks = async (req, res) => {
  try {
    const { projectId, status, assigneeId } = req.query;
    const where = {};

    if (projectId) {
      const project = await getAccessibleProject(projectId, req.user.id);
      if (!project) {
        return res.status(403).json({ message: 'Бұл жобаға қолжетімділігіңіз жоқ.' });
      }

      where.projectId = projectId;
    } else {
      const projects = await Project.findAll({
        include: [
          {
            model: User,
            as: 'members',
            attributes: ['id'],
            through: { attributes: [] }
          }
        ],
        where: {
          [Op.or]: [{ createdBy: req.user.id }, { '$members.id$': req.user.id }]
        },
        attributes: ['id'],
        distinct: true,
        subQuery: false
      });

      where.projectId = projects.map((project) => project.id);
    }

    if (status) {
      where.status = status;
    }

    if (assigneeId) {
      where.assignedTo = assigneeId;
    }

    const tasks = await Task.findAll({
      where,
      include: taskInclude,
      order: [['createdAt', 'DESC']]
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Серверде қате орын алды.' });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: taskInclude
    });

    if (!task) {
      return res.status(404).json({ message: 'Тапсырма табылмады.' });
    }

    const project = await getAccessibleProject(task.projectId, req.user.id);
    if (!project) {
      return res.status(403).json({ message: 'Бұл тапсырмаға қолжетімділігіңіз жоқ.' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Серверде қате орын алды.' });
  }
};

const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      projectId,
      assignedTo,
      priority = 'medium',
      dueDate,
      status = 'todo'
    } = req.body;

    if (!title?.trim() || !projectId) {
      return res.status(400).json({ message: 'Тапсырма атауы мен жобаны көрсету қажет.' });
    }

    const project = await getAccessibleProject(projectId, req.user.id);
    if (!project) {
      return res.status(403).json({ message: 'Бұл жобаға қолжетімділігіңіз жоқ.' });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description?.trim() || '',
      projectId,
      assignedTo: assignedTo || req.user.id,
      createdBy: req.user.id,
      priority,
      dueDate: dueDate || null,
      status
    });

    const fullTask = await Task.findByPk(task.id, {
      include: taskInclude
    });

    res.status(201).json(fullTask);
  } catch (error) {
    res.status(500).json({ message: 'Серверде қате орын алды.' });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Тапсырма табылмады.' });
    }

    const project = await getAccessibleProject(task.projectId, req.user.id);
    if (!project) {
      return res.status(403).json({ message: 'Бұл тапсырмаға қолжетімділігіңіз жоқ.' });
    }

    const updates = { ...req.body };

    if (typeof updates.title === 'string') {
      updates.title = updates.title.trim();
    }

    if (typeof updates.description === 'string') {
      updates.description = updates.description.trim();
    }

    if (updates.projectId && updates.projectId !== task.projectId) {
      const nextProject = await getAccessibleProject(updates.projectId, req.user.id);
      if (!nextProject) {
        return res.status(403).json({ message: 'Таңдалған жобаға қолжетімділігіңіз жоқ.' });
      }
    }

    await task.update(updates);

    const updatedTask = await Task.findByPk(task.id, {
      include: taskInclude
    });

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Серверде қате орын алды.' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Тапсырма табылмады.' });
    }

    const project = await getAccessibleProject(task.projectId, req.user.id);
    if (!project) {
      return res.status(403).json({ message: 'Бұл тапсырмаға қолжетімділігіңіз жоқ.' });
    }

    await task.destroy();
    res.json({ message: 'Тапсырма сәтті жойылды.' });
  } catch (error) {
    res.status(500).json({ message: 'Серверде қате орын алды.' });
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};
