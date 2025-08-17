import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page before each test
    await page.goto('/login');
  });

  test('should display login page elements', async ({ page }) => {
    // Check that all login elements are present
    await expect(page.locator('h2')).toContainText('Dojo Platform');
    await expect(page.getByTestId('email-input')).toBeVisible();
    await expect(page.getByTestId('password-input')).toBeVisible();
    await expect(page.getByTestId('login-button')).toBeVisible();
    await expect(page.getByText('Forgot your password?')).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    // Fill in invalid credentials
    await page.getByTestId('email-input').fill('invalid@example.com');
    await page.getByTestId('password-input').fill('wrongpassword');
    
    // Click login button
    await page.getByTestId('login-button').click();
    
    // Should show error message
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByRole('alert')).toContainText(/error|failed/i);
  });

  test('should require email and password', async ({ page }) => {
    // Try to submit empty form
    await page.getByTestId('login-button').click();
    
    // Browser validation should prevent submission
    // Check that we're still on login page
    await expect(page).toHaveURL(/.*login/);
  });

  test('should validate email format', async ({ page }) => {
    // Enter invalid email format
    await page.getByTestId('email-input').fill('notanemail');
    await page.getByTestId('password-input').fill('password123');
    
    // HTML5 validation should trigger
    const emailInput = page.getByTestId('email-input');
    const isValid = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valid);
    expect(isValid).toBe(false);
  });

  test('should handle loading state during login', async ({ page }) => {
    // Fill in credentials
    await page.getByTestId('email-input').fill('test@example.com');
    await page.getByTestId('password-input').fill('password123');
    
    // Start intercepting network requests
    let loginRequestMade = false;
    page.on('request', request => {
      if (request.url().includes('/api/auth/login')) {
        loginRequestMade = true;
      }
    });
    
    // Click login
    await page.getByTestId('login-button').click();
    
    // Button should show loading state
    await expect(page.getByTestId('login-button')).toContainText('Signing in...');
  });

  test('should successfully login with valid credentials (mocked)', async ({ page }) => {
    // Mock the login API response
    await page.route('**/api/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'mock-jwt-token',
          user: {
            id: '123',
            email: 'student@dojo.com',
            firstName: 'John',
            lastName: 'Doe',
            role: 'student'
          }
        })
      });
    });

    // Fill in valid credentials
    await page.getByTestId('email-input').fill('student@dojo.com');
    await page.getByTestId('password-input').fill('password123');
    
    // Click login
    await page.getByTestId('login-button').click();
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Check localStorage for token
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBe('mock-jwt-token');
  });

  test('should redirect to login when accessing protected route without auth', async ({ page }) => {
    // Clear any existing tokens
    await page.evaluate(() => localStorage.clear());
    
    // Try to access dashboard directly
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*login/);
  });
});

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Set up authentication state
    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-jwt-token');
    });
    
    await page.goto('/dashboard');
  });

  test('should display dashboard elements', async ({ page }) => {
    // Check main elements
    await expect(page.locator('h1')).toContainText('Dojo Platform Dashboard');
    await expect(page.getByTestId('welcome-message')).toBeVisible();
    await expect(page.getByTestId('logout-button')).toBeVisible();
    
    // Check cards are present
    await expect(page.getByText('Classes Today')).toBeVisible();
    await expect(page.getByText('Attendance Rate')).toBeVisible();
    await expect(page.getByText('Current Rank')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Click logout button
    await page.getByTestId('logout-button').click();
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*login/);
    
    // Token should be removed
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeNull();
  });

  test('should display quick actions', async ({ page }) => {
    // Check quick action buttons
    await expect(page.getByText('View Class Schedule')).toBeVisible();
    await expect(page.getByText('Mark Attendance')).toBeVisible();
    await expect(page.getByText('View Learning Materials')).toBeVisible();
    await expect(page.getByText('Order Equipment')).toBeVisible();
  });

  test('should display announcements', async ({ page }) => {
    // Check announcements section
    await expect(page.getByText('Recent Announcements')).toBeVisible();
    await expect(page.getByText('Tournament Registration Open')).toBeVisible();
    await expect(page.getByText('New Class Added')).toBeVisible();
  });
});