import type {
  AuthUser,
  LoginResponse,
  Release,
  ReleaseReadinessResponse,
  StageResult,
} from '../types';

/**
 * Single source of truth for the demo datasets, consumed by Jest unit tests
 * AND Playwright e2e specs (via `page.route` stubbing) so both suites agree
 * with the CONTRACT's documented demo expectation.
 */

const PASSING_STAGE = (stageKey: string, riskLevel: StageResult['riskLevel'] = 'Low'): StageResult => ({
  stageKey,
  status: 'Pass',
  riskLevel,
  score: riskLevel === 'Low' ? 100 : riskLevel === 'Medium' ? 70 : 40,
  findings: [],
  evidence: `${stageKey} checks completed with no blocking findings.`,
  remediation: null,
});

export const NO_GO_STAGES: readonly StageResult[] = [
  PASSING_STAGE('Jira', 'Low'),
  {
    stageKey: 'GitHub',
    status: 'Fail',
    riskLevel: 'Critical',
    score: 0,
    findings: ['Unmerged hotfix PR #482 targets the release branch'],
    evidence: 'PR #482 "hotfix/payment-timeout" is open against release/2.4.0 and unmerged.',
    remediation: 'Merge or explicitly defer PR #482 before proceeding with the release.',
  },
  PASSING_STAGE('SonarQube', 'Low'),
  PASSING_STAGE('TestResults', 'Medium'),
  PASSING_STAGE('AzureMonitor', 'Low'),
  PASSING_STAGE('OwaspCompliance', 'Medium'),
  {
    stageKey: 'DeploymentConfig',
    status: 'Fail',
    riskLevel: 'Critical',
    score: 0,
    findings: ['Missing required external API configuration key: PAYMENTS_API_KEY'],
    evidence: 'appsettings.Production.json is missing required key "PAYMENTS_API_KEY".',
    remediation: 'Add the missing configuration key to the production key vault before deploying.',
  },
  PASSING_STAGE('StressTest', 'Low'),
];

export const NO_GO_FIXTURE: ReleaseReadinessResponse = {
  releaseId: 'release-2',
  generatedAt: '2026-07-14T09:00:00.000Z',
  correlationId: 'corr-nogo-0001',
  stages: NO_GO_STAGES,
  confidenceScore: 0,
  decision: 'NoGo',
  executiveSummary:
    'Release 2.4.0 is NOT READY for deployment. Two critical blockers were identified: ' +
    'an unmerged hotfix PR against the release branch (GitHub) and a missing external API ' +
    'configuration key (Deployment Config). Both must be resolved before this release can ' +
    'be reconsidered. All other pipeline stages passed.',
};

const GO_STAGES: readonly StageResult[] = [
  PASSING_STAGE('Jira', 'Low'),
  PASSING_STAGE('GitHub', 'Low'),
  PASSING_STAGE('SonarQube', 'Low'),
  PASSING_STAGE('TestResults', 'Low'),
  PASSING_STAGE('AzureMonitor', 'Low'),
  PASSING_STAGE('OwaspCompliance', 'Low'),
  PASSING_STAGE('DeploymentConfig', 'Low'),
  PASSING_STAGE('StressTest', 'Low'),
];

export const GO_FIXTURE: ReleaseReadinessResponse = {
  releaseId: 'release-1',
  generatedAt: '2026-07-14T09:00:00.000Z',
  correlationId: 'corr-go-0001',
  stages: GO_STAGES,
  confidenceScore: 100,
  decision: 'Go',
  executiveSummary:
    'Release 1.0.0 is READY for deployment. All 8 pipeline stages passed with low risk ratings.',
};

export const MOCK_RELEASES: readonly Release[] = [
  { id: 'release-1', name: 'Payments Platform', version: '1.0.0', status: 'InProgress' },
  { id: 'release-2', name: 'Checkout Revamp', version: '2.4.0', status: 'Blocked' },
  { id: 'release-3', name: 'Loyalty Rewards', version: '0.9.3', status: 'Completed' },
];

export const MOCK_USERS: Readonly<Record<string, AuthUser>> = {
  coordinator: {
    username: 'coordinator@demo.io',
    role: 'ReleaseCoordinator',
    permissions: ['ReadPipeline', 'TriggerAssessment'],
  },
  manager: {
    username: 'manager@demo.io',
    role: 'ReleaseManager',
    permissions: ['ReadPipeline', 'TriggerAssessment', 'ApproveDecision'],
  },
  qalead: {
    username: 'qalead@demo.io',
    role: 'QALead',
    permissions: ['ReadPipeline', 'ReadTestResults'],
  },
  devops: {
    username: 'devops@demo.io',
    role: 'DevOpsEngineer',
    permissions: ['ReadPipeline', 'ReadDeploymentConfig'],
  },
  admin: {
    username: 'admin@demo.io',
    role: 'Administrator',
    permissions: [
      'ReadPipeline',
      'TriggerAssessment',
      'ApproveDecision',
      'ReadTestResults',
      'ReadDeploymentConfig',
    ],
  },
};

export function mockLoginResponse(userKey: keyof typeof MOCK_USERS): LoginResponse {
  return {
    accessToken: `mock-access-token-${userKey}`,
    refreshToken: `mock-refresh-token-${userKey}`,
    user: MOCK_USERS[userKey],
  };
}
