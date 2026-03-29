require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Global Middleware ───────────────────────────────────
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Health Check ────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ─── API Routes ──────────────────────────────────────────
app.use('/api/v1', routes);

// ─── 404 Handler ─────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ─── Global Error Handler ────────────────────────────────
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════╗
  ║   🚀  Reimbursement API Server              ║
  ║                                              ║
  ║   Port:    ${String(PORT).padEnd(33)}║
  ║   Mode:    ${String(process.env.NODE_ENV || 'development').padEnd(33)}║
  ║   Health:  http://localhost:${PORT}/health${' '.repeat(Math.max(0, 10 - String(PORT).length))}║
  ║   API:     http://localhost:${PORT}/api/v1${' '.repeat(Math.max(0, 10 - String(PORT).length))}║
  ╚══════════════════════════════════════════════╝
  `);
});

module.exports = app;
