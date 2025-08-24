import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

// Now import modules that depend on environment variables
import { sequelize } from './models';
import authRoutes from './routes/auth';
import registrationRoutes from './routes/registration.routes';
import schoolsRoutes from './routes/schools.routes';

const app = express();
const PORT = process.env.PORT || 5000;

// Manual CORS implementation
app.use((req, res, next) => {
  const origin = req.headers.origin as string;
  
  console.log('CORS Debug - Origin:', origin, 'NODE_ENV:', process.env.NODE_ENV);
  
  // In development, allow all localhost origins
  if (process.env.NODE_ENV === 'development') {
    if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      console.log('Setting CORS origin to:', origin);
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
  } else {
    // In production, use configured URL
    res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL || 'http://localhost:3000');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
});

// Other middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/registration', registrationRoutes);
app.use('/api/schools', schoolsRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', message: 'Dojo Platform API is running' });
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Database connection and server start
const startServer = async () => {
  try {
    // Try to connect to database
    try {
      await sequelize.authenticate();
      console.log('✅ Database connection established successfully');
      
      // Sync database (use migrations in production)
      if (process.env.NODE_ENV === 'development') {
        await sequelize.sync({ alter: true });
        console.log('✅ Database synced');
      }
    } catch (dbError) {
      console.warn('⚠️  Database connection failed:', (dbError as Error).message);
      console.warn('⚠️  Server will run without database functionality');
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      if (process.env.NODE_ENV === 'development') {
        console.log(`📝 API Documentation: http://localhost:${PORT}/api-docs (if configured)`);
      }
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

startServer();