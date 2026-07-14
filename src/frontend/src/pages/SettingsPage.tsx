import { useState, type ReactElement } from 'react';
import { AppearanceSection } from '../components/settings/AppearanceSection';
import { NotificationsSection } from '../components/settings/NotificationsSection';
import { ProfileSection } from '../components/settings/ProfileSection';
import { ReleasePrefsSection } from '../components/settings/ReleasePrefsSection';
import { SecuritySection } from '../components/settings/SecuritySection';
import { SettingsNav, type SettingsSectionId } from '../components/settings/SettingsNav';
import { ToastStack } from '../components/shared/ToastStack';
import { cn } from '../utils/cn';

/**
 * Settings page: left settings-nav + right content panel, matching the
 * prototype's `#tab-settings`. Rendered inside AppLayout (sidebar/topbar
 * already provided by the shell) — this component owns only the area below
 * that. Sections stay mounted (hidden via CSS) rather than unmounting on tab
 * switch, so in-progress edits (e.g. an unsaved profile field) survive
 * navigating away and back.
 */
export function SettingsPage(): ReactElement {
  const [active, setActive] = useState<SettingsSectionId>('profile');

  return (
    <div className="flex min-h-full">
      <SettingsNav active={active} onChange={setActive} />
      <div className="flex-1 overflow-y-auto bg-surface-page p-6">
        <div className={cn(active !== 'profile' && 'hidden')}>
          <ProfileSection />
        </div>
        <div className={cn(active !== 'appearance' && 'hidden')}>
          <AppearanceSection />
        </div>
        <div className={cn(active !== 'notifications' && 'hidden')}>
          <NotificationsSection />
        </div>
        <div className={cn(active !== 'security' && 'hidden')}>
          <SecuritySection />
        </div>
        <div className={cn(active !== 'prefs' && 'hidden')}>
          <ReleasePrefsSection />
        </div>
      </div>
      <ToastStack />
    </div>
  );
}
