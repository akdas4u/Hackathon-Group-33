import type { ReactElement } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
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
    <Card
      data-testid="critical-issues-panel"
      className="border-2 border-status-fail bg-red-50 shadow-lg"
    >
      <CardHeader className="border-b-status-fail/30">
        <CardTitle className="flex items-center gap-2 text-status-fail">
          <span aria-hidden="true">&#9888;</span>
          Critical Issues ({criticalStages.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {criticalStages.map((stage) => (
          <div
            key={stage.stageKey}
            data-testid={`critical-issue-${stage.stageKey}`}
            className="rounded-md border border-status-fail/40 bg-white p-3"
          >
            <p className="text-sm font-bold text-status-fail">{stage.stageKey}</p>
            <p className="mt-1 text-sm text-slate-700">
              <span className="font-medium">Evidence:</span> {stage.evidence}
            </p>
            {stage.remediation && (
              <p className="mt-1 text-sm text-slate-700">
                <span className="font-medium">Remediation:</span> {stage.remediation}
              </p>
            )}
            {stage.findings.length > 0 && (
              <ul className="mt-1 list-inside list-disc text-sm text-slate-600">
                {stage.findings.map((finding) => (
                  <li key={finding}>{finding}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
