import { useMemo, useState, type FormEvent, type ReactElement } from 'react';
import { ShieldCheck, ShieldOff } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import { cn } from '../../utils/cn';
import { ConfirmDialog } from './ConfirmDialog';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';

/** Simple, real client-side UA parse — genuinely reflects this browser/OS, unlike IP/location which this app never collects. */
function parseUserAgent(ua: string): string {
  let browser = 'Unknown browser';
  if (/Edg\//.test(ua)) {
    browser = 'Edge';
  } else if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) {
    browser = 'Chrome';
  } else if (/Firefox\//.test(ua)) {
    browser = 'Firefox';
  } else if (/Safari\//.test(ua) && !/Chrome/.test(ua)) {
    browser = 'Safari';
  }

  let os = 'Unknown OS';
  if (/Windows/.test(ua)) {
    os = 'Windows';
  } else if (/Mac OS X/.test(ua)) {
    os = 'macOS';
  } else if (/Android/.test(ua)) {
    os = 'Android';
  } else if (/iPhone|iPad/.test(ua)) {
    os = 'iOS';
  } else if (/Linux/.test(ua)) {
    os = 'Linux';
  }

  return `${browser} · ${os}`;
}

export function SecuritySection(): ReactElement {
  const pushToast = useUiStore((state) => state.pushToast);
  const deviceLabel = useMemo(() => parseUserAgent(navigator.userAgent), []);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [confirmingTwoFactor, setConfirmingTwoFactor] = useState(false);

  const confirmMismatch = confirmPassword.length > 0 && confirmPassword !== newPassword;
  const canSubmit = currentPassword.length > 0 && newPassword.length > 0 && newPassword === confirmPassword;

  function handlePasswordSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }
    pushToast('Saved locally for this demo — not sent to a server.', 'info');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }

  function handleTwoFactorConfirm(): void {
    const next = !twoFactorEnabled;
    setTwoFactorEnabled(next);
    setConfirmingTwoFactor(false);
    pushToast(
      next
        ? '2FA preference saved locally for this demo — not enforced by the server.'
        : '2FA disabled locally for this demo.',
      'info',
    );
  }

  return (
    <div>
      <h2 className="mb-4 text-base font-semibold text-text-primary">Security</h2>

      <div className="mb-5 rounded-lg border border-border-default bg-surface-card p-4">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
          Active session
        </h3>
        <dl className="divide-y divide-border-default text-sm">
          <div className="flex items-center justify-between py-1.5">
            <dt className="text-text-muted">Device</dt>
            <dd className="font-medium text-text-primary">{deviceLabel}</dd>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <dt className="text-text-muted">IP address</dt>
            <dd className="text-text-muted">Not tracked in this demo</dd>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <dt className="text-text-muted">Location</dt>
            <dd className="text-text-muted">Not tracked in this demo</dd>
          </div>
        </dl>
      </div>

      <div className="mb-5 rounded-lg border border-border-default bg-surface-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Two-factor authentication</h3>
            <p className="text-xs text-text-muted">Adds a second step when signing in.</p>
          </div>
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold',
              twoFactorEnabled ? 'bg-success-bg text-success' : 'bg-surface-subtle text-text-muted',
            )}
          >
            {twoFactorEnabled ? (
              <ShieldCheck size={12} aria-hidden="true" />
            ) : (
              <ShieldOff size={12} aria-hidden="true" />
            )}
            {twoFactorEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setConfirmingTwoFactor(true)}
          className="rounded-md border border-border-default px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-subtle"
        >
          {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
        </button>
        <p className="mt-2 text-xs text-text-muted">Demo only — not enforced by the backend.</p>
      </div>

      <form
        onSubmit={handlePasswordSubmit}
        className="rounded-lg border border-border-default bg-surface-card p-4"
      >
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">
          Change password
        </h3>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="current-password" className="text-xs font-medium text-text-secondary">
              Current password
            </label>
            <input
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className="h-9 rounded-md border border-border-default bg-surface-card px-3 text-sm text-text-primary focus:border-brand-teal focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="new-password" className="text-xs font-medium text-text-secondary">
              New password
            </label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="h-9 rounded-md border border-border-default bg-surface-card px-3 text-sm text-text-primary focus:border-brand-teal focus:outline-none"
            />
            <PasswordStrengthMeter password={newPassword} />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="confirm-password" className="text-xs font-medium text-text-secondary">
              Confirm new password
            </label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="h-9 rounded-md border border-border-default bg-surface-card px-3 text-sm text-text-primary focus:border-brand-teal focus:outline-none"
            />
            {confirmMismatch && <p className="text-xs text-danger">Passwords don&apos;t match.</p>}
          </div>
        </div>
        <button
          type="submit"
          disabled={!canSubmit}
          className={cn(
            'mt-4 rounded-md px-4 py-2 text-sm font-semibold text-white transition-colors',
            canSubmit ? 'bg-brand-teal hover:bg-brand-teal-hover' : 'cursor-not-allowed bg-border-strong',
          )}
        >
          Update password
        </button>
      </form>

      <ConfirmDialog
        open={confirmingTwoFactor}
        title={twoFactorEnabled ? 'Disable two-factor authentication?' : 'Enable two-factor authentication?'}
        description="This is a demo toggle — no server-side 2FA enrolment happens in this hackathon build."
        confirmLabel={twoFactorEnabled ? 'Disable' : 'Enable'}
        onConfirm={handleTwoFactorConfirm}
        onCancel={() => setConfirmingTwoFactor(false)}
      />
    </div>
  );
}
