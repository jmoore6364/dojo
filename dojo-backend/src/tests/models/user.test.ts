import User from '../../models/User';
import Organization from '../../models/Organization';
import { createOrganization, createUser } from '../helpers/factories';

describe('User Model', () => {
  let testOrg: Organization;

  beforeEach(async () => {
    testOrg = await createOrganization();
  });

  describe('Creation', () => {
    it('should create a user with valid data', async () => {
      const user = await User.create({
        organizationId: testOrg.id,
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student',
      });

      expect(user.id).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.firstName).toBe('John');
      expect(user.lastName).toBe('Doe');
      expect(user.role).toBe('student');
      expect(user.isActive).toBe(true);
      expect(user.emailVerified).toBe(false);
    });

    it('should hash password on creation', async () => {
      const plainPassword = 'myPassword123';
      const user = await createUser(testOrg.id, {
        password: plainPassword,
      });

      expect(user.password).not.toBe(plainPassword);
      expect(user.password).toMatch(/^\$2[aby]\$\d{2}\$/);
    });

    it('should enforce unique email constraint', async () => {
      await createUser(testOrg.id, {
        email: 'unique@test.com',
      });

      await expect(
        createUser(testOrg.id, {
          email: 'unique@test.com',
        })
      ).rejects.toThrow();
    });

    it('should validate email format', async () => {
      await expect(
        User.create({
          organizationId: testOrg.id,
          email: 'invalid-email',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
          role: 'student',
        })
      ).rejects.toThrow();
    });

    it('should accept all valid roles', async () => {
      const roles = ['super_admin', 'org_admin', 'school_admin', 'instructor', 'student', 'parent'];
      
      for (const role of roles) {
        const user = await createUser(testOrg.id, {
          email: `${role}@test.com`,
          role: role as any,
        });
        expect(user.role).toBe(role);
      }
    });
  });

  describe('Password Management', () => {
    it('should validate correct password', async () => {
      const password = 'testPassword123';
      const user = await createUser(testOrg.id, { password });

      const isValid = await user.validatePassword(password);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const user = await createUser(testOrg.id, { 
        password: 'correctPassword' 
      });

      const isValid = await user.validatePassword('wrongPassword');
      expect(isValid).toBe(false);
    });

    it('should hash password on update', async () => {
      const user = await createUser(testOrg.id, {
        password: 'initialPassword',
      });
      const initialHash = user.password;

      await user.update({ password: 'newPassword' });
      
      expect(user.password).not.toBe('newPassword');
      expect(user.password).not.toBe(initialHash);
      
      const isValid = await user.validatePassword('newPassword');
      expect(isValid).toBe(true);
    });
  });

  describe('Associations', () => {
    it('should belong to an organization', async () => {
      const user = await createUser(testOrg.id);
      await user.reload({ include: [{ model: Organization, as: 'organization' }] });

      expect((user as any).organization).toBeDefined();
      expect((user as any).organization.id).toBe(testOrg.id);
    });
  });

  describe('Attributes', () => {
    it('should store emergency contact as JSON', async () => {
      const emergencyContact = {
        name: 'Jane Doe',
        relationship: 'Spouse',
        phone: '555-0123',
      };

      const user = await createUser(testOrg.id, {
        emergencyContact,
      });

      expect(user.emergencyContact).toEqual(emergencyContact);
    });

    it('should store medical info as JSON', async () => {
      const medicalInfo = {
        allergies: ['peanuts', 'shellfish'],
        medications: ['insulin'],
        conditions: ['diabetes'],
      };

      const user = await createUser(testOrg.id, {
        medicalInfo,
      });

      expect(user.medicalInfo).toEqual(medicalInfo);
    });

    it('should store settings as JSON', async () => {
      const settings = {
        notifications: true,
        theme: 'dark',
        language: 'en',
      };

      const user = await createUser(testOrg.id, {
        settings,
      });

      expect(user.settings).toEqual(settings);
    });
  });

  describe('Soft Delete', () => {
    it('should support soft delete via isActive flag', async () => {
      const user = await createUser(testOrg.id);
      expect(user.isActive).toBe(true);

      await user.update({ isActive: false });
      expect(user.isActive).toBe(false);

      // User should still exist in database
      const foundUser = await User.findByPk(user.id);
      expect(foundUser).toBeDefined();
      expect(foundUser?.isActive).toBe(false);
    });
  });
});