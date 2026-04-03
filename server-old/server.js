const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize, User, Project, Task } = require('./models');

dotenv.config();

const app = express();


app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');


app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/api/test', (req, res) => {
  res.json({ message: 'Сервер PostgreSQL-мен жұмыс істейді! 🚀' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Бет табылмады' });
});

app.use((err, req, res, next) => {
  console.error('Сервер қатесі:', err.stack);
  res.status(500).json({ message: 'Серверде қате кетті', error: err.message });
});


const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL қосылды');
    
    
    await sequelize.sync({ alter: true });
    console.log('✅ Модельдер синхрондалды');
    
    const PORT = process.env.PORT || 6000;
    app.listen(PORT, () => {
      console.log(`🚀 Сервер ${PORT} портында жұмыс істейді`);
      console.log(`📍 http://localhost:${PORT}/api/test - тест үшін`);
    });
  } catch (error) {
    console.error('❌ Серверді іске қосу қатесі:', error.message);
  }
};

startServer();