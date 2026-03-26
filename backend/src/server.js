require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB before starting the server
connectDB().catch((err) => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('Health check endpoint called');
  res.json({ status: 'ok', message: 'E-Ayurvedic backend running' });
});

// Import and mount auth routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Import and mount consultation routes
const consultationRoutes = require('./routes/consultationRoutes');
app.use('/api/consultations', consultationRoutes);

// Import and mount consultation share routes
const consultationShareRoutes = require('./routes/consultationShareRoutes');
app.use('/api/consultation-share', consultationShareRoutes);

// Import and mount admin routes
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

// Import and mount doctor routes
const doctorRoutes = require('./routes/doctorRoutes');
app.use('/api/doctor', doctorRoutes);

// Import and mount appointment routes
const appointmentRoutes = require('./routes/appointmentRoutes');
app.use('/api/appointments', appointmentRoutes);

// Route placeholders
try {
  const userRoutes = require('./routes/userRoutes');
  app.use('/api/user', userRoutes);
} catch (err) {
  console.warn('userRoutes not found yet');
}

// Start server
const PORT = process.env.PORT || 5000;
console.log('About to start server...');
console.log('PORT environment variable:', process.env.PORT);
console.log('Using port:', PORT);

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Server is listening!');
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

// Prevent process from exiting on errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

module.exports = app;
