import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate from home to login', async ({ page }) => {
    await page.goto('/');
    
    // Look for login link or button
    const loginLink = page.getByRole('link', { name: /login|sign in/i }).first();
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await expect(page).toHaveURL(/.*login/);
    }
  });

  test('should have proper page titles', async ({ page }) => {
    // Check login page title
    await page.goto('/login');
    await expect(page).toHaveTitle(/dojo|login/i);
    
    // Check dashboard page title (with auth)
    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-token');
    });
    await page.goto('/dashboard');
    await expect(page).toHaveTitle(/dojo|dashboard/i);
  });

  test('should handle 404 pages gracefully', async ({ page }) => {
    await page.goto('/non-existent-page');
    
    // Should show 404 or redirect
    const pageContent = await page.textContent('body');
    expect(pageContent).toMatch(/404|not found|page.*not.*exist/i);
  });
});

test.describe('Responsive Design', () => {
  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/login');
    
    // Check that login form is still accessible
    await expect(page.getByTestId('email-input')).toBeVisible();
    await expect(page.getByTestId('password-input')).toBeVisible();
    await expect(page.getByTestId('login-button')).toBeVisible();
    
    // Card should be full width on mobile
    const card = page.locator('.max-w-md').first();
    const box = await card.boundingBox();
    if (box) {
      expect(box.width).toBeLessThanOrEqual(375);
    }
  });

  test('should be responsive on tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-token');
    });
    
    await page.goto('/dashboard');
    
    // Check dashboard layout
    await expect(page.getByTestId('welcome-message')).toBeVisible();
    
    // Cards should be in grid
    const cards = page.locator('.grid > div');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should handle landscape orientation', async ({ page }) => {
    // Set landscape mobile viewport
    await page.setViewportSize({ width: 667, height: 375 });
    
    await page.goto('/login');
    
    // Login form should still be centered and visible
    await expect(page.getByTestId('login-button')).toBeInViewport();
  });
});

test.describe('Accessibility', () => {
  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/login');
    
    // Tab through form elements
    await page.keyboard.press('Tab');
    const focusedElement1 = await page.evaluate(() => document.activeElement?.tagName);
    expect(['INPUT', 'BUTTON', 'A']).toContain(focusedElement1);
    
    await page.keyboard.press('Tab');
    const focusedElement2 = await page.evaluate(() => document.activeElement?.tagName);
    expect(['INPUT', 'BUTTON', 'A']).toContain(focusedElement2);
    
    // Should be able to submit with Enter
    await page.getByTestId('email-input').focus();
    await page.keyboard.type('test@example.com');
    await page.keyboard.press('Tab');
    await page.keyboard.type('password');
    await page.keyboard.press('Enter');
    
    // Form should attempt submission
    await expect(page.getByTestId('login-button')).toContainText(/sign/i);
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/login');
    
    // Check for labels
    const emailLabel = await page.getByText('Email');
    await expect(emailLabel).toBeVisible();
    
    const passwordLabel = await page.getByText('Password');
    await expect(passwordLabel).toBeVisible();
    
    // Check form has proper structure
    const form = page.locator('form');
    await expect(form).toBeVisible();
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/login');
    
    // This is a basic check - for real contrast testing, use axe-core
    const button = page.getByTestId('login-button');
    const backgroundColor = await button.evaluate((el) => 
      window.getComputedStyle(el).backgroundColor
    );
    const color = await button.evaluate((el) => 
      window.getComputedStyle(el).color
    );
    
    // Check that button has defined colors
    expect(backgroundColor).toBeTruthy();
    expect(color).toBeTruthy();
  });
});

test.describe('Performance', () => {
  test('should load login page quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/login');
    const loadTime = Date.now() - startTime;
    
    // Page should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should handle slow network gracefully', async ({ page }) => {
    // Simulate slow 3G network
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 100);
    });
    
    await page.goto('/login', { timeout: 10000 });
    
    // Page should still be functional
    await expect(page.getByTestId('login-button')).toBeVisible();
  });
});

test.describe('Security', () => {
  test('should not expose sensitive data in localStorage', async ({ page }) => {
    // Mock login
    await page.route('**/api/auth/login', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'mock-token',
          user: { 
            id: '123', 
            email: 'test@test.com',
            password: 'THIS_SHOULD_NOT_BE_HERE' 
          }
        })
      });
    });
    
    await page.goto('/login');
    await page.getByTestId('email-input').fill('test@test.com');
    await page.getByTestId('password-input').fill('password');
    await page.getByTestId('login-button').click();
    
    // Check localStorage doesn't contain password
    const localStorage = await page.evaluate(() => JSON.stringify(localStorage));
    expect(localStorage).not.toContain('THIS_SHOULD_NOT_BE_HERE');
    expect(localStorage).not.toContain('password');
  });

  test('should use HTTPS in production URLs', async ({ page }) => {
    await page.goto('/login');
    
    // Check that any API URLs use HTTPS (in production)
    const scripts = await page.$$eval('script', scripts => 
      scripts.map(s => s.src).filter(src => src.includes('http://') && !src.includes('localhost'))
    );
    
    expect(scripts).toHaveLength(0);
  });
});