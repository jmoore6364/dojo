import request from 'supertest';
import express from 'express';
import authRoutes from '../../routes/auth';
import User from '../../models/User';
import Organization from '../../models/Organization';
import { createOrganization, createUser, generateToken } from '../helpers/factories';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
  describe('POST /api/auth/register-organization', () => {
    it('should create a new organization and admin user', async () => {
      const response = await request(app)
        .post('/api/auth/register-organization')
        .send({
          organizationName: 'Test Dojo',
          email: 'admin@testdojo.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('organization');
      expect(response.body.user.role).toBe('org_admin');
      
      // Verify organization was created
      const org = await Organization.findOne({ where: { email: 'admin@testdojo.com' } });
      expect(org).toBeTruthy();
      expect(org?.name).toBe('Test Dojo');
      
      // Verify user was created
      const user = await User.findOne({ where: { email: 'admin@testdojo.com' } });
      expect(user).toBeTruthy();
      expect(user?.role).toBe('org_admin');
    });

    it('should not allow duplicate email registration', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register-organization')
        .send({
          organizationName: 'Test Dojo',
          email: 'duplicate@test.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
        });

      // Attempt duplicate registration
      const response = await request(app)
        .post('/api/auth/register-organization')
        .send({
          organizationName: 'Another Dojo',
          email: 'duplicate@test.com',
          password: 'password456',
          firstName: 'Jane',
          lastName: 'Smith',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email already registered');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register-organization')
        .send({
          email: 'invalid-email',
          password: '123',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/auth/login', () => {
    let testOrg: Organization;
    let testUser: User;
    const testPassword = 'password123';

    beforeEach(async () => {
      testOrg = await createOrganization();
      testUser = await createUser(testOrg.id, {
        email: 'test@example.com',
        password: testPassword,
        role: 'instructor',
      });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: testPassword,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.role).toBe('instructor');
    });

    it('should reject invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should reject non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'anypassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should reject inactive user', async () => {
      await testUser.update({ isActive: false });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: testPassword,
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Account is deactivated');
    });

    it('should update last login timestamp', async () => {
      const beforeLogin = testUser.lastLogin;

      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: testPassword,
        });

      await testUser.reload();
      expect(testUser.lastLogin).not.toEqual(beforeLogin);
    });
  });

  describe('GET /api/auth/me', () => {
    let testOrg: Organization;
    let testUser: User;
    let token: string;

    beforeEach(async () => {
      testOrg = await createOrganization();
      testUser = await createUser(testOrg.id, {
        email: 'auth@test.com',
        role: 'school_admin',
      });
      token = generateToken(testUser);
    });

    it('should return current user with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.email).toBe('auth@test.com');
      expect(response.body.role).toBe('school_admin');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Authentication required');
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid authentication');
    });
  });

  describe('POST /api/auth/logout', () => {
    let token: string;

    beforeEach(async () => {
      const org = await createOrganization();
      const user = await createUser(org.id);
      token = generateToken(user);
    });

    it('should logout successfully with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logged out successfully');
    });

    it('should reject logout without token', async () => {
      const response = await request(app)
        .post('/api/auth/logout');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Authentication required');
    });
  });
});