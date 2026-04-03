const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User } = require('../models');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar
});

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Барлық өрісті толтыру қажет.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Құпиясөз кемінде 6 таңбадан тұруы керек.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ where: { email: normalizedEmail } });
    if (existingUser) {
      return res.status(400).json({ message: 'Бұл email бойынша пайдаланушы бұрыннан бар.' });
    }

    const user = await User.create({ name: name.trim(), email: normalizedEmail, password });

    res.status(201).json({
      ...sanitizeUser(user),
      token: generateToken(user.id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Серверде қате орын алды.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email мен құпиясөзді енгізу қажет.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(401).json({ message: 'Email немесе құпиясөз қате.' });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Email немесе құпиясөз қате.' });
    }

    res.json({
      ...sanitizeUser(user),
      token: generateToken(user.id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Серверде қате орын алды.' });
  }
};

const getProfile = async (req, res) => {
  try {
    res.json(sanitizeUser(req.user));
  } catch (error) {
    res.status(500).json({ message: 'Серверде қате орын алды.' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const account = await User.findByPk(req.user.id);

    if (!account) {
      return res.status(404).json({ message: 'Пайдаланушы табылмады.' });
    }

    const { name, email, currentPassword, newPassword } = req.body;
    const normalizedName = name?.trim();
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedName || !normalizedEmail) {
      return res.status(400).json({ message: 'Аты-жөніңіз бен email енгізілуі керек.' });
    }

    const existingUser = await User.findOne({
      where: {
        email: normalizedEmail,
        id: {
          [Op.ne]: account.id
        }
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Бұл email басқа аккаунтқа тиесілі.' });
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'Жаңа құпиясөз кемінде 6 таңбадан тұруы керек.' });
      }

      if (!currentPassword) {
        return res.status(400).json({ message: 'Құпиясөзді өзгерту үшін ағымдағы құпиясөзді енгізіңіз.' });
      }

      const isValidPassword = await account.comparePassword(currentPassword);
      if (!isValidPassword) {
        return res.status(400).json({ message: 'Ағымдағы құпиясөз қате.' });
      }

      account.password = newPassword;
    }

    account.name = normalizedName;
    account.email = normalizedEmail;

    await account.save();

    res.json(sanitizeUser(account));
  } catch (error) {
    res.status(500).json({ message: 'Серверде қате орын алды.' });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        id: {
          [Op.ne]: req.user.id
        }
      },
      attributes: { exclude: ['password'] },
      order: [['name', 'ASC']]
    });

    res.json(users.map(sanitizeUser));
  } catch (error) {
    res.status(500).json({ message: 'Серверде қате орын алды.' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  getUsers
};
