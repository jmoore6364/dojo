import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

// Now import modules that depend on environment variables
import { sequelize } from './models';
import authRoutes from './routes/auth';
import registrationRoutes from './routes/registration.routes';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/registration', registrationRoutes);

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