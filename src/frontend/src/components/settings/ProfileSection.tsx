import { useEffect, useState, type ReactElement } from 'react';
import { Check, X } from 'lucide-react';
import { JWT_EXPIRY_MINUTES, useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { cn } from '../../utils/cn';
import { RoleBadge } from '../user/RoleBadge';
import { UserAvatar } from '../user/UserAvatar';

/** Human labels for the real permission strings returned by the backend. */
const PERMISSION_LABELS: Record<string, string> = {
  ReadPipeline: 'View pipeline stages',
  TriggerAssessment: 'Trigger assessments',
  ReadTestResults: 'View test results',
  ReadDeploymentConfig: 'View deployment configuration',
  ApproveDecision: 'Approve GO / NO-GO decisions',
};

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

/** Real countdown to loginTimestamp + JWT_EXPIRY_MINUTES — matches the backend's actual token lifetime. */
function useSessionCountdown(loginTimestamp: number | null): {
  readonly display: string;
  readonly urgent: boolean;
} {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (loginTimestamp == null) {
    return { display: '--:--:--', urgent: false };
  }

  const expiresAt = loginTimestamp + JWT_EXPIRY_MINUTES * 60 * 1000;
  const totalSeconds = Math.max(0, Math.floor((expiresAt - now) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    display: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
    urgent: totalSeconds < 300,
  };
}

export function ProfileSection(): ReactElement {
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const loginTimestamp = useAuthStore((state) => state.loginTimestamp);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const pushToast = useUiStore((state) => state.pushToast);

  const [fullName, setFullName] = useState(profile?.fullName ?? '');
  const [department, setDepartment] = useState(profile?.department ?? '');
  const [timezone, setTimezone] = useState(profile?.timezone ?? '');

  const countdown = useSessionCountdown(loginTimestamp);

  if (!user || !profile) {
    return <p className="text-sm text-text-muted">Profile unavailable — please sign in again.</p>;
  }

  const currentProfile = profile;
  const trimmedFullName = fullName.trim() || currentProfile.fullName;
  const trimmedDepartment = department.trim();
  const trimmedTimezone = timezone.trim();
  const isDirty =
    trimmedFullName !== currentProfile.fullName ||
    trimmedDepartment !== currentProfile.department ||
    trimmedTimezone !== currentProfile.timezone;

  function handleSave(): void {
    updateProfile({
      fullName: trimmedFullName,
      department: trimmedDepartment,
      timezone: trimmedTimezone,
    });
    pushToast('Profile updated.', 'success');
  }

  return (
    <div>
      <h2 className="mb-4 text-base font-semibold text-text-primary">Profile</h2>

      <div className="mb-5 flex items-center gap-4">
        <UserAvatar fullName={profile.fullName} size="lg" />
        <div>
          <p className="text-base font-semibold text-text-primary">{profile.fullName}</p>
          <p className="text-xs text-text-muted">{user.username}</p>
          <RoleBadge role={user.role} className="mt-1" />
        </div>
      </div>

      <div className="mb-5 rounded-lg border border-border-default bg-surface-card p-4">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
          Session information
        </h3>
        <dl className="divide-y divide-border-default text-sm">
          <div className="flex items-center justify-between py-1.5">
            <dt className="text-text-muted">Role</dt>
            <dd>
              <RoleBadge role={user.role} size="sm" />
            </dd>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <dt className="text-text-muted">Last login</dt>
            <dd className="font-medium text-text-primary">
              {loginTimestamp ? new Date(loginTimestamp).toLocaleString() : 'Not available'}
            </dd>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <dt className="text-text-muted">Session expires</dt>
            <dd
              className={cn(
                'font-mono font-medium',
                countdown.urgent ? 'text-danger' : 'text-text-primary',
              )}
            >
              {countdown.display}
            </dd>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <dt className="text-text-muted">Account created</dt>
            <dd className="text-text-muted">Not tracked in this demo</dd>
          </div>
        </dl>

        <h3 className="mb-2 mt-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">
          Permissions
        </h3>
        <ul className="flex flex-col gap-1.5">
          {Object.entries(PERMISSION_LABELS).map(([key, label]) => {
            const allowed = user.permissions.includes(key);
            return (
              <li key={key} className="flex items-center gap-2 text-xs">
                <span
                  className={cn(
                    'flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full',
                    allowed ? 'bg-success-bg text-success' : 'bg-danger-bg text-danger',
                  )}
                >
                  {allowed ? <Check size={9} aria-hidden="true" /> : <X size={9} aria-hidden="true" />}
                </span>
                <span className="text-text-secondary">{label}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="settings-fullname" className="text-xs font-medium text-text-secondary">
            Full name
          </label>
          <input
            id="settings-fullname"
            className="h-9 rounded-md border border-border-default bg-surface-card px-3 text-sm text-text-primary focus:border-brand-teal focus:outline-none"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="settings-department" className="text-xs font-medium text-text-secondary">
            Department
          </label>
          <input
            id="settings-department"
            className="h-9 rounded-md border border-border-default bg-surface-card px-3 text-sm text-text-primary focus:border-brand-teal focus:outline-none"
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="settings-email" className="text-xs font-medium text-text-secondary">
            Email
          </label>
          <input
            id="settings-email"
            readOnly
            value={user.username}
            className="h-9 cursor-not-allowed rounded-md border border-border-default bg-surface-subtle px-3 text-sm text-text-muted"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="settings-timezone" className="text-xs font-medium text-text-secondary">
            Timezone
          </label>
          <input
            id="settings-timezone"
            className="h-9 rounded-md border border-border-default bg-surface-card px-3 text-sm text-text-primary focus:border-brand-teal focus:outline-none"
            value={timezone}
            onChange={(event) => setTimezone(event.target.value)}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={!isDirty}
        className={cn(
          'rounded-md px-4 py-2 text-sm font-semibold text-white transition-colors',
          isDirty ? 'bg-brand-teal hover:bg-brand-teal-hover' : 'cursor-not-allowed bg-border-strong',
        )}
      >
        Save changes
      </button>
    </div>
  );
}
