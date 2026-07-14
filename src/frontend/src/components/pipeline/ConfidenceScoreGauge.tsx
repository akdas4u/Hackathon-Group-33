import type { ReactElement } from 'react';
import {
  CONFIDENCE_BAND_BG_CLASSES,
  CONFIDENCE_BAND_CLASSES,
  formatConfidenceScore,
  getConfidenceBand,
} from '../../utils/confidence';

export interface ConfidenceScoreGaugeProps {
  readonly score: number;
}

/** Renders the confidence % with color banding: red <50, amber 50-79, green 80-100. */
export function ConfidenceScoreGauge({ score }: ConfidenceScoreGaugeProps): ReactElement {
  const band = getConfidenceBand(score);
  const clamped = Math.max(0, Math.min(100, score));

  return (
    <div data-testid="confidence-score-gauge" className="flex flex-col items-center gap-2">
      <div
        data-testid="confidence-score-value"
        data-band={band}
        className={`text-4xl font-bold ${CONFIDENCE_BAND_CLASSES[band]}`}
      >
        {formatConfidenceScore(score)}
      </div>
      <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full ${CONFIDENCE_BAND_BG_CLASSES[band]}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <p className="text-xs uppercase tracking-wide text-slate-500">Confidence Score</p>
    </div>
  );
}
