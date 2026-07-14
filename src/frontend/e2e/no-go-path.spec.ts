import { test, expect } from '@playwright/test';
import { NO_GO_FIXTURE, mockAssess, mockLogin, mockRelease, mockReleasesList, mockReportNotFound } from './mockApi';

test('scripted blockers -> NO GO panel with 2 blockers visible', async ({ page }) => {
  const releaseId = NO_GO_FIXTURE.releaseId;

  await mockLogin(page, 'coordinator');
  await mockReleasesList(page);
  await mockRelease(page, releaseId);
  await mockReportNotFound(page, releaseId);
  await mockAssess(page, releaseId, NO_GO_FIXTURE);

  await page.goto('/login');
  await page.getByLabel('Username').fill('coordinator@demo.io');
  await page.getByLabel('Password').fill('Password123!');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.goto(`/releases/${releaseId}`);
  await page.getByTestId('trigger-assessment-button').click();

  await expect(page.getByTestId('go-no-go-panel')).toHaveAttribute('data-decision', 'NoGo');
  await expect(page.getByTestId('decision-label')).toHaveText('NO GO');

  const criticalPanel = page.getByTestId('critical-issues-panel');
  await expect(criticalPanel).toBeVisible();
  await expect(criticalPanel.getByText(/Critical Issues \(2\)/)).toBeVisible();

  // The two scripted blockers per the CONTRACT demo dataset.
  await expect(page.getByTestId('critical-issue-GitHub')).toBeVisible();
  await expect(page.getByTestId('critical-issue-DeploymentConfig')).toBeVisible();
});
