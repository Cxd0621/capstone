require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoose = require('mongoose');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const notFound = require('./middleware/notFound');

const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const blogRoutes = require('./routes/blogRoutes');
const contactRoutes = require('./routes/contactRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ---------------------------------------------------------------- security
// helmet sets safe HTTP headers; cors lets the React app (on another origin) call us
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : '*',
  })
);

app.use(express.json());

// ------------------------------------------------------------------ health
app.get('/api/health', (req, res) =>
  res.status(200).json({ success: true, status: 'ok', uptime: process.uptime() })
);

// ------------------------------------------------------------------ routes
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/contact', contactRoutes);

// --------------------------------------------------------- errors (last)
app.use(notFound);
app.use(errorHandler);

// ------------------------------------------------------------------- start
const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`API running on http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error(`Failed to start: ${error.message}`);
    process.exit(1);
  }
};

start();

module.exports = app; // exported for tests
