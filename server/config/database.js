const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const dbHost = process.env.DB_HOST === 'localhost' ? '127.0.0.1' : process.env.DB_HOST;

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: dbHost,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

module.exports = sequelize;
