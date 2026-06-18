// ─── server.js ────────────────────────────────────────────────────
// DecodeLabs Project 3 — Database Integration
// Project 2 API + MongoDB via Mongoose
// ──────────────────────────────────────────────────────────────────

require('dotenv').config(); // Load .env variables first

const express    = require('express');
const cors       = require('cors');
const connectDB  = require('./config/db');

const userRoutes = require('./routes/users');
const taskRoutes = require('./routes/tasks');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Connect to MongoDB ────────────────────────────────────────────
connectDB();

// ── Middleware ────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ── Routes ────────────────────────────────────────────────────────
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

// ── Health check ──────────────────────────────────────────────────
app.get('/', (req, res) => {
  const mongoose = require('mongoose');
  res.json({
    status  : 'ok',
    message : 'BuildFlow API + MongoDB is running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    version : '2.0.0'
  });
});

// ── 404 handler ───────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error  : `Route ${req.method} ${req.url} not found`
  });
});

// ── Global error handler ──────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(500).json({
    success: false,
    error  : 'Internal Server Error',
    message: err.message
  });
});

// ── Start server ──────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 BuildFlow API running on http://localhost:${PORT}`);
  console.log(`   Users  → http://localhost:${PORT}/api/users`);
  console.log(`   Tasks  → http://localhost:${PORT}/api/tasks\n`);
});