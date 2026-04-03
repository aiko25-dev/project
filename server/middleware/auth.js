const jwt = require('jsonwebtoken');
const { User } = require('../models');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findByPk(decoded.id, { attributes: { exclude: ['password'] } });

      if (!req.user) {
        return res.status(401).json({ message: 'Пайдаланушы табылмады.' });
      }

      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Рұқсат етілмеді.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Токен жоқ.' });
  }
};

module.exports = { protect };
