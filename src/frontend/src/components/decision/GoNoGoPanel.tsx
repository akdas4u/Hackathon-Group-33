import type { ReactElement } from 'react';
import { DECISION_CLASSES, DECISION_LABELS } from '../../utils/confidence';
import type { Decision } from '../../types';

export interface GoNoGoPanelProps {
  readonly decision: Decision;
  readonly confidenceScore: number;
}

export function GoNoGoPanel({ decision, confidenceScore }: GoNoGoPanelProps): ReactElement {
  return (
    <div
      data-testid="go-no-go-panel"
      data-decision={decision}
      className={`flex flex-col items-center justify-center gap-1 rounded-lg p-6 text-center shadow-md ${DECISION_CLASSES[decision]}`}
    >
      <span className="text-sm font-medium uppercase tracking-widest opacity-90">
        Release Decision
      </span>
      <span data-testid="decision-label" className="text-3xl font-extrabold tracking-tight">
        {DECISION_LABELS[decision]}
      </span>
      <span className="text-sm opacity-90">Confidence score: {Math.round(confidenceScore)}%</span>
    </div>
  );
}
