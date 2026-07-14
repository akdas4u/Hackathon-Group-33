import type { ReactElement } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { ToggleSwitch } from './ToggleSwitch';

export function NotificationsSection(): ReactElement {
  const user = useAuthStore((state) => state.user);
  const prefs = useUiStore((state) => state.notificationPrefs);
  const setNotificationPref = useUiStore((state) => state.setNotificationPref);

  // Business rule from the prototype: Release Managers always get critical
  // blocker alerts. Derived for display only — nothing to keep in sync since
  // there's no notification backend to actually honor this value either way.
  const criticalForcedOn = user?.role === 'ReleaseManager';
  const criticalValue = criticalForcedOn ? true : prefs.criticalBlockerDetected;

  return (
    <div>
      <h2 className="mb-4 text-base font-semibold text-text-primary">Notifications</h2>
      <div className="flex flex-col">
        <ToggleSwitch
          id="notif-assessment-complete"
          label="Assessment complete"
          description="Notify when an assessment finishes."
          checked={prefs.assessmentComplete}
          onChange={(value) => setNotificationPref('assessmentComplete', value)}
        />
        <ToggleSwitch
          id="notif-critical-blocker"
          label="Critical blocker detected"
          description={
            criticalForcedOn
              ? 'Always on for Release Manager.'
              : 'Notify when a stage is flagged Critical.'
          }
          checked={criticalValue}
          onChange={(value) => setNotificationPref('criticalBlockerDetected', value)}
          disabled={criticalForcedOn}
        />
        <ToggleSwitch
          id="notif-decision-changed"
          label="GO / NO-GO decision changed"
          description="Decision revised after a re-run."
          checked={prefs.decisionChanged}
          onChange={(value) => setNotificationPref('decisionChanged', value)}
        />
        <ToggleSwitch
          id="notif-daily-summary"
          label="Daily summary email"
          description="Release summary each morning."
          checked={prefs.dailySummaryEmail}
          onChange={(value) => setNotificationPref('dailySummaryEmail', value)}
        />
      </div>
      <p className="mt-3 text-xs text-text-muted">
        Saved to your browser — this demo has no notification delivery backend, so nothing is actually
        sent.
      </p>
    </div>
  );
}
