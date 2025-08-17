import request from 'supertest';
import express from 'express';
import authRoutes from '../../routes/auth';

// Mock the models completely
jest.mock('../../models/User');
jest.mock('../../models/Organization');
jest.mock('../../models', () => ({
  sequelize: {
    authenticate: jest.fn(),
    sync: jest.fn(),
    close: jest.fn()
  }
}));

import User from '../../models/User';
import Organization from '../../models/Organization';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register-organization', () => {
    it('should create organization and admin user', async () => {
      const mockOrg = {
        id: 'org-123',
        name: 'Test Dojo',
        slug: 'test-dojo',
        email: 'admin@testdojo.com'
      };

      const mockUser = {
        id: 'user-456',
        email: 'admin@testdojo.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'org_admin',
        organizationId: 'org-123'
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (Organization.create as jest.Mock).mockResolvedValue(mockOrg);
      (User.create as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/register-organization')
        .send({
          organizationName: 'Test Dojo',
          email: 'admin@testdojo.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('admin@testdojo.com');
      expect(response.body.user.role).toBe('org_admin');
      expect(response.body.organization.name).toBe('Test Dojo');
    });

    it('should reject duplicate email', async () => {
      (User.findOne as jest.Mock).mockResolvedValue({ 
        id: 'existing-user',
        email: 'existing@test.com' 
      });

      const response = await request(app)
        .post('/api/auth/register-organization')
        .send({
          organizationName: 'Test Dojo',
          email: 'existing@test.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email already registered');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register-organization')
        .send({
          email: 'invalid-email',
          password: '123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        password: '$2a$10$hashedpassword',
        firstName: 'Test',
        lastName: 'User',
        role: 'instructor',
        organizationId: 'org-456',
        isActive: true,
        validatePassword: jest.fn().mockResolvedValue(true),
        update: jest.fn(),
        organization: {
          id: 'org-456',
          name: 'Test Organization'
        }
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('test@example.com');
      expect(mockUser.validatePassword).toHaveBeenCalledWith('password123');
      expect(mockUser.update).toHaveBeenCalledWith({ lastLogin: expect.any(Date) });
    });

    it('should reject invalid password', async () => {
      const mockUser = {
        validatePassword: jest.fn().mockResolvedValue(false),
        isActive: true
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should reject non-existent user', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'anypassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should reject inactive user', async () => {
      const mockUser = {
        validatePassword: jest.fn().mockResolvedValue(true),
        isActive: false
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Account is deactivated');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user with valid token', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'student',
        organizationId: 'org-456',
        isActive: true,
        organization: {
          id: 'org-456',
          name: 'Test Org'
        }
      };

      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

      // Create a valid token
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { id: mockUser.id },
        process.env.JWT_SECRET || 'test-secret-key-for-testing'
      );

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.email).toBe('test@example.com');
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Authentication required');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const mockUser = {
        id: 'user-123',
        isActive: true,
        organizationId: 'org-456'
      };

      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { id: mockUser.id },
        process.env.JWT_SECRET || 'test-secret-key-for-testing'
      );

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logged out successfully');
    });
  });
});