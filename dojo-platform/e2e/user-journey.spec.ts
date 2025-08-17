import { test, expect } from '@playwright/test';
import { AuthHelper, NavigationHelper, FormHelper, TestDataHelper } from './helpers/auth.helper';

test.describe('Complete User Journey', () => {
  let authHelper: AuthHelper;
  let navHelper: NavigationHelper;
  let formHelper: FormHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    navHelper = new NavigationHelper(page);
    formHelper = new FormHelper(page);
  });

  test('Student complete journey: login -> dashboard -> view schedule -> logout', async ({ page }) => {
    // Step 1: Login as student
    await authHelper.loginWithMock('student');
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByTestId('welcome-message')).toBeVisible();
    
    // Step 2: Check dashboard content
    await expect(page.getByText('Classes Today')).toBeVisible();
    await expect(page.getByText('Attendance Rate')).toBeVisible();
    await expect(page.getByText('Current Rank')).toBeVisible();
    
    // Step 3: Click on View Class Schedule
    await page.getByText('View Class Schedule').click();
    
    // Step 4: Logout
    await authHelper.logout();
    
    // Verify redirect to login
    await expect(page).toHaveURL(/login/);
    
    // Verify token is cleared
    const isLoggedIn = await authHelper.isLoggedIn();
    expect(isLoggedIn).toBe(false);
  });

  test('Instructor journey: login -> dashboard -> manage classes', async ({ page }) => {
    // Login as instructor
    await authHelper.loginWithMock('instructor');
    
    // Should see instructor-specific content
    await expect(page).toHaveURL(/dashboard/);
    
    // Instructor should see different quick actions
    await expect(page.getByText('Quick Actions')).toBeVisible();
  });

  test('Form validation journey', async ({ page }) => {
    await navHelper.goToLogin();
    
    // Test empty form submission
    await formHelper.submitForm('login-button');
    
    // Should stay on login page
    await expect(page).toHaveURL(/login/);
    
    // Test invalid email
    await formHelper.fillInput('email-input', 'invalid-email');
    await formHelper.fillInput('password-input', 'password123');
    
    const hasEmailError = await formHelper.hasValidationError('email-input');
    expect(hasEmailError).toBe(true);
    
    // Test valid form
    await formHelper.fillInput('email-input', 'valid@email.com');
    await formHelper.fillInput('password-input', 'password123');
    
    // Mock successful response
    await page.route('**/api/auth/login', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'success-token',
          user: TestDataHelper.getTestUser('student')
        })
      });
    });
    
    await formHelper.submitForm('login-button');
    
    // Should redirect after successful login
    await expect(page).toHaveURL(/dashboard/);
  });

  test('Session persistence across page refreshes', async ({ page }) => {
    // Login
    await authHelper.loginWithMock('student');
    await expect(page).toHaveURL(/dashboard/);
    
    // Refresh page
    await page.reload();
    
    // Should still be on dashboard (not redirected to login)
    await expect(page).toHaveURL(/dashboard/);
    
    // User should still be logged in
    const isLoggedIn = await authHelper.isLoggedIn();
    expect(isLoggedIn).toBe(true);
  });

  test('Protected route access', async ({ page }) => {
    // Try to access dashboard without login
    await navHelper.goToDashboard();
    
    // Should redirect to login
    await expect(page).toHaveURL(/login/);
    
    // Login
    await authHelper.loginWithMock('student');
    
    // Now should be able to access dashboard
    await expect(page).toHaveURL(/dashboard/);
  });

  test('Multi-tab session handling', async ({ browser }) => {
    // Create first tab and login
    const context = await browser.newContext();
    const page1 = await context.newPage();
    const authHelper1 = new AuthHelper(page1);
    
    await authHelper1.loginWithMock('student');
    await expect(page1).toHaveURL(/dashboard/);
    
    // Create second tab
    const page2 = await context.newPage();
    
    // Second tab should also be logged in (shared localStorage)
    await page2.goto('/dashboard');
    await expect(page2).toHaveURL(/dashboard/);
    
    // Logout from first tab
    await authHelper1.logout();
    
    // Refresh second tab
    await page2.reload();
    
    // Second tab should redirect to login
    await expect(page2).toHaveURL(/login/);
    
    await context.close();
  });

  test('Error recovery flow', async ({ page }) => {
    await navHelper.goToLogin();
    
    // Simulate network error
    await page.route('**/api/auth/login', route => {
      route.abort('failed');
    });
    
    await formHelper.fillInput('email-input', 'test@test.com');
    await formHelper.fillInput('password-input', 'password');
    await formHelper.submitForm('login-button');
    
    // Should show error message
    const errorMessage = await formHelper.getErrorMessage();
    expect(errorMessage).toBeTruthy();
    
    // Fix network and retry
    await page.unroute('**/api/auth/login');
    await authHelper.loginWithMock('student');
    
    // Should succeed this time
    await expect(page).toHaveURL(/dashboard/);
  });

  test('Mobile user journey', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    
    // Login on mobile
    await authHelper.loginWithMock('student');
    
    // Dashboard should be responsive
    await expect(page.getByTestId('welcome-message')).toBeVisible();
    
    // Cards should stack vertically on mobile
    const cards = await page.locator('.grid').first();
    const className = await cards.getAttribute('class');
    expect(className).toContain('grid-cols-1');
    
    // Logout should work on mobile
    await authHelper.logout();
    await expect(page).toHaveURL(/login/);
  });
});