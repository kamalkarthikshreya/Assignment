/**
 * Main Express server entry point
 * MERN Machine Test - Assessment
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ----- Middleware -----
app.use(helmet());                        // Security headers
app.use(cors());                          // Cross-origin requests (React frontend)
app.use(morgan('dev'));                   // HTTP request logging
app.use(express.json());                  // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// ----- Routes -----
app.use('/api/auth',   require('./routes/auth'));
app.use('/api/agents', require('./routes/agents'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/lists',  require('./routes/lists'));

// ----- Health Check -----
app.get('/', (req, res) => {
  res.json({ message: 'MERN Assessment API is running 🚀' });
});

// ----- Global Error Handler -----
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
