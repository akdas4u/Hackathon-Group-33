import type { Page } from '@playwright/test';
import { MOCK_RELEASES, mockLoginResponse } from '../src/tests/fixtures';
import type { ReleaseReadinessResponse } from '../src/types';

/**
 * Shared route-stubbing helpers for e2e specs. The backend is not live in
 * this scaffold, so every test intercepts `/api/v1/**` with Playwright's
 * `page.route` using the same fixtures the Jest unit tests use
 * (src/tests/fixtures.ts) — one source of truth for the demo dataset.
 */
const API_BASE = 'http://localhost:5000/api/v1';

export type MockUserKey = Parameters<typeof mockLoginResponse>[0];

export async function mockLogin(page: Page, userKey: MockUserKey): Promise<void> {
  await page.route(`${API_BASE}/auth/login`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockLoginResponse(userKey)),
    });
  });
}

export async function mockReleasesList(page: Page): Promise<void> {
  await page.route(`${API_BASE}/releases`, async (route) => {
    if (route.request().method() !== 'GET') {
      await route.fallback();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_RELEASES),
    });
  });
}

export async function mockRelease(page: Page, releaseId: string): Promise<void> {
  await page.route(`${API_BASE}/releases/${releaseId}`, async (route) => {
    const release = MOCK_RELEASES.find((item) => item.id === releaseId) ?? MOCK_RELEASES[0];
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(release),
    });
  });
}

export async function mockReportNotFound(page: Page, releaseId: string): Promise<void> {
  await page.route(`${API_BASE}/releases/${releaseId}/report`, async (route) => {
    await route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({
        correlationId: 'corr-e2e-404',
        statusCode: 404,
        message: 'No report available yet. Run an assessment first.',
        errors: [],
        timestamp: new Date().toISOString(),
      }),
    });
  });
}

export async function mockAssess(
  page: Page,
  releaseId: string,
  result: ReleaseReadinessResponse,
): Promise<void> {
  await page.route(`${API_BASE}/releases/${releaseId}/assess`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(result),
    });
  });
}

export { GO_FIXTURE, NO_GO_FIXTURE } from '../src/tests/fixtures';
