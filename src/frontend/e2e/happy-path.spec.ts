import { test, expect } from '@playwright/test';
import { GO_FIXTURE, mockAssess, mockLogin, mockRelease, mockReleasesList, mockReportNotFound } from './mockApi';

test('login -> trigger assessment -> GO panel visible', async ({ page }) => {
  const releaseId = GO_FIXTURE.releaseId;

  await mockLogin(page, 'coordinator');
  await mockReleasesList(page);
  await mockRelease(page, releaseId);
  await mockReportNotFound(page, releaseId);
  await mockAssess(page, releaseId, GO_FIXTURE);

  await page.goto('/login');
  await page.getByLabel('Username').fill('coordinator@demo.io');
  await page.getByLabel('Password').fill('Password123!');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/dashboard$/);

  await page.goto(`/releases/${releaseId}`);
  await page.getByTestId('trigger-assessment-button').click();

  const panel = page.getByTestId('go-no-go-panel');
  await expect(panel).toHaveAttribute('data-decision', 'Go');
  await expect(page.getByTestId('decision-label')).toHaveText('GO');
});
