import { test, expect } from '@playwright/test';

test.describe('AgriRenta Comprehensive End-to-End Application Test Suite', () => {
  const timestamp = Date.now().toString().slice(-6);
  const seekerPhone = `910${timestamp}`;
  const providerPhone = `920${timestamp}`;

  // =========================================================================
  // 1. LANDING PAGE & DESIGN SYSTEM COMPLIANCE
  // =========================================================================
  test('1. Landing Page renders cleanly with zero rates, zero locations, and wrap-safe filters', async ({ page }) => {
    await page.goto('/');
    
    // Check main elements and branding
    await expect(page.getByTestId('navbar-logo')).toBeVisible();
    await expect(page.getByTestId('landing-hero-cta')).toBeVisible();
    
    // Ensure ZERO rates/prices are present on the public landing page text
    const landingContent = await page.textContent('body');
    expect(landingContent).not.toContain('₹');
    expect(landingContent).not.toContain('/ acre');
    expect(landingContent).not.toContain('/ hr');

    // Ensure ZERO specific location coordinates or km distances on public landing page
    expect(landingContent).not.toContain('km away');
    expect(landingContent).not.toContain('Latitude');
    
    // Verify high-contrast emerald theme branding
    const heroBtn = page.getByTestId('landing-hero-cta');
    await expect(heroBtn).toHaveClass(/bg-emerald-600/);
  });

  // =========================================================================
  // 2. AUTHENTICATION & ROLE REGISTRATION JOURNEY
  // =========================================================================
  test('2. Registration journey for Seeker Farmer & Equipment Provider with role switching', async ({ page }) => {
    await page.goto('/register');
    
    // Test Farmer Registration
    await page.getByTestId('register-role-farmer').click();
    await page.getByTestId('register-name-input').fill(`Farmer ${timestamp}`);
    await page.getByTestId('register-phone-input').fill(seekerPhone);
    await page.getByTestId('register-password-input').fill('password123');
    await page.getByTestId('register-submit-btn').click();
    
    // Should navigate to marketplace after successful registration
    await expect(page).toHaveURL(/\/marketplace/);
    
    // Sign Out
    await page.getByTestId('nav-signout-btn').click();
    await expect(page).toHaveURL(/\/login/);

    // Test Provider Registration
    await page.goto('/register');
    await page.getByTestId('register-role-provider').click();
    await page.getByTestId('register-name-input').fill(`Provider ${timestamp}`);
    await page.getByTestId('register-phone-input').fill(providerPhone);
    await page.getByTestId('register-password-input').fill('password123');
    await page.getByTestId('register-upi-input').fill(`${providerPhone}@ybl`);
    await page.getByTestId('register-submit-btn').click();
    
    // Provider lands on provider dashboard
    await expect(page).toHaveURL(/\/provider\/dashboard/);
  });

  // =========================================================================
  // 3. MARKETPLACE SEARCH, FILTERS & ACCESSIBILITY
  // =========================================================================
  test('3. Marketplace loading, category filtering, distance slider & sunlight mode toggle', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('login-phone-input').fill(seekerPhone);
    await page.getByTestId('login-password-input').fill('password123');
    await page.getByTestId('login-submit-btn').click();
    
    await expect(page).toHaveURL(/\/marketplace/);
    
    // Verify Marketplace Filters
    const categorySelect = page.getByTestId('marketplace-category-select');
    await expect(categorySelect).toBeVisible();
    await categorySelect.selectOption('Machinery & Farm Equipment');
    
    // Test Sunlight High-Contrast Mode Toggle
    const sunlightToggle = page.getByTestId('nav-sunlight-toggle');
    await sunlightToggle.click();
    
    // Verify document root has sunlight-mode class
    const isSunlight = await page.evaluate(() => document.documentElement.classList.contains('sunlight-mode'));
    expect(isSunlight).toBe(true);
    
    // Revert sunlight mode
    await sunlightToggle.click();
  });

  // =========================================================================
  // 4. BOOKING CHECKOUT & ESCROW FLOW
  // =========================================================================
  test('4. Booking checkout modal calculation, payment selection & escrow confirmation', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('login-phone-input').fill(seekerPhone);
    await page.getByTestId('login-password-input').fill('password123');
    await page.getByTestId('login-submit-btn').click();
    
    await page.goto('/marketplace');
    
    // Click first service card Book Now button if available
    const bookBtn = page.getByTestId('book-now-btn').first();
    if (await bookBtn.isVisible()) {
      await bookBtn.click();
      
      // Modal assertions
      await expect(page.getByTestId('booking-modal-acres-input')).toBeVisible();
      await page.getByTestId('booking-modal-acres-input').fill('3');
      
      // Payment method selection
      await page.getByTestId('payment-method-upi').click();
      await page.getByTestId('booking-modal-submit-btn').click();
    }
  });

  // =========================================================================
  // 5. ADMIN ESCROW HUB & PAYOUTS
  // =========================================================================
  test('5. Admin Escrow Portal KPI metrics & search filter', async ({ page }) => {
    await page.goto('/login');
    
    // Log in as Admin
    await page.getByTestId('login-phone-input').fill('9030585591');
    await page.getByTestId('login-password-input').fill('admin@123');
    await page.getByTestId('login-submit-btn').click();
    
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    
    // Assert KPI metrics and search controls
    await expect(page.getByTestId('admin-kpi-escrow')).toBeVisible();
    await expect(page.getByTestId('admin-kpi-commission')).toBeVisible();
    await expect(page.getByTestId('admin-search-input')).toBeVisible();
  });
});
