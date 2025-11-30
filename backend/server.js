// backend/server.js
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const attendanceRoutes = require('./routes/attendance');

const app = express();

// connect DB early
connectDB();

// register middlewares BEFORE routes
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

// routes
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);

// health
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ---------- ERROR HANDLER: must be AFTER routes ----------
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
