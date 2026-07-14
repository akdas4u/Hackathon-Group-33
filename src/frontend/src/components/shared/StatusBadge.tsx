import type { ReactElement } from 'react';
import { CheckCircle2, Clock, Loader2, Minus, XCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

/** Pass/Fail/Unavailable are the real backend StageStatus values; Pending/Running are UI-only states (assessment not yet run / in flight). */
export type StatusBadgeStatus = 'Pass' | 'Fail' | 'Unavailable' | 'Pending' | 'Running';

export interface StatusBadgeProps {
  readonly status: StatusBadgeStatus;
  readonly size?: 'sm' | 'md';
  readonly showIcon?: boolean;
  readonly showLabel?: boolean;
  readonly className?: string;
}

const CONFIG: Record<
  StatusBadgeStatus,
  { readonly label: string; readonly classes: string; readonly Icon: typeof CheckCircle2 }
> = {
  Pass: {
    label: 'PASS',
    classes: 'bg-success-bg text-success border-success-border',
    Icon: CheckCircle2,
  },
  Fail: {
    label: 'FAIL',
    classes: 'bg-danger-bg text-danger border-danger-border',
    Icon: XCircle,
  },
  Unavailable: {
    label: 'UNAVAILABLE',
    classes: 'bg-surface-subtle text-text-muted border-border-default',
    Icon: Minus,
  },
  Pending: {
    label: 'PENDING',
    classes: 'bg-warning-bg text-warning border-warning-border',
    Icon: Clock,
  },
  Running: {
    label: 'RUNNING',
    classes: 'bg-info-bg text-info border-info-border',
    Icon: Loader2,
  },
};

const SIZE_CLASSES: Record<'sm' | 'md', string> = {
  sm: 'h-5 px-2.5 text-[11px] gap-1',
  md: 'h-6 px-3 text-xs gap-1.5',
};

export function StatusBadge({
  status,
  size = 'md',
  showIcon = true,
  showLabel = true,
  className,
}: StatusBadgeProps): ReactElement {
  const { label, classes, Icon } = CONFIG[status];

  return (
    <span
      role="status"
      className={cn(
        'inline-flex items-center rounded-full border font-semibold',
        SIZE_CLASSES[size],
        classes,
        className,
      )}
    >
      {showIcon && (
        <Icon
          size={size === 'sm' ? 11 : 13}
          aria-hidden="true"
          className={status === 'Running' ? 'animate-spin' : undefined}
        />
      )}
      {showLabel && label}
    </span>
  );
}
