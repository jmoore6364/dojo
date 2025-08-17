import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Organization from '../models/Organization';
import { authenticate } from '../middleware/auth';

const router = express.Router();

const generateToken = (user: any) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      organizationId: user.organizationId,
      schoolId: user.schoolId 
    },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: process.env.JWT_EXPIRE || '30d' } as jwt.SignOptions
  );
};

// Register new organization and admin
router.post('/register-organization', [
  body('organizationName').notEmpty().withMessage('Organization name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { organizationName, email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create organization
    const organization = await Organization.create({
      name: organizationName,
      slug: organizationName.toLowerCase().replace(/\s+/g, '-'),
      email,
      subscription: 'free'
    });

    // Create admin user
    const user = await User.create({
      organizationId: organization.id,
      email,
      password,
      firstName,
      lastName,
      role: 'org_admin',
      emailVerified: false
    });

    const token = generateToken(user);
    
    return res.status(201).json({
      message: 'Organization and admin account created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: user.organizationId
      },
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to create organization' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ 
      where: { email },
      include: [
        { model: Organization, as: 'organization' }
      ]
    });

    if (!user || !(await user.validatePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    const token = generateToken(user);

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: user.organizationId,
        schoolId: user.schoolId,
        organization: (user as any).organization
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', authenticate, async (req: any, res: Response) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [
        { model: Organization, as: 'organization' }
      ]
    });

    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

// Logout (client-side token removal, but we can track it server-side if needed)
router.post('/logout', authenticate, async (_req: any, res: Response) => {
  return res.json({ message: 'Logged out successfully' });
});

export default router;