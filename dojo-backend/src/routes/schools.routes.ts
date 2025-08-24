import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth';
import School from '../models/School';
import User from '../models/User';
import { Op } from 'sequelize';

const router = express.Router();

// Get all schools for an organization
router.get('/', authenticate, authorize('super_admin', 'org_admin', 'school_admin'), async (req: any, res: Response) => {
  try {
    const { search, isActive, martialArt } = req.query;
    
    const where: any = {
      organizationId: req.user.organizationId
    };

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { city: { [Op.iLike]: `%${search}%` } },
        { address: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const schools = await School.findAll({
      where,
      include: [
        {
          model: User,
          as: 'students',
          attributes: ['id'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Transform data to include student counts
    const schoolsWithCounts = schools.map(school => {
      const schoolData = school.toJSON() as any;
      return {
        ...schoolData,
        currentStudents: schoolData.students ? schoolData.students.length : 0,
        students: undefined // Remove the students array from response
      };
    });

    // Filter by martial art if specified
    let filteredSchools = schoolsWithCounts;
    if (martialArt) {
      filteredSchools = schoolsWithCounts.filter((school: any) => 
        school.martialArts && school.martialArts.includes(martialArt)
      );
    }

    return res.json({
      success: true,
      data: filteredSchools
    });
  } catch (error) {
    console.error('Error fetching schools:', error);
    return res.status(500).json({ error: 'Failed to fetch schools' });
  }
});

// Get single school
router.get('/:id', authenticate, authorize('super_admin', 'org_admin', 'school_admin'), async (req: any, res: Response) => {
  try {
    const school = await School.findOne({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId
      },
      include: [
        {
          model: User,
          as: 'students',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false
        }
      ]
    });

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    const schoolData = school.toJSON() as any;
    return res.json({
      success: true,
      data: {
        ...schoolData,
        currentStudents: schoolData.students ? schoolData.students.length : 0
      }
    });
  } catch (error) {
    console.error('Error fetching school:', error);
    return res.status(500).json({ error: 'Failed to fetch school' });
  }
});

// Create new school
router.post('/', [
  authenticate,
  authorize('super_admin', 'org_admin'),
  body('name').notEmpty().withMessage('School name is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('state').notEmpty().withMessage('State is required'),
  body('zipCode').notEmpty().withMessage('ZIP code is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('martialArts').isArray({ min: 1 }).withMessage('At least one martial art is required'),
  body('maxStudents').isInt({ min: 1 }).withMessage('Maximum students must be at least 1')
], async (req: any, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      address,
      city,
      state,
      zipCode,
      phone,
      email,
      website,
      martialArts,
      maxStudents,
      isActive,
      description
    } = req.body;

    // Check if school with same name exists in organization
    const existingSchool = await School.findOne({
      where: {
        name,
        organizationId: req.user.organizationId
      }
    });

    if (existingSchool) {
      return res.status(400).json({ error: 'A school with this name already exists in your organization' });
    }

    const school = await School.create({
      organizationId: req.user.organizationId,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, ''),
      address,
      city,
      state,
      zipCode,
      country: 'USA',
      phone,
      email,
      website,
      martialArts,
      maxStudents,
      isActive: isActive !== undefined ? isActive : true,
      description
    });

    return res.status(201).json({
      success: true,
      message: 'School created successfully',
      data: {
        ...school.toJSON(),
        currentStudents: 0
      }
    });
  } catch (error) {
    console.error('Error creating school:', error);
    return res.status(500).json({ error: 'Failed to create school' });
  }
});

// Update school
router.put('/:id', [
  authenticate,
  authorize('super_admin', 'org_admin'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('martialArts').optional().isArray({ min: 1 }).withMessage('At least one martial art is required'),
  body('maxStudents').optional().isInt({ min: 1 }).withMessage('Maximum students must be at least 1')
], async (req: any, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const school = await School.findOne({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId
      }
    });

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    // Check if changing name to one that already exists
    if (req.body.name && req.body.name !== school.name) {
      const existingSchool = await School.findOne({
        where: {
          name: req.body.name,
          organizationId: req.user.organizationId,
          id: { [Op.ne]: req.params.id }
        }
      });

      if (existingSchool) {
        return res.status(400).json({ error: 'A school with this name already exists in your organization' });
      }
    }

    await school.update(req.body);

    // Get updated school with student count
    const updatedSchool = await School.findByPk(school.id, {
      include: [
        {
          model: User,
          as: 'students',
          attributes: ['id'],
          required: false
        }
      ]
    });

    const schoolData = updatedSchool?.toJSON() as any;
    return res.json({
      success: true,
      message: 'School updated successfully',
      data: {
        ...schoolData,
        currentStudents: schoolData.students ? schoolData.students.length : 0,
        students: undefined
      }
    });
  } catch (error) {
    console.error('Error updating school:', error);
    return res.status(500).json({ error: 'Failed to update school' });
  }
});

// Delete school
router.delete('/:id', authenticate, authorize('super_admin', 'org_admin'), async (req: any, res: Response) => {
  try {
    const school = await School.findOne({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId
      },
      include: [
        {
          model: User,
          as: 'students',
          attributes: ['id'],
          required: false
        }
      ]
    });

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    const schoolData = school.toJSON() as any;
    if (schoolData.students && schoolData.students.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete school with active students. Please reassign students first.' 
      });
    }

    await school.destroy();

    return res.json({
      success: true,
      message: 'School deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting school:', error);
    return res.status(500).json({ error: 'Failed to delete school' });
  }
});

// Get school statistics
router.get('/:id/stats', authenticate, authorize('super_admin', 'org_admin', 'school_admin'), async (req: any, res: Response) => {
  try {
    const school = await School.findOne({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId
      }
    });

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    // Get student count by role
    const studentCount = await User.count({
      where: {
        schoolId: req.params.id,
        role: 'student',
        isActive: true
      }
    });

    const instructorCount = await User.count({
      where: {
        schoolId: req.params.id,
        role: 'instructor',
        isActive: true
      }
    });

    // Calculate utilization
    const maxStudents = school.maxStudents || 0;
    const utilization = maxStudents > 0 
      ? Math.round((studentCount / maxStudents) * 100) 
      : 0;

    return res.json({
      success: true,
      data: {
        schoolId: school.id,
        schoolName: school.name,
        studentCount,
        instructorCount,
        maxStudents: maxStudents,
        utilization,
        martialArts: school.martialArts || [],
        isActive: school.isActive
      }
    });
  } catch (error) {
    console.error('Error fetching school statistics:', error);
    return res.status(500).json({ error: 'Failed to fetch school statistics' });
  }
});

export default router;