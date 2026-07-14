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
  red: 'text-danger',
  amber: 'text-warning',
  green: 'text-success',
};

export const CONFIDENCE_BAND_BG_CLASSES: Record<ConfidenceBand, string> = {
  red: 'bg-danger',
  amber: 'bg-warning',
  green: 'bg-success',
};

/** Raw CSS color values (for SVG `stroke`, which does not resolve Tailwind classes). */
export const CONFIDENCE_BAND_STROKE_VARS: Record<ConfidenceBand, string> = {
  red: 'var(--color-danger)',
  amber: 'var(--color-warning)',
  green: 'var(--color-success)',
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

/** Text color for the big GO / NO GO label — the panel itself stays a neutral card. */
export const DECISION_LABEL_CLASSES: Record<Decision, string> = {
  Go: 'text-success',
  GoWithConditions: 'text-warning',
  NoGo: 'text-danger',
};

/** Panel-level emphasis — only NoGo gets the hard-to-miss pulsing red border. */
export const DECISION_PANEL_CLASSES: Record<Decision, string> = {
  Go: 'border-border-default bg-surface-card',
  GoWithConditions: 'border-warning-border bg-warning-bg',
  NoGo: 'border-2 border-danger bg-danger-bg animate-pulse-border',
};

export function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}
