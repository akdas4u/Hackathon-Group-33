import type { ReactElement, ReactNode } from 'react';
import { DECISION_LABEL_CLASSES, DECISION_LABELS, DECISION_PANEL_CLASSES } from '../../utils/confidence';
import { cn } from '../../utils/cn';
import type { Decision } from '../../types';

export interface GoNoGoPanelProps {
  readonly decision: Decision;
  readonly confidenceScore: number;
  /**
   * Optional extra content rendered below the confidence line — used by
   * ReleaseDetail to nest the gauge + Export PDF/Re-run actions inside the
   * same card, matching the prototype's single `.decision-panel`. Report.tsx
   * renders this panel without children and keeps its own separate gauge.
   */
  readonly children?: ReactNode;
}

export function GoNoGoPanel({ decision, confidenceScore, children }: GoNoGoPanelProps): ReactElement {
  return (
    <div
      data-testid="go-no-go-panel"
      data-decision={decision}
      className={cn(
        'flex flex-col items-center gap-2 rounded-lg border p-6 text-center shadow-md',
        DECISION_PANEL_CLASSES[decision],
      )}
    >
      <span className="text-[11px] font-semibold uppercase tracking-widest text-text-muted">
        Release Decision
      </span>
      <span
        data-testid="decision-label"
        className={cn('text-3xl font-extrabold tracking-tight', DECISION_LABEL_CLASSES[decision])}
      >
        {DECISION_LABELS[decision]}
      </span>
      <span className="text-xs text-text-secondary">
        Confidence score: {Math.round(confidenceScore)}%
      </span>
      {children}
    </div>
  );
}
