import type { ReactElement } from 'react';
import { Badge } from '../ui/Badge';
import type { BadgeVariant } from '../ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table';
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

export interface StageTableProps {
  readonly stages: readonly StageResult[];
}

export function StageTable({ stages }: StageTableProps): ReactElement {
  return (
    <Table data-testid="stage-table">
      <TableHeader>
        <TableRow>
          <TableHead>Stage</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Risk</TableHead>
          <TableHead>Score</TableHead>
          <TableHead>Evidence</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {stages.map((stage) => (
          <TableRow
            key={stage.stageKey}
            data-testid={`stage-row-${stage.stageKey}`}
            className={stage.riskLevel === 'Critical' ? 'bg-red-50' : undefined}
          >
            <TableCell className="font-medium text-slate-900">{stage.stageKey}</TableCell>
            <TableCell>
              <Badge variant={STATUS_BADGE_VARIANT[stage.status]}>{stage.status}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={RISK_BADGE_VARIANT[stage.riskLevel]}>{stage.riskLevel}</Badge>
            </TableCell>
            <TableCell>{stage.score}</TableCell>
            <TableCell className="max-w-xs truncate text-slate-500">{stage.evidence}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
