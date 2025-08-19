import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { Request, Response } from 'express';
import registrationService from '../services/registration.service';
import { generateToken } from '../utils/jwt';
import { authenticate } from '../middleware/auth';

const router = Router();

// Validation middleware for registration
const validateRegistration = [
  body('organizationName')
    .trim()
    .notEmpty().withMessage('Organization name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Organization name must be between 2 and 100 characters'),
  
  body('businessType')
    .trim()
    .notEmpty().withMessage('Business type is required'),
  
  body('martialArtTypes')
    .isArray({ min: 1 }).withMessage('At least one martial art type is required')
    .custom((value) => value.every((art: string) => typeof art === 'string' && art.trim().length > 0))
    .withMessage('Invalid martial art types'),
  
  body('numberOfSchools')
    .isInt({ min: 1, max: 100 }).withMessage('Number of schools must be between 1 and 100'),
  
  body('estimatedStudents')
    .isInt({ min: 1, max: 10000 }).withMessage('Estimated students must be between 1 and 10000'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),
  
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^[\d\s\-\+\(\)]+$/).withMessage('Invalid phone number'),
  
  body('address')
    .trim()
    .notEmpty().withMessage('Address is required'),
  
  body('city')
    .trim()
    .notEmpty().withMessage('City is required'),
  
  body('state')
    .trim()
    .notEmpty().withMessage('State is required'),
  
  body('zipCode')
    .trim()
    .notEmpty().withMessage('Zip code is required'),
  
  body('country')
    .trim()
    .notEmpty().withMessage('Country is required'),
  
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
  
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('website')
    .optional()
    .trim()
    .isURL().withMessage('Invalid website URL'),
  
  body('firstSchoolName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('School name must be between 2 and 100 characters'),
  
  body('firstSchoolAddress')
    .optional()
    .trim(),
];

// POST /api/registration/register
router.post('/register', validateRegistration, async (req: Request, res: Response): Promise<any> => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    // Check if email already exists
    const { User } = require('../models');
    const existingUser = await User.findOne({ where: { email: req.body.email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    // Register the dojo
    const result = await registrationService.registerDojo(req.body);

    // Generate JWT token for auto-login
    const token = generateToken({
      id: result.user.id,
      email: result.user.email,
      role: result.user.role,
      organizationId: result.organization.id,
      schoolId: result.school.id,
    });

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Dojo registered successfully',
      data: {
        organization: {
          id: result.organization.id,
          name: result.organization.name,
          slug: result.organization.slug,
          subscription: result.organization.subscription,
          trialEndDate: result.organization.trialEndDate,
        },
        school: {
          id: result.school.id,
          name: result.school.name,
        },
        user: {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          role: result.user.role,
        },
        trial: {
          days: result.trialDays,
          endDate: result.organization.trialEndDate,
        },
        token,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message,
    });
  }
});

// GET /api/registration/check-email
router.post('/check-email', [
  body('email').isEmail().normalizeEmail(),
], async (req: Request, res: Response): Promise<any> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { User } = require('../models');
    const existingUser = await User.findOne({ where: { email: req.body.email } });
    
    res.json({
      success: true,
      available: !existingUser,
    });
  } catch (error: any) {
    console.error('Email check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check email availability',
    });
  }
});

// GET /api/registration/trial-status (authenticated)
router.get('/trial-status', authenticate, async (req: Request, res: Response): Promise<any> => {
  try {
    const organizationId = (req as any).user.organizationId;
    const status = await registrationService.checkTrialStatus(organizationId);
    
    res.json({
      success: true,
      data: status,
    });
  } catch (error: any) {
    console.error('Trial status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check trial status',
    });
  }
});

// POST /api/registration/extend-trial (authenticated, admin only)
router.post('/extend-trial', authenticate, [
  body('days').isInt({ min: 1, max: 90 }).withMessage('Days must be between 1 and 90'),
], async (req: Request, res: Response): Promise<any> => {
  try {
    // Check if user is super admin or org admin
    const userRole = (req as any).user.role;
    if (userRole !== 'super_admin' && userRole !== 'org_admin') {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const organizationId = (req as any).user.organizationId;
    const organization = await registrationService.extendTrial(organizationId, req.body.days);
    
    res.json({
      success: true,
      message: `Trial extended by ${req.body.days} days`,
      data: {
        trialEndDate: organization.trialEndDate,
      },
    });
  } catch (error: any) {
    console.error('Trial extension error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to extend trial',
    });
  }
});

// POST /api/registration/convert-subscription (authenticated, admin only)
router.post('/convert-subscription', authenticate, [
  body('subscriptionType')
    .isIn(['free', 'basic', 'premium', 'enterprise'])
    .withMessage('Invalid subscription type'),
], async (req: Request, res: Response): Promise<any> => {
  try {
    // Check if user is super admin or org admin
    const userRole = (req as any).user.role;
    if (userRole !== 'super_admin' && userRole !== 'org_admin') {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const organizationId = (req as any).user.organizationId;
    const organization = await registrationService.convertToSubscription(
      organizationId,
      req.body.subscriptionType
    );
    
    res.json({
      success: true,
      message: `Subscription converted to ${req.body.subscriptionType}`,
      data: {
        subscription: organization.subscription,
        subscriptionStatus: organization.subscriptionStatus,
        subscriptionExpiry: organization.subscriptionExpiry,
        settings: organization.settings,
      },
    });
  } catch (error: any) {
    console.error('Subscription conversion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to convert subscription',
    });
  }
});

export default router;