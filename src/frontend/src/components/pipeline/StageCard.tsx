import type { ReactElement } from 'react';
import { Badge } from '../ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import type { BadgeVariant } from '../ui/Badge';
import type { StageResult } from '../../types';

const RISK_BADGE_VARIANT: Record<StageResult['riskLevel'], BadgeVariant> = {
  Low: 'success',
  Medium: 'warning',
  High: 'danger',
  Critical: 'danger',
};

const STATUS_BADGE_VARIANT: Record<StageResult['status'], BadgeVariant> = {
  Pass: 'success',
  Fail: 'danger',
  Unavailable: 'neutral',
};

export interface StageCardProps {
  readonly stage: StageResult;
}

export function StageCard({ stage }: StageCardProps): ReactElement {
  const isCritical = stage.riskLevel === 'Critical';

  return (
    <Card
      data-testid={`stage-card-${stage.stageKey}`}
      className={isCritical ? 'border-risk-critical ring-1 ring-risk-critical' : undefined}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{stage.stageKey}</CardTitle>
          <div className="flex gap-2">
            <Badge variant={STATUS_BADGE_VARIANT[stage.status]}>{stage.status}</Badge>
            <Badge variant={RISK_BADGE_VARIANT[stage.riskLevel]}>{stage.riskLevel}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-slate-600">
          Score: <span className="font-semibold text-slate-900">{stage.score}</span>
        </p>
        {stage.findings.length > 0 && (
          <ul className="list-inside list-disc text-sm text-slate-600">
            {stage.findings.map((finding) => (
              <li key={finding}>{finding}</li>
            ))}
          </ul>
        )}
        <p className="text-xs text-slate-500">
          <span className="font-medium">Evidence:</span> {stage.evidence}
        </p>
        {stage.remediation && (
          <p className="text-xs text-slate-500">
            <span className="font-medium">Remediation:</span> {stage.remediation}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
