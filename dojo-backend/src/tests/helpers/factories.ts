import { faker } from '@faker-js/faker';
import Organization from '../../models/Organization';
import School from '../../models/School';
import User from '../../models/User';
import Student from '../../models/Student';
import Class from '../../models/Class';

export const createOrganization = async (overrides = {}) => {
  const data = {
    name: faker.company.name(),
    slug: faker.lorem.slug(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state(),
    zipCode: faker.location.zipCode(),
    country: 'USA',
    subscription: 'free' as 'free' | 'basic' | 'premium' | 'enterprise',
    isActive: true,
    ...overrides,
  };
  
  return await Organization.create(data);
};

export const createSchool = async (organizationId: string, overrides = {}) => {
  const data = {
    organizationId,
    name: faker.company.name() + ' Dojo',
    slug: faker.lorem.slug(),
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state(),
    zipCode: faker.location.zipCode(),
    country: 'USA',
    phone: faker.phone.number(),
    email: faker.internet.email(),
    maxStudents: 100,
    isActive: true,
    ...overrides,
  };
  
  return await School.create(data);
};

export const createUser = async (organizationId: string, overrides = {}) => {
  const data = {
    organizationId,
    email: faker.internet.email(),
    password: 'password123',
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    role: 'student' as 'super_admin' | 'org_admin' | 'school_admin' | 'instructor' | 'student' | 'parent',
    phone: faker.phone.number(),
    isActive: true,
    emailVerified: true,
    ...overrides,
  };
  
  return await User.create(data);
};

export const createStudent = async (userId: string, organizationId: string, schoolId: string, overrides = {}) => {
  const data = {
    userId,
    organizationId,
    schoolId,
    studentId: faker.string.uuid(),
    beltRank: 'White',
    joinDate: new Date(),
    status: 'active' as 'active' | 'inactive' | 'suspended' | 'graduated',
    tuitionStatus: 'paid' as 'paid' | 'pending' | 'overdue',
    ...overrides,
  };
  
  return await Student.create(data);
};

export const createClass = async (organizationId: string, schoolId: string, instructorId: string, overrides = {}) => {
  const data = {
    organizationId,
    schoolId,
    instructorId,
    name: 'Beginner Karate',
    description: 'Introduction to karate fundamentals',
    dayOfWeek: 'Monday',
    startTime: '18:00',
    endTime: '19:00',
    duration: 60,
    maxStudents: 20,
    currentStudents: 0,
    startDate: new Date(),
    status: 'active' as 'active' | 'cancelled' | 'completed',
    isRecurring: true,
    ...overrides,
  };
  
  return await Class.create(data);
};

export const createTestUser = async (role = 'student') => {
  const org = await createOrganization();
  const school = await createSchool(org.id);
  const user = await createUser(org.id, { 
    schoolId: school.id,
    role 
  });
  
  return { org, school, user };
};

export const generateToken = (user: any) => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      organizationId: user.organizationId,
      schoolId: user.schoolId 
    },
    process.env.JWT_SECRET || 'test-secret-key-for-testing',
    { expiresIn: '30d' }
  );
};