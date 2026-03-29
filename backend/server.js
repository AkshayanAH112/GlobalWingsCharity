require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const connectDB = require('./config/database');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import models to register schemas with Mongoose
require('./models/User');
require('./models/Student');
require('./models/Batch');
require('./models/Grade');
require('./models/Subject');
require('./models/Mark');
require('./models/Attendance');
require('./models/StudentRanking');

// Import routes
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const batchRoutes = require('./routes/batchRoutes');
const gradeRoutes = require('./routes/gradeRoutes');
const markRoutes = require('./routes/markRoutes');
const rankingRoutes = require('./routes/rankingRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());
app.use(mongoSanitize());

// CORS configuration - Allow multiple origins for development
const allowedOrigins = [
  'http://localhost:5000', // Backend API & Swagger UI
  'http://localhost:5173', // Frontend dev server (Vite)
  'http://localhost:8080', // Frontend build/preview
  'http://127.0.0.1:5000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:8080',
];

// In development, also allow local network IPs
if (process.env.NODE_ENV !== 'production') {
  // This will allow any IP on port 5173 or 8080 in development
  allowedOrigins.push(/^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:(5173|8080)$/);
  allowedOrigins.push(/^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:(5173|8080)$/);
  allowedOrigins.push(/^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}:(5173|8080)$/);
}

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      // Check if origin matches any allowed origin
      const isAllowed = allowedOrigins.some(allowed => {
        if (typeof allowed === 'string') {
          return allowed === origin;
        }
        // If it's a regex, test it
        return allowed.test(origin);
      });
      
      if (isAllowed) {
        callback(null, true);
      } else {
        console.log('Blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP. Please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Global Wings Charity API',
  customfavIcon: '/favicon.ico'
}));

// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Health check route
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/marks', markRoutes);
app.use('/api/rankings', rankingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/attendance', attendanceRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Global Wings Charity API',
    version: '1.0.0',
    documentation: '/api-docs',
  });
});

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ═══════════════════════════════════════════════════════');
  console.log(`🌟 Global Wings Charity API Server`);
  console.log('🚀 ═══════════════════════════════════════════════════════');
  console.log(`📡 Server running in ${process.env.NODE_ENV} mode`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
  console.log('🚀 ═══════════════════════════════════════════════════════');
  console.log('');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  process.exit(1);
});

module.exports = app;
