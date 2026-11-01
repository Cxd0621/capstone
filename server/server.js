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
// Hosts such as Render put one proxy in front of the app. Trusting that hop is
// what lets req.ip hold the real visitor, which the rate limiters depend on.
// Set TRUST_PROXY=0 only when the API is reached directly (no proxy at all).
if (process.env.TRUST_PROXY !== '0') {
  app.set('trust proxy', 1);
}

// helmet sets safe HTTP headers; cors lets the React app (on another origin) call us
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// A portfolio post or a contact message never needs more than a few KB.
app.use(express.json({ limit: '32kb' }));

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

    // Bind to every IPv4 interface on purpose: a hosting platform scans
    // 0.0.0.0:<PORT> to decide whether the service is healthy. Listening
    // without a host can end up IPv6-only on some containers.
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`API listening on 0.0.0.0:${PORT} (health: /api/health)`);
    });

    server.on('error', (error) => {
      console.error(`Failed to listen on port ${PORT}: ${error.message}`);
      process.exit(1);
    });
  } catch (error) {
    console.error(`Failed to start: ${error.message}`);
    process.exit(1);
  }
};

start();

module.exports = app; // exported for tests
