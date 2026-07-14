import type { ReactElement } from 'react';
import { TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

export type KpiVariant = 'neutral' | 'success' | 'warning' | 'danger';

export interface KpiTrend {
  readonly value: number;
  readonly direction: 'up' | 'down';
  readonly label: string;
  /** Whether "up" is the good direction for this metric (e.g. false for a blocker count). */
  readonly upIsGood?: boolean;
}

export interface KpiCardProps {
  readonly label: string;
  readonly value: number;
  readonly trend?: KpiTrend;
  readonly variant?: KpiVariant;
  readonly icon?: LucideIcon;
}

const BORDER_CLASSES: Record<KpiVariant, string> = {
  neutral: 'border-l-text-muted',
  success: 'border-l-success',
  warning: 'border-l-warning',
  danger: 'border-l-danger',
};

export function KpiCard({ label, value, trend, variant = 'neutral', icon: Icon }: KpiCardProps): ReactElement {
  const trendIsGood = trend ? (trend.upIsGood ?? true) === (trend.direction === 'up') : null;
  const TrendIcon = trend?.direction === 'up' ? TrendingUp : TrendingDown;

  return (
    <div
      className={cn(
        'rounded-lg border border-border-default bg-surface-card px-6 py-5 shadow-sm border-l-4',
        BORDER_CLASSES[variant],
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-text-muted">{label}</span>
        {Icon && <Icon size={16} className="text-text-muted" aria-hidden="true" />}
      </div>
      <div className="mt-1 text-3xl font-semibold text-text-primary">{value}</div>
      {trend && (
        <div
          className={cn(
            'mt-1 flex items-center gap-1 text-xs font-medium',
            trendIsGood ? 'text-success' : 'text-danger',
          )}
        >
          <TrendIcon size={12} aria-hidden="true" />
          <span>
            {trend.value}% {trend.label}
          </span>
        </div>
      )}
    </div>
  );
}

export function KpiCardSkeleton(): ReactElement {
  return (
    <div className="rounded-lg border border-border-default bg-surface-card px-6 py-5 shadow-sm">
      <div className="h-3 w-20 animate-shimmer rounded bg-surface-subtle" />
      <div className="mt-2 h-8 w-12 animate-shimmer rounded bg-surface-subtle" />
    </div>
  );
}
