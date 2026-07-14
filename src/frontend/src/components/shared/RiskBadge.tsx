import type { ReactElement } from 'react';
import { cn } from '../../utils/cn';
import type { RiskLevel } from '../../types';

export interface RiskBadgeProps {
  readonly risk: RiskLevel;
  readonly size?: 'sm' | 'md';
  readonly className?: string;
}

const CONFIG: Record<RiskLevel, { readonly label: string; readonly classes: string }> = {
  Low: { label: 'LOW', classes: 'bg-success-bg text-success' },
  Medium: { label: 'MEDIUM', classes: 'bg-warning-bg text-warning' },
  High: { label: 'HIGH', classes: 'bg-danger-bg text-danger' },
  Critical: { label: 'CRITICAL', classes: 'bg-danger-bg text-danger animate-pulse-red' },
};

const SIZE_CLASSES: Record<'sm' | 'md', string> = {
  sm: 'h-5 px-2 text-[10px]',
  md: 'h-6 px-2.5 text-[11px]',
};

export function RiskBadge({ risk, size = 'md', className }: RiskBadgeProps): ReactElement {
  const { label, classes } = CONFIG[risk];

  return (
    <span
      role="status"
      className={cn(
        'inline-flex items-center rounded-full font-semibold',
        SIZE_CLASSES[size],
        classes,
        className,
      )}
    >
      {label}
    </span>
  );
}
