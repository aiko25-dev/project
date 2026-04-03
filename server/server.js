const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./models');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
app.use('/api/tasks', taskRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

app.get('/api/test', (req, res) => {
  res.json({ message: 'Сервер PostgreSQL-пен жұмыс істеп тұр!' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Серверде қате орын алды.' });
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL қосылды');
    await sequelize.sync({ alter: true });
    console.log('Модельдер синхрондалды');
    const PORT = process.env.PORT || 6000;
    const server = app.listen(PORT, () => console.log(`Сервер ${PORT} портында іске қосылды`));
    server.on('error', (error) => {
      console.error('HTTP сервер қатесі:', error);
    });
  } catch (error) {
    console.error('Серверді іске қосу қатесі:', error);
    process.exit(1);
  }
};

start();
