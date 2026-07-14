import { test, expect } from '@playwright/test';

/**
 * Shape matches zustand's `persist` middleware default storage format:
 * `{ state: <partial store state>, version: 0 }` under the key configured
 * in src/store/authStore.ts ("release-readiness-auth").
 */
const EXPIRED_AUTH_STATE = {
  state: {
    accessToken: 'expired-access-token',
    refreshToken: 'expired-refresh-token',
    user: {
      username: 'coordinator@demo.io',
      role: 'ReleaseCoordinator',
      permissions: ['ReadPipeline', 'TriggerAssessment'],
    },
  },
  version: 0,
};

test('expired/invalid token -> redirected to login', async ({ page }) => {
  await page.addInitScript((seed) => {
    window.localStorage.setItem('release-readiness-auth', JSON.stringify(seed));
  }, EXPIRED_AUTH_STATE);

  // The stored token looks present (so ProtectedRoute lets the page mount),
  // but any API call rejects it with 401. The axios response interceptor
  // (src/api/axiosInstance.ts) reacts by logging out, which flips
  // ProtectedRoute's guard and redirects to /login.
  await page.route('**/api/v1/releases', async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({
        correlationId: 'corr-e2e-401',
        statusCode: 401,
        message: 'Access token expired.',
        errors: [],
        timestamp: new Date().toISOString(),
      }),
    });
  });

  await page.goto('/dashboard');

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
});
