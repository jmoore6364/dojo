import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate, authorize, requireOrganization, requireSchool } from '../../../middleware/auth';

// Mock User model
jest.mock('../../../models/User', () => ({
  findByPk: jest.fn()
}));

import User from '../../../models/User';

describe('Auth Middleware - Unit Tests', () => {
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
    jest.clearAllMocks();
  });

  describe('authenticate middleware', () => {
    it('should authenticate valid token', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        organizationId: 'org-456',
        schoolId: 'school-789',
        isActive: true
      };

      const token = jwt.sign(
        { id: mockUser.id },
        process.env.JWT_SECRET || 'test-secret'
      );

      mockReq.headers = { authorization: `Bearer ${token}` };
      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

      await authenticate(mockReq as any, mockRes as Response, mockNext);

      expect(User.findByPk).toHaveBeenCalledWith(mockUser.id, {
        attributes: { exclude: ['password'] }
      });
      expect(mockNext).toHaveBeenCalled();
      expect((mockReq as any).user).toEqual(mockUser);
      expect((mockReq as any).organization).toBe(mockUser.organizationId);
      expect((mockReq as any).school).toBe(mockUser.schoolId);
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

    it('should reject token for non-existent user', async () => {
      const token = jwt.sign(
        { id: 'non-existent' },
        process.env.JWT_SECRET || 'test-secret'
      );

      mockReq.headers = { authorization: `Bearer ${token}` };
      (User.findByPk as jest.Mock).mockResolvedValue(null);

      await authenticate(mockReq as any, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid authentication' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject token for inactive user', async () => {
      const mockUser = {
        id: 'user-123',
        isActive: false
      };

      const token = jwt.sign(
        { id: mockUser.id },
        process.env.JWT_SECRET || 'test-secret'
      );

      mockReq.headers = { authorization: `Bearer ${token}` };
      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

      await authenticate(mockReq as any, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid authentication' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('authorize middleware', () => {
    it('should allow authorized roles', () => {
      const middleware = authorize('admin', 'instructor');
      (mockReq as any).user = { role: 'admin' };

      middleware(mockReq as any, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should reject unauthorized roles', () => {
      const middleware = authorize('admin', 'instructor');
      (mockReq as any).user = { role: 'student' };

      middleware(mockReq as any, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Insufficient permissions' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should require authentication first', () => {
      const middleware = authorize('admin');

      middleware(mockReq as any, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Authentication required' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle multiple roles correctly', () => {
      const middleware = authorize('admin', 'instructor', 'school_admin');
      
      // Test each role
      const roles = ['admin', 'instructor', 'school_admin'];
      roles.forEach(role => {
        jest.clearAllMocks();
        (mockReq as any).user = { role };
        middleware(mockReq as any, mockRes as Response, mockNext);
        expect(mockNext).toHaveBeenCalled();
      });

      // Test unauthorized role
      jest.clearAllMocks();
      (mockReq as any).user = { role: 'student' };
      middleware(mockReq as any, mockRes as Response, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireOrganization middleware', () => {
    it('should allow requests with organization', () => {
      (mockReq as any).organization = 'org-123';

      requireOrganization(mockReq as any, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should reject requests without organization', () => {
      requireOrganization(mockReq as any, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Organization access required' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireSchool middleware', () => {
    it('should allow requests with school', () => {
      (mockReq as any).school = 'school-123';

      requireSchool(mockReq as any, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should reject requests without school', () => {
      requireSchool(mockReq as any, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'School access required' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});