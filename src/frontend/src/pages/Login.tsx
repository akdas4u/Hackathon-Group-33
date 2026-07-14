import type { ReactElement } from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { cn } from '../utils/cn';

type PreviewStatus = 'pass' | 'fail' | 'pending';

interface StagePreviewRow {
  readonly label: string;
  readonly status: PreviewStatus;
}

/** Purely decorative demo preview on the login screen — not real pipeline data. */
const STAGE_PREVIEW: readonly StagePreviewRow[] = [
  { label: 'Jira stories', status: 'pass' },
  { label: 'GitHub PRs', status: 'fail' },
  { label: 'SonarQube', status: 'pass' },
  { label: 'Test results', status: 'pending' },
];

const DOT_CLASSES: Record<PreviewStatus, string> = {
  pass: 'bg-success',
  fail: 'bg-danger animate-pulse-red',
  pending: 'bg-warning',
};

const BADGE_CLASSES: Record<PreviewStatus, string> = {
  pass: 'bg-success-bg text-success',
  fail: 'bg-danger-bg text-danger',
  pending: 'bg-warning-bg text-warning',
};

const BADGE_LABEL: Record<PreviewStatus, string> = {
  pass: 'PASS',
  fail: 'FAIL',
  pending: 'PENDING',
};

export function Login(): ReactElement {
  return (
    <div className="flex min-h-screen bg-surface-page">
      <div className="hidden w-[42%] max-w-md shrink-0 flex-col gap-8 bg-brand-black px-10 py-12 md:flex">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-teal text-xs font-bold text-white">
            V1
          </div>
          <span className="text-sm font-semibold text-white">Version 1</span>
        </div>

        <div>
          <p className="text-2xl font-bold leading-snug text-white">Release with confidence.</p>
          <p className="mt-3 text-xs leading-relaxed text-white/50">
            AI-powered GO/NO-GO decisions for every deployment. Automated. Evidence-based.
            CAB-ready.
          </p>
        </div>

        <div className="mt-auto flex flex-col gap-2">
          {STAGE_PREVIEW.map((row) => (
            <div
              key={row.label}
              className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2"
            >
              <span
                aria-hidden="true"
                className={cn('h-[7px] w-[7px] shrink-0 rounded-full', DOT_CLASSES[row.status])}
              />
              <span className="text-xs text-white/70">{row.label}</span>
              <span
                className={cn(
                  'ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium',
                  BADGE_CLASSES[row.status],
                )}
              >
                {BADGE_LABEL[row.status]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-surface-card px-4 py-12">
        <LoginForm />
      </div>
    </div>
  );
}

export default Login;
