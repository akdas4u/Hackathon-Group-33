// Hand-written to match backend contract. Replace with: npx openapi-typescript http://localhost:5000/swagger/v1/swagger.json -o src/types/api.ts once the backend is running.

/** The 8 mocked pipeline stage keys (exact strings, must match backend). */
export type StageKey =
  | 'Jira'
  | 'GitHub'
  | 'SonarQube'
  | 'TestResults'
  | 'AzureMonitor'
  | 'OwaspCompliance'
  | 'DeploymentConfig'
  | 'StressTest';

export const STAGE_KEYS: readonly StageKey[] = [
  'Jira',
  'GitHub',
  'SonarQube',
  'TestResults',
  'AzureMonitor',
  'OwaspCompliance',
  'DeploymentConfig',
  'StressTest',
] as const;

export type StageStatus = 'Pass' | 'Fail' | 'Unavailable';

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type Decision = 'Go' | 'GoWithConditions' | 'NoGo';

export interface StageResult {
  readonly stageKey: string;
  readonly status: StageStatus;
  readonly riskLevel: RiskLevel;
  readonly score: number;
  readonly findings: readonly string[];
  readonly evidence: string;
  readonly remediation: string | null;
}

export interface ReleaseReadinessResponse {
  readonly releaseId: string;
  readonly generatedAt: string;
  readonly correlationId: string;
  readonly stages: readonly StageResult[];
  readonly confidenceScore: number;
  readonly decision: Decision;
  readonly executiveSummary: string;
}

export type ReleaseStatus = string;

export interface Release {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly status: ReleaseStatus;
}

/** Permission strings granted to a user; gate UI affordances (e.g. trigger button). */
export type Permission =
  | 'TriggerAssessment'
  | 'ApproveDecision'
  | 'ReadPipeline'
  | 'ReadTestResults'
  | 'ReadDeploymentConfig'
  | string;

export type Role =
  | 'ReleaseCoordinator'
  | 'ReleaseManager'
  | 'QALead'
  | 'DevOpsEngineer'
  | 'Administrator'
  | string;

export interface AuthUser {
  readonly username: string;
  readonly role: Role;
  readonly permissions: readonly Permission[];
}

export interface LoginRequest {
  readonly username: string;
  readonly password: string;
}

export interface LoginResponse {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly user: AuthUser;
}

export interface RefreshRequest {
  readonly refreshToken: string;
}

export interface RefreshResponse {
  readonly accessToken: string;
}

/** Standard error envelope returned on any non-2xx JSON response. */
export interface ApiErrorEnvelope {
  readonly correlationId: string;
  readonly statusCode: number;
  readonly message: string;
  readonly errors: readonly string[];
  readonly timestamp: string;
}

/** Type guard for the standard error envelope, useful in axios error handlers. */
export function isApiErrorEnvelope(value: unknown): value is ApiErrorEnvelope {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.correlationId === 'string' &&
    typeof candidate.statusCode === 'number' &&
    typeof candidate.message === 'string' &&
    Array.isArray(candidate.errors) &&
    typeof candidate.timestamp === 'string'
  );
}
