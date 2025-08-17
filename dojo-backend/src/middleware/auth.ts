import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

interface AuthRequest extends Request {
  user?: any;
  organization?: string;
  school?: string;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid authentication' });
    }

    req.user = user;
    req.organization = user.organizationId;
    req.school = user.schoolId;
    
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid authentication' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    return next();
  };
};

export const requireOrganization = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.organization) {
    return res.status(403).json({ error: 'Organization access required' });
  }
  return next();
};

export const requireSchool = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.school) {
    return res.status(403).json({ error: 'School access required' });
  }
  return next();
};