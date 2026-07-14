import type { Decision, RiskLevel } from '../types';

export type ConfidenceBand = 'red' | 'amber' | 'green';

/** red <50, amber 50-79, green 80-100 (per contract). */
export function getConfidenceBand(score: number): ConfidenceBand {
  if (score < 50) {
    return 'red';
  }
  if (score < 80) {
    return 'amber';
  }
  return 'green';
}

export const CONFIDENCE_BAND_CLASSES: Record<ConfidenceBand, string> = {
  red: 'text-status-fail',
  amber: 'text-risk-medium',
  green: 'text-status-pass',
};

export const CONFIDENCE_BAND_BG_CLASSES: Record<ConfidenceBand, string> = {
  red: 'bg-status-fail',
  amber: 'bg-risk-medium',
  green: 'bg-status-pass',
};

export function formatConfidenceScore(score: number): string {
  return `${Math.round(score)}%`;
}

export const RISK_LEVEL_CLASSES: Record<RiskLevel, string> = {
  Low: 'bg-risk-low/10 text-risk-low border-risk-low',
  Medium: 'bg-risk-medium/10 text-risk-medium border-risk-medium',
  High: 'bg-risk-high/10 text-risk-high border-risk-high',
  Critical: 'bg-risk-critical/10 text-risk-critical border-risk-critical',
};

export const DECISION_LABELS: Record<Decision, string> = {
  Go: 'GO',
  GoWithConditions: 'GO WITH CONDITIONS',
  NoGo: 'NO GO',
};

export const DECISION_CLASSES: Record<Decision, string> = {
  Go: 'bg-status-pass text-white',
  GoWithConditions: 'bg-risk-medium text-white',
  NoGo: 'bg-status-fail text-white',
};

export function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}
