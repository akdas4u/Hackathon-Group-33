import type { ReactElement } from 'react';
import { Bell, Palette, Shield, SlidersHorizontal, User, type LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

export type SettingsSectionId = 'profile' | 'appearance' | 'notifications' | 'security' | 'prefs';

interface NavEntry {
  readonly id: SettingsSectionId;
  readonly label: string;
  readonly icon: LucideIcon;
}

const NAV_ENTRIES: readonly NavEntry[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'prefs', label: 'Release prefs', icon: SlidersHorizontal },
];

export interface SettingsNavProps {
  readonly active: SettingsSectionId;
  readonly onChange: (id: SettingsSectionId) => void;
}

/** Left-hand settings nav, matching the prototype's `.settings-nav` / `.sn-item`. */
export function SettingsNav({ active, onChange }: SettingsNavProps): ReactElement {
  return (
    <nav
      aria-label="Settings sections"
      className="w-40 shrink-0 border-r border-border-default bg-surface-card py-4"
    >
      <p className="mb-2 border-b border-border-default px-4 pb-3 text-sm font-semibold text-text-primary">
        Settings
      </p>
      <ul className="flex flex-col">
        {NAV_ENTRIES.map((entry) => {
          const Icon = entry.icon;
          const isActive = entry.id === active;
          return (
            <li key={entry.id}>
              <button
                type="button"
                onClick={() => onChange(entry.id)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex w-full items-center gap-2 px-4 py-2 text-left text-xs font-medium transition-colors',
                  isActive
                    ? 'border-r-2 border-brand-teal bg-brand-teal/10 text-brand-teal'
                    : 'text-text-secondary hover:bg-surface-subtle',
                )}
              >
                <Icon size={14} aria-hidden="true" />
                {entry.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
