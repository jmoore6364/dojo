import { Page } from '@playwright/test';

export class AuthHelper {
  constructor(private page: Page) {}

  async login(email: string, password: string) {
    await this.page.goto('/login');
    await this.page.getByTestId('email-input').fill(email);
    await this.page.getByTestId('password-input').fill(password);
    await this.page.getByTestId('login-button').click();
  }

  async loginWithMock(role: 'student' | 'instructor' | 'admin' = 'student') {
    // Mock the API response
    await this.page.route('**/api/auth/login', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'mock-jwt-token',
          user: {
            id: '123',
            email: `${role}@dojo.com`,
            firstName: 'Test',
            lastName: 'User',
            role: role
          }
        })
      });
    });

    await this.login(`${role}@dojo.com`, 'password123');
  }

  async logout() {
    await this.page.getByTestId('logout-button').click();
  }

  async setAuthToken(token: string = 'mock-jwt-token') {
    await this.page.addInitScript((token) => {
      localStorage.setItem('token', token);
    }, token);
  }

  async clearAuth() {
    await this.page.evaluate(() => localStorage.clear());
  }

  async isLoggedIn(): Promise<boolean> {
    const token = await this.page.evaluate(() => localStorage.getItem('token'));
    return token !== null;
  }

  async getCurrentUser() {
    return await this.page.evaluate(() => {
      const token = localStorage.getItem('token');
      if (!token) return null;
      
      // In a real app, you'd decode the JWT
      // For testing, we'll return mock data
      return {
        id: '123',
        email: 'test@dojo.com',
        role: 'student'
      };
    });
  }
}

export class TestDataHelper {
  static getTestUser(role: 'student' | 'instructor' | 'admin' = 'student') {
    const users = {
      student: {
        email: 'student@dojo.com',
        password: 'student123',
        firstName: 'John',
        lastName: 'Student',
        role: 'student'
      },
      instructor: {
        email: 'instructor@dojo.com',
        password: 'instructor123',
        firstName: 'Jane',
        lastName: 'Instructor',
        role: 'instructor'
      },
      admin: {
        email: 'admin@dojo.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'school_admin'
      }
    };
    
    return users[role];
  }

  static getTestOrganization() {
    return {
      name: 'Test Dojo',
      email: 'contact@testdojo.com',
      phone: '555-0123',
      address: '123 Test Street',
      city: 'Test City',
      state: 'TS',
      zipCode: '12345'
    };
  }

  static getTestClass() {
    return {
      name: 'Beginner Karate',
      instructor: 'Jane Instructor',
      time: '6:00 PM',
      duration: 60,
      maxStudents: 20,
      dayOfWeek: 'Monday'
    };
  }
}

export class NavigationHelper {
  constructor(private page: Page) {}

  async goToLogin() {
    await this.page.goto('/login');
  }

  async goToDashboard() {
    await this.page.goto('/dashboard');
  }

  async goToStudentDashboard() {
    await this.page.goto('/student/dashboard');
  }

  async goToAdminDashboard() {
    await this.page.goto('/admin/dashboard');
  }

  async goToClassSchedule() {
    await this.page.goto('/classes');
  }

  async goToProfile() {
    await this.page.goto('/profile');
  }

  async waitForNavigation() {
    await this.page.waitForLoadState('networkidle');
  }
}

export class FormHelper {
  constructor(private page: Page) {}

  async fillInput(testId: string, value: string) {
    await this.page.getByTestId(testId).fill(value);
  }

  async selectOption(testId: string, value: string) {
    await this.page.getByTestId(testId).selectOption(value);
  }

  async checkCheckbox(testId: string) {
    await this.page.getByTestId(testId).check();
  }

  async uncheckCheckbox(testId: string) {
    await this.page.getByTestId(testId).uncheck();
  }

  async submitForm(buttonTestId: string = 'submit-button') {
    await this.page.getByTestId(buttonTestId).click();
  }

  async getErrorMessage(): Promise<string | null> {
    const alert = this.page.getByRole('alert');
    if (await alert.isVisible()) {
      return await alert.textContent();
    }
    return null;
  }

  async hasValidationError(fieldTestId: string): Promise<boolean> {
    const field = this.page.getByTestId(fieldTestId);
    const isInvalid = await field.evaluate((el: HTMLInputElement) => !el.validity.valid);
    return isInvalid;
  }
}