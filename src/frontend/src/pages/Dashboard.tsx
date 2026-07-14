import { useState, type FormEvent, type ReactElement } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GitBranch, Loader2, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { useReleases } from '../hooks/useReleases';
import { Button } from '../components/ui/Button';
import { KpiCard, KpiCardSkeleton } from '../components/shared/KpiCard';
import { cn } from '../utils/cn';
import type { Release } from '../types';

const RELEASE_STATUS_STYLES: Record<string, string> = {
  InProgress: 'bg-info-bg text-info',
  Blocked: 'bg-danger-bg text-danger',
  Completed: 'bg-success-bg text-success',
};

function releaseStatusClasses(status: string): string {
  return RELEASE_STATUS_STYLES[status] ?? 'bg-surface-subtle text-text-muted';
}

export function Dashboard(): ReactElement {
  const { data: releases, isLoading, isError, error } = useReleases();
  const navigate = useNavigate();

  const [jumpToId, setJumpToId] = useState('');
  const [jumpValidationError, setJumpValidationError] = useState<string | null>(null);

  function handleJumpSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const trimmedId = jumpToId.trim();
    if (!trimmedId) {
      setJumpValidationError('Release ID is required.');
      return;
    }
    setJumpValidationError(null);
    navigate(`/releases/${trimmedId}`);
  }

  const releaseList: readonly Release[] = releases ?? [];
  const total = releaseList.length;
  const inProgress = releaseList.filter((r) => r.status === 'InProgress').length;
  const blocked = releaseList.filter((r) => r.status === 'Blocked').length;
  const completed = releaseList.filter((r) => r.status === 'Completed').length;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-text-primary">Release dashboard</h1>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KpiCardSkeleton />
          <KpiCardSkeleton />
          <KpiCardSkeleton />
          <KpiCardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KpiCard label="Total releases" value={total} variant="neutral" icon={GitBranch} />
          <KpiCard label="In progress" value={inProgress} variant="warning" icon={Loader2} />
          <KpiCard label="Blocked" value={blocked} variant="danger" icon={ShieldAlert} />
          <KpiCard label="Completed" value={completed} variant="success" icon={CheckCircle2} />
        </div>
      )}

      <form
        onSubmit={handleJumpSubmit}
        className="flex items-start gap-2"
        noValidate
        aria-label="Jump to release by ID"
      >
        <div className="flex flex-col gap-1">
          <input
            type="text"
            value={jumpToId}
            onChange={(event) => setJumpToId(event.target.value)}
            placeholder="Enter release ID"
            aria-label="Release ID"
            data-testid="jump-to-release-input"
            className="h-10 w-64 rounded-md border border-border-default bg-surface-card px-3 text-sm text-text-primary outline-none transition-colors focus:border-brand-teal focus:ring-1 focus:ring-brand-teal"
          />
          {jumpValidationError && (
            <p role="alert" data-testid="jump-to-release-error" className="text-sm text-danger">
              {jumpValidationError}
            </p>
          )}
        </div>
        <Button type="submit" variant="secondary">
          View release
        </Button>
      </form>

      {isLoading && <p data-testid="releases-loading">Loading releases…</p>}
      {isError && (
        <p role="alert" data-testid="releases-error" className="text-danger">
          Failed to load releases{error instanceof Error ? `: ${error.message}` : '.'}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {releaseList.map((release) => (
          <Link
            key={release.id}
            to={`/releases/${release.id}`}
            data-testid={`release-card-${release.id}`}
            className="group rounded-lg border border-border-default bg-surface-card p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-semibold text-text-primary">{release.name}</h2>
              <span
                className={cn(
                  'shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
                  releaseStatusClasses(release.status),
                )}
              >
                {release.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-text-muted">Version {release.version}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-teal group-hover:underline">
              View readiness detail <ArrowRight size={14} aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
