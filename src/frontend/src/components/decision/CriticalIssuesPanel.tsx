import type { ReactElement } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { StageResult } from '../../types';

export interface CriticalIssuesPanelProps {
  readonly stages: readonly StageResult[];
}

/**
 * Lists every stage with riskLevel "Critical" in a hard-to-miss, red-bordered
 * panel. This is the component the demo dataset (GitHub + DeploymentConfig
 * both Critical/Fail) exercises to justify a NO GO decision.
 */
export function CriticalIssuesPanel({ stages }: CriticalIssuesPanelProps): ReactElement | null {
  const criticalStages = stages.filter((stage) => stage.riskLevel === 'Critical');

  if (criticalStages.length === 0) {
    return null;
  }

  return (
    <div
      data-testid="critical-issues-panel"
      className="rounded-lg border-2 border-danger bg-danger-bg shadow-lg"
    >
      <div className="flex items-center gap-2 border-b border-danger-border/50 p-4">
        <AlertTriangle size={18} className="text-danger" aria-hidden="true" />
        <h2 className="text-base font-semibold text-danger">
          Critical Issues ({criticalStages.length})
        </h2>
      </div>
      <div className="flex flex-col gap-3 p-4">
        {criticalStages.map((stage) => (
          <div
            key={stage.stageKey}
            data-testid={`critical-issue-${stage.stageKey}`}
            className="rounded-md border border-danger-border/60 bg-surface-card p-3"
          >
            <p className="text-sm font-bold text-danger">{stage.stageKey}</p>
            <p className="mt-1 text-sm text-text-secondary">
              <span className="font-medium text-text-primary">Evidence:</span> {stage.evidence}
            </p>
            {stage.remediation && (
              <p className="mt-1 text-sm text-text-secondary">
                <span className="font-medium text-text-primary">Remediation:</span>{' '}
                {stage.remediation}
              </p>
            )}
            {stage.findings.length > 0 && (
              <ul className="mt-1 list-inside list-disc text-sm text-text-secondary">
                {stage.findings.map((finding) => (
                  <li key={finding}>{finding}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
