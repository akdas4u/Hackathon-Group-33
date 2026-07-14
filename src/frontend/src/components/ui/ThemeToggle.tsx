import type { ReactElement } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../providers/ThemeProvider';
import { cn } from '../../utils/cn';

export type ThemeToggleSize = 'sm' | 'md' | 'lg';

const SIZE_PX: Record<ThemeToggleSize, string> = {
  sm: 'h-8 w-8',
  md: 'h-9 w-9',
  lg: 'h-10 w-10',
};

const ICON_PX: Record<ThemeToggleSize, number> = {
  sm: 16,
  md: 18,
  lg: 20,
};

export interface ThemeToggleProps {
  readonly size?: ThemeToggleSize;
  readonly className?: string;
}

/** Icon-only sun/moon toggle. No text label by design — see aria-label. */
export function ThemeToggle({ size = 'md', className }: ThemeToggleProps): ReactElement {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className={cn(
        'inline-flex items-center justify-center rounded-full border border-border-default',
        'bg-surface-card text-text-secondary transition-colors duration-150',
        'hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-brand-teal focus-visible:ring-offset-2',
        SIZE_PX[size],
        className,
      )}
    >
      <span
        className="inline-flex transition-transform duration-300 ease-in-out"
        style={{ transform: isDark ? 'rotate(180deg)' : 'rotate(0deg)' }}
      >
        {isDark ? (
          <Moon size={ICON_PX[size]} aria-hidden="true" />
        ) : (
          <Sun size={ICON_PX[size]} aria-hidden="true" />
        )}
      </span>
    </button>
  );
}
