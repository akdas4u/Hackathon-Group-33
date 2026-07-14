import type { ReactElement } from 'react';
import { cn } from '../../utils/cn';

export interface ToggleSwitchProps {
  readonly id: string;
  readonly label: string;
  readonly description?: string;
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
  readonly disabled?: boolean;
}

/**
 * ARIA switch pattern (button[role="switch"] + aria-checked) rather than a
 * bare styled div — keyboard and screen-reader accessible by construction.
 */
export function ToggleSwitch({
  id,
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: ToggleSwitchProps): ReactElement {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border-default py-3 last:border-b-0">
      <div>
        <label
          htmlFor={id}
          className={cn('text-sm font-medium text-text-primary', !disabled && 'cursor-pointer')}
        >
          {label}
        </label>
        {description && <p className="text-xs text-text-muted">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        id={id}
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-5 w-9 shrink-0 rounded-full transition-colors focus-visible:outline-none',
          'focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2',
          checked ? 'bg-brand-teal' : 'bg-border-strong',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform',
            checked ? 'translate-x-[18px]' : 'translate-x-0.5',
          )}
        />
      </button>
    </div>
  );
}
