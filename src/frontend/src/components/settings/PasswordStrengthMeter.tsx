import type { ReactElement } from 'react';
import { cn } from '../../utils/cn';

export type PasswordStrength = 0 | 1 | 2 | 3 | 4;

/**
 * Real client-side scoring (length / mixed case / digit / symbol) — the
 * submission itself doesn't reach a server, but this computation genuinely
 * reflects the typed value.
 */
export function getPasswordStrength(password: string): PasswordStrength {
  if (password.length === 0) {
    return 0;
  }
  let score = 0;
  if (password.length >= 8) {
    score += 1;
  }
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score += 1;
  }
  if (/\d/.test(password)) {
    score += 1;
  }
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  }
  return score as PasswordStrength;
}

const LABELS: Record<PasswordStrength, string> = {
  0: 'Very weak',
  1: 'Weak',
  2: 'Fair',
  3: 'Good',
  4: 'Strong',
};

const BAR_CLASSES: Record<PasswordStrength, string> = {
  0: 'bg-danger',
  1: 'bg-danger',
  2: 'bg-warning',
  3: 'bg-info',
  4: 'bg-success',
};

const TEXT_CLASSES: Record<PasswordStrength, string> = {
  0: 'text-danger',
  1: 'text-danger',
  2: 'text-warning',
  3: 'text-info',
  4: 'text-success',
};

export interface PasswordStrengthMeterProps {
  readonly password: string;
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps): ReactElement {
  const score = getPasswordStrength(password);
  const widthPct = (score / 4) * 100;

  return (
    <div className="mt-1">
      <div className="h-1 w-full overflow-hidden rounded-full bg-border-default">
        <div
          className={cn('h-full transition-all duration-200', BAR_CLASSES[score])}
          style={{ width: `${widthPct}%` }}
        />
      </div>
      {password.length > 0 && (
        <p className={cn('mt-1 text-[11px] font-medium', TEXT_CLASSES[score])}>{LABELS[score]}</p>
      )}
    </div>
  );
}
