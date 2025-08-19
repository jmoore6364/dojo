import bcrypt from 'bcryptjs';
import { Transaction } from 'sequelize';
import sequelize from '../config/database';
import Organization from '../models/Organization';
import School from '../models/School';
import User from '../models/User';
import { generateSlug } from '../utils/slug';

interface DojoRegistrationData {
  // Business Information
  organizationName: string;
  businessType: string;
  martialArtTypes: string[];
  numberOfSchools: number;
  estimatedStudents: number;
  
  // Contact Information
  email: string;
  phone: string;
  website?: string;
  
  // Address
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  
  // Admin User
  firstName: string;
  lastName: string;
  password: string;
  
  // First School (optional)
  firstSchoolName?: string;
  firstSchoolAddress?: string;
}

interface RegistrationResult {
  organization: Organization;
  school: School;
  user: User;
  trialDays: number;
}

class RegistrationService {
  private readonly TRIAL_DAYS = 30; // 30-day free trial

  async registerDojo(data: DojoRegistrationData): Promise<RegistrationResult> {
    const transaction: Transaction = await sequelize.transaction();

    try {
      // Generate unique slug for organization
      const slug = await this.generateUniqueSlug(data.organizationName);
      
      // Calculate trial dates
      const trialStartDate = new Date();
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + this.TRIAL_DAYS);

      // 1. Create Organization with trial subscription
      const organization = await Organization.create({
        name: data.organizationName,
        slug,
        email: data.email,
        phone: data.phone,
        website: data.website,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
        businessType: data.businessType,
        martialArtTypes: data.martialArtTypes,
        numberOfSchools: data.numberOfSchools,
        estimatedStudents: data.estimatedStudents,
        subscription: 'trial',
        subscriptionStatus: 'active',
        trialStartDate,
        trialEndDate,
        subscriptionExpiry: trialEndDate,
        isActive: true,
        settings: {
          allowedSchools: data.numberOfSchools || 1,
          allowedStudents: data.estimatedStudents || 100,
          features: {
            attendance: true,
            reporting: true,
            messaging: true,
            payments: false, // Disabled during trial
            advancedAnalytics: true, // Enabled for trial
            customBranding: true, // Enabled for trial
          },
          trialFeatures: true,
        },
      }, { transaction });

      // 2. Create the first school
      const schoolName = data.firstSchoolName || `${data.organizationName} Main School`;
      const schoolSlug = await this.generateUniqueSchoolSlug(schoolName, organization.id);
      
      const school = await School.create({
        organizationId: organization.id,
        name: schoolName,
        slug: schoolSlug,
        address: data.firstSchoolAddress || data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
        phone: data.phone,
        email: data.email,
        isActive: true,
        settings: {
          martialArtTypes: data.martialArtTypes,
          classCapacity: 30,
          allowOnlineBooking: true,
        },
      }, { transaction });

      // 3. Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);

      // 4. Create admin user
      const user = await User.create({
        organizationId: organization.id,
        schoolId: school.id,
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'org_admin', // Organization admin role
        phone: data.phone,
        isActive: true,
        emailVerified: false, // Will need email verification
        lastLogin: new Date(),
      }, { transaction });

      // 5. Create welcome notification (optional)
      // This could be expanded to send welcome emails, create default classes, etc.
      await this.createWelcomeSetup(organization, school, user, transaction);

      // Commit transaction
      await transaction.commit();

      return {
        organization,
        school,
        user,
        trialDays: this.TRIAL_DAYS,
      };
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      throw error;
    }
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    let slug = generateSlug(name);
    let counter = 1;
    
    while (await Organization.findOne({ where: { slug } })) {
      slug = `${generateSlug(name)}-${counter}`;
      counter++;
    }
    
    return slug;
  }

  private async generateUniqueSchoolSlug(name: string, organizationId: string): Promise<string> {
    let slug = generateSlug(name);
    let counter = 1;
    
    while (await School.findOne({ where: { slug, organizationId } })) {
      slug = `${generateSlug(name)}-${counter}`;
      counter++;
    }
    
    return slug;
  }

  private async createWelcomeSetup(
    organization: Organization,
    _school: School,
    user: User,
    _transaction: Transaction
  ): Promise<void> {
    // Create default settings or sample data
    // This could include:
    // - Default class types
    // - Sample belt ranks
    // - Welcome message
    // - Default notification preferences
    
    // For now, we'll just log the successful registration
    console.log(`✅ New dojo registered: ${organization.name} (${organization.slug})`);
    console.log(`   Trial period: ${this.TRIAL_DAYS} days`);
    console.log(`   Admin user: ${user.email}`);
  }

  async checkTrialStatus(organizationId: string): Promise<{
    isExpired: boolean;
    daysRemaining: number;
    trialEndDate: Date | null;
  }> {
    const organization = await Organization.findByPk(organizationId);
    
    if (!organization || !organization.trialEndDate) {
      return {
        isExpired: true,
        daysRemaining: 0,
        trialEndDate: null,
      };
    }

    const now = new Date();
    const trialEnd = new Date(organization.trialEndDate);
    const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      isExpired: daysRemaining <= 0,
      daysRemaining: Math.max(0, daysRemaining),
      trialEndDate: organization.trialEndDate,
    };
  }

  async extendTrial(organizationId: string, additionalDays: number): Promise<Organization> {
    const organization = await Organization.findByPk(organizationId);
    
    if (!organization) {
      throw new Error('Organization not found');
    }

    const currentEndDate = organization.trialEndDate || new Date();
    const newEndDate = new Date(currentEndDate);
    newEndDate.setDate(newEndDate.getDate() + additionalDays);

    organization.trialEndDate = newEndDate;
    organization.subscriptionExpiry = newEndDate;
    await organization.save();

    return organization;
  }

  async convertToSubscription(
    organizationId: string,
    subscriptionType: 'free' | 'basic' | 'premium' | 'enterprise'
  ): Promise<Organization> {
    const organization = await Organization.findByPk(organizationId);
    
    if (!organization) {
      throw new Error('Organization not found');
    }

    // Calculate subscription expiry (1 year from now for paid plans)
    const subscriptionExpiry = new Date();
    if (subscriptionType !== 'free') {
      subscriptionExpiry.setFullYear(subscriptionExpiry.getFullYear() + 1);
    }

    organization.subscription = subscriptionType;
    organization.subscriptionStatus = 'active';
    organization.subscriptionExpiry = subscriptionExpiry;
    
    // Update settings based on subscription type
    const settings = organization.settings as any || {};
    
    switch (subscriptionType) {
      case 'free':
        settings.allowedSchools = 1;
        settings.allowedStudents = 50;
        settings.features = {
          attendance: true,
          reporting: false,
          messaging: false,
          payments: false,
          advancedAnalytics: false,
          customBranding: false,
        };
        break;
      case 'basic':
        settings.allowedSchools = 3;
        settings.allowedStudents = 200;
        settings.features = {
          attendance: true,
          reporting: true,
          messaging: true,
          payments: false,
          advancedAnalytics: false,
          customBranding: false,
        };
        break;
      case 'premium':
        settings.allowedSchools = 10;
        settings.allowedStudents = 1000;
        settings.features = {
          attendance: true,
          reporting: true,
          messaging: true,
          payments: true,
          advancedAnalytics: true,
          customBranding: false,
        };
        break;
      case 'enterprise':
        settings.allowedSchools = -1; // Unlimited
        settings.allowedStudents = -1; // Unlimited
        settings.features = {
          attendance: true,
          reporting: true,
          messaging: true,
          payments: true,
          advancedAnalytics: true,
          customBranding: true,
        };
        break;
    }
    
    settings.trialFeatures = false;
    organization.settings = settings;
    
    await organization.save();
    return organization;
  }
}

export const registrationService = new RegistrationService();
export default registrationService;