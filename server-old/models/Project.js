const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Жоба атауы міндетті' },
      len: { args: [1, 100], msg: 'Жоба атауы 100 символдан аспауы керек' }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: { args: [1, 500], msg: 'Сипаттама 500 символдан аспауы керек' }
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'archived'),
    defaultValue: 'active'
  }
}, {
  timestamps: true
});

module.exports = Project;