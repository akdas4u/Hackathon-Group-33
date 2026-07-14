import type { ReactElement } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

export interface ExecutiveSummaryProps {
  readonly summary: string;
}

export function ExecutiveSummary({ summary }: ExecutiveSummaryProps): ReactElement {
  return (
    <Card data-testid="executive-summary">
      <CardHeader>
        <CardTitle>Executive Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{summary}</p>
      </CardContent>
    </Card>
  );
}
