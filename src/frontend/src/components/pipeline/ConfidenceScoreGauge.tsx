import { useEffect, useState, type ReactElement } from 'react';
import {
  CONFIDENCE_BAND_CLASSES,
  CONFIDENCE_BAND_STROKE_VARS,
  formatConfidenceScore,
  getConfidenceBand,
} from '../../utils/confidence';
import { cn } from '../../utils/cn';

export interface ConfidenceScoreGaugeProps {
  readonly score: number;
  readonly size?: number;
}

const RADIUS = 30;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Circular progress ring matching the prototype's `.gauge-wrap` treatment.
 * The percentage text is always driven synchronously from `score` (tests
 * read it with no `waitFor`) — only the ring's stroke-dashoffset animates in
 * on mount/update, via a plain CSS transition (which the global
 * prefers-reduced-motion rule in animations.css already neutralizes).
 */
export function ConfidenceScoreGauge({ score, size = 80 }: ConfidenceScoreGaugeProps): ReactElement {
  const band = getConfidenceBand(score);
  const clamped = Math.max(0, Math.min(100, score));
  const targetOffset = CIRCUMFERENCE - (clamped / 100) * CIRCUMFERENCE;

  // Starts fully "empty" so the ring visibly sweeps in to its target offset.
  const [ringOffset, setRingOffset] = useState(CIRCUMFERENCE);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setRingOffset(targetOffset));
    return () => cancelAnimationFrame(frame);
  }, [targetOffset]);

  return (
    <div
      data-testid="confidence-score-gauge"
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox="0 0 80 80" className="-rotate-90">
        <circle
          cx={40}
          cy={40}
          r={RADIUS}
          fill="none"
          stroke="var(--border-default)"
          strokeWidth={6}
        />
        <circle
          cx={40}
          cy={40}
          r={RADIUS}
          fill="none"
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          style={{
            stroke: CONFIDENCE_BAND_STROKE_VARS[band],
            strokeDashoffset: ringOffset,
            transition: 'stroke-dashoffset 1s ease-out, stroke 0.3s ease',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span
          data-testid="confidence-score-value"
          data-band={band}
          className={cn('text-lg font-bold leading-tight', CONFIDENCE_BAND_CLASSES[band])}
        >
          {formatConfidenceScore(score)}
        </span>
        <span className="text-[9px] uppercase tracking-wide text-text-muted">confidence</span>
      </div>
    </div>
  );
}
