import { useEffect, type ReactElement, type ReactNode } from 'react';
import { useUiStore, type Theme } from '../store/uiStore';

function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
}

function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', resolveTheme(theme));
}

/**
 * Side-effect-only wrapper: syncs the persisted `uiStore.theme` preference to
 * `<html data-theme>`, which every CSS custom property in tokens.css keys off.
 * index.html has its own copy of this resolution logic so the very first
 * paint is already correct — this effect keeps it correct after that,
 * including live updates when the OS theme changes under 'system'.
 */
export function ThemeProvider({ children }: { readonly children: ReactNode }): ReactElement {
  const theme = useUiStore((state) => state.theme);

  useEffect(() => {
    applyTheme(theme);

    if (theme !== 'system') {
      return undefined;
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (): void => applyTheme(theme);
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [theme]);

  return children as ReactElement;
}

export function useTheme(): {
  readonly theme: Theme;
  readonly resolvedTheme: 'light' | 'dark';
  readonly setTheme: (theme: Theme) => void;
  readonly toggleTheme: () => void;
} {
  const theme = useUiStore((state) => state.theme);
  const setTheme = useUiStore((state) => state.setTheme);
  const resolvedTheme = resolveTheme(theme);

  return {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme: () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'),
  };
}
