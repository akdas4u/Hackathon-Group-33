import type { ReactElement } from 'react';
import { useTheme } from '../../providers/ThemeProvider';
import { useUiStore, type Density, type Theme } from '../../store/uiStore';
import { cn } from '../../utils/cn';

const THEME_OPTIONS: ReadonlyArray<{ readonly value: Theme; readonly label: string; readonly swatch: string }> = [
  { value: 'light', label: 'Light', swatch: 'bg-gradient-to-br from-[#f4f6f8] to-white' },
  { value: 'dark', label: 'Dark', swatch: 'bg-gradient-to-br from-[#0a1a1f] to-[#0f2530]' },
  { value: 'system', label: 'System', swatch: 'bg-gradient-to-br from-[#f4f6f8] to-[#0a1a1f]' },
];

const DENSITY_OPTIONS: readonly Density[] = ['compact', 'comfortable', 'spacious'];

const ACCENT_PRESETS: readonly string[] = ['#00c6c2', '#1565c0', '#6d28d9', '#1e8a4c'];

export function AppearanceSection(): ReactElement {
  const { theme, setTheme } = useTheme();
  const density = useUiStore((state) => state.density);
  const setDensity = useUiStore((state) => state.setDensity);
  const accentColor = useUiStore((state) => state.accentColor);
  const setAccentColor = useUiStore((state) => state.setAccentColor);

  return (
    <div>
      <h2 className="mb-4 text-base font-semibold text-text-primary">Appearance</h2>

      <div className="mb-6">
        <p className="mb-2 text-xs font-medium text-text-secondary">Theme</p>
        <div className="flex gap-2">
          {THEME_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setTheme(option.value)}
              aria-pressed={theme === option.value}
              className={cn(
                'flex-1 rounded-md border p-2 text-center transition-colors',
                theme === option.value
                  ? 'border-brand-teal'
                  : 'border-border-default hover:border-border-strong',
              )}
            >
              <div className={cn('mb-1.5 h-8 rounded', option.swatch)} />
              <span className="text-[11px] font-medium text-text-secondary">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <p className="mb-2 text-xs font-medium text-text-secondary">Density</p>
        <div className="flex gap-2">
          {DENSITY_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setDensity(option)}
              aria-pressed={density === option}
              className={cn(
                'flex-1 rounded-md border px-3 py-2 text-xs font-medium capitalize transition-colors',
                density === option
                  ? 'border-brand-teal bg-brand-teal text-white'
                  : 'border-border-default text-text-secondary hover:bg-surface-subtle',
              )}
            >
              {option}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-text-muted">
          Saved to your preferences — no page currently reads density to change its spacing.
        </p>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-text-secondary">Accent colour</p>
        <div className="flex items-center gap-2">
          {ACCENT_PRESETS.map((hex) => (
            <button
              key={hex}
              type="button"
              aria-label={`Use accent colour ${hex}`}
              aria-pressed={accentColor.toLowerCase() === hex.toLowerCase()}
              onClick={() => setAccentColor(hex)}
              style={{ backgroundColor: hex }}
              className={cn(
                'h-7 w-7 rounded-full border-2 transition-transform',
                accentColor.toLowerCase() === hex.toLowerCase()
                  ? 'scale-110 border-text-primary'
                  : 'border-border-default',
              )}
            />
          ))}
          <label className="relative h-7 w-7 cursor-pointer overflow-hidden rounded-full border-2 border-border-default">
            <span className="sr-only">Choose a custom accent colour</span>
            <input
              type="color"
              value={accentColor}
              onChange={(event) => setAccentColor(event.target.value)}
              className="absolute -left-1 -top-1 h-9 w-9 cursor-pointer border-none p-0"
            />
          </label>
        </div>
        <p className="mt-2 text-xs text-text-muted">
          Saved to your preferences — not yet applied elsewhere in this demo.
        </p>
      </div>
    </div>
  );
}
