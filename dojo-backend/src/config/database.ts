import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Load environment-specific .env file
if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: '.env.test' });
} else {
  dotenv.config();
}

let sequelize: Sequelize;

if (process.env.NODE_ENV === 'test') {
  // Use SQLite for testing
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
    define: {
      timestamps: true,
      underscored: false,
    },
  });
} else {
  // Use PostgreSQL for development/production
  console.log('DB Config:', {
    database: process.env.DB_NAME || 'dojo_platform',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD ? '***' : 'NO PASSWORD',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
  });
  
  sequelize = new Sequelize({
    database: process.env.DB_NAME || 'dojo_platform',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
}

export default sequelize;