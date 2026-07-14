import type { ReactElement } from 'react';

export interface ExecutiveSummaryProps {
  readonly summary: string;
}

export function ExecutiveSummary({ summary }: ExecutiveSummaryProps): ReactElement {
  return (
    <div
      data-testid="executive-summary"
      className="rounded-lg border border-border-default bg-surface-card shadow-sm"
    >
      <div className="border-b border-border-default p-4">
        <h2 className="text-base font-semibold text-text-primary">Executive Summary</h2>
      </div>
      <div className="p-4">
        <p className="whitespace-pre-line text-sm leading-relaxed text-text-secondary">{summary}</p>
      </div>
    </div>
  );
}
