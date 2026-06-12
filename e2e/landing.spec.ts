import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/AI Engineer Roadmap/);
  });

  test('should display hero section', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('AI Engineer');
    await expect(page.locator('text=Start Learning Free')).toBeVisible();
  });

  test('should display features section', async ({ page }) => {
    await expect(page.locator('text=Everything you need to master')).toBeVisible();
    await expect(page.locator('text=AI-Powered Tutoring')).toBeVisible();
    await expect(page.locator('text=Interactive Knowledge Graph')).toBeVisible();
  });

  test('should display roadmap preview', async ({ page }) => {
    await expect(page.locator('text=The AI Engineer Roadmap')).toBeVisible();
    await expect(page.locator('text=Foundations')).toBeVisible();
  });

  test('should navigate to sign in', async ({ page }) => {
    await page.click('text=Sign in');
    await expect(page).toHaveURL(/.*auth\/signin/);
  });

  test('should navigate to sign up', async ({ page }) => {
    await page.click('text=Get Started');
    await expect(page).toHaveURL(/.*auth\/signup/);
  });
});

test.describe('Authentication', () => {
  test('should show sign in form', async ({ page }) => {
    await page.goto('/auth/signin');
    await expect(page.locator('h2:has-text("Welcome back")')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should show sign up form', async ({ page }) => {
    await page.goto('/auth/signup');
    await expect(page.locator('h2:has-text("Create your account")')).toBeVisible();
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });
});

test.describe('Roadmaps Page', () => {
  test('should load roadmaps list', async ({ page }) => {
    await page.goto('/roadmaps');
    await expect(page.locator('h1:has-text("Explore Learning Roadmaps")')).toBeVisible();
  });

  test('should search roadmaps', async ({ page }) => {
    await page.goto('/roadmaps');
    await page.fill('input[placeholder="Search roadmaps..."]', 'AI');
    await expect(page.locator('text=AI Engineer Roadmap')).toBeVisible();
  });
});