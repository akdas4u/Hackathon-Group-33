import { test, expect } from '@playwright/test';
import { GO_FIXTURE, mockLogin, mockRelease, mockReleasesList, mockReportNotFound } from './mockApi';

test('QA Lead cannot trigger assessment - no trigger button, forbidden messaging shown', async ({
  page,
}) => {
  const releaseId = GO_FIXTURE.releaseId;

  await mockLogin(page, 'qalead');
  await mockReleasesList(page);
  await mockRelease(page, releaseId);
  await mockReportNotFound(page, releaseId);

  await page.goto('/login');
  await page.getByLabel('Username').fill('qalead@demo.io');
  await page.getByLabel('Password').fill('Password123!');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.goto(`/releases/${releaseId}`);

  // QA Lead has no TriggerAssessment permission: the button is not even
  // rendered, and an explanatory message takes its place (belt-and-braces —
  // the backend would also reject a direct POST with 403).
  await expect(page.getByTestId('trigger-assessment-button')).toHaveCount(0);
  await expect(page.getByTestId('trigger-forbidden-message')).toBeVisible();
});
