import { test, expect } from '@playwright/test';
import { mockLogin, mockReleasesList } from './mockApi';

test('empty release id -> inline validation error', async ({ page }) => {
  await mockLogin(page, 'coordinator');
  await mockReleasesList(page);

  await page.goto('/login');
  await page.getByLabel('Username').fill('coordinator@demo.io');
  await page.getByLabel('Password').fill('Password123!');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.getByTestId('jump-to-release-input').fill('');
  await page.getByRole('button', { name: 'View release' }).click();

  await expect(page.getByTestId('jump-to-release-error')).toHaveText('Release ID is required.');
  // Still on the dashboard — no navigation happened for the invalid input.
  await expect(page).toHaveURL(/\/dashboard$/);
});
