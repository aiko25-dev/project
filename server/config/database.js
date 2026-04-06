const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const pool = {
  max: 5,
  min: 0,
  acquire: 30000,
  idle: 10000
};

const parseBoolean = (value) => String(value).toLowerCase() === 'true';

const getSslConfig = () => {
  const sslEnabled = process.env.DB_SSL ?? process.env.DATABASE_SSL;

  if (sslEnabled === undefined) {
    return process.env.RENDER === 'true' && process.env.DATABASE_URL
      ? { require: true, rejectUnauthorized: false }
      : undefined;
  }

  return parseBoolean(sslEnabled)
    ? { require: true, rejectUnauthorized: false }
    : undefined;
};

const baseConfig = {
  dialect: 'postgres',
  logging: false,
  pool
};

const ssl = getSslConfig();
if (ssl) {
  baseConfig.dialectOptions = { ssl };
}

const hasDiscreteDbConfig =
  process.env.DB_HOST &&
  process.env.DB_NAME &&
  process.env.DB_USER &&
  process.env.DB_PASSWORD;

let sequelize;

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, baseConfig);
} else {
  if (!hasDiscreteDbConfig) {
    throw new Error(
      'Missing database configuration. Set DATABASE_URL or DB_HOST, DB_NAME, DB_USER, and DB_PASSWORD.'
    );
  }

  const dbHost = process.env.DB_HOST === 'localhost' ? '127.0.0.1' : process.env.DB_HOST;

  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      ...baseConfig,
      host: dbHost,
      port: Number(process.env.DB_PORT || 5432)
    }
  );
}

module.exports = sequelize;
