import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate, authorize, requireOrganization, requireSchool } from '../../middleware/auth';
import { createOrganization, createUser } from '../helpers/factories';

describe('Auth Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('authenticate', () => {
    it('should authenticate valid token', async () => {
      const org = await createOrganization();
      const user = await createUser(org.id);
      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET || 'test-secret-key-for-testing'
      );

      mockReq.headers = { authorization: `Bearer ${token}` };

      await authenticate(mockReq as any, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect((mockReq as any).user).toBeDefined();
      expect((mockReq as any).user.id).toBe(user.id);
    });

    it('should reject request without token', async () => {
      await authenticate(mockReq as any, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Authentication required' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject invalid token', async () => {
      mockReq.headers = { authorization: 'Bearer invalid-token' };

      await authenticate(mockReq as any, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid authentication' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject token for inactive user', async () => {
      const org = await createOrganization();
      const user = await createUser(org.id, { isActive: false });
      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET || 'test-secret-key-for-testing'
      );

      mockReq.headers = { authorization: `Bearer ${token}` };

      await authenticate(mockReq as any, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid authentication' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('authorize', () => {
    it('should allow authorized roles', () => {
      const middleware = authorize('admin', 'instructor');
      (mockReq as any).user = { role: 'admin' };

      middleware(mockReq as any, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject unauthorized roles', () => {
      const middleware = authorize('admin', 'instructor');
      (mockReq as any).user = { role: 'student' };

      middleware(mockReq as any, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Insufficient permissions' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should require authentication', () => {
      const middleware = authorize('admin');

      middleware(mockReq as any, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Authentication required' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireOrganization', () => {
    it('should allow requests with organization', () => {
      (mockReq as any).organization = 'org-id-123';

      requireOrganization(mockReq as any, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject requests without organization', () => {
      requireOrganization(mockReq as any, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Organization access required' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireSchool', () => {
    it('should allow requests with school', () => {
      (mockReq as any).school = 'school-id-123';

      requireSchool(mockReq as any, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject requests without school', () => {
      requireSchool(mockReq as any, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'School access required' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});