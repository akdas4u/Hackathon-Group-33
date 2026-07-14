import { useState, type FormEvent, type ReactElement } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useReleases } from '../hooks/useReleases';
import { useAuthStore } from '../store/authStore';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

export function Dashboard(): ReactElement {
  const { data: releases, isLoading, isError, error } = useReleases();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Releases</h1>
          {user && (
            <p className="text-sm text-slate-500">
              Signed in as {user.username} ({user.role})
            </p>
          )}
        </div>
        <Button variant="outline" onClick={logout}>
          Sign out
        </Button>
      </div>

      <form
        onSubmit={handleJumpSubmit}
        className="mb-6 flex items-start gap-2"
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
            className="h-10 w-64 rounded-md border border-slate-300 px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          {jumpValidationError && (
            <p role="alert" data-testid="jump-to-release-error" className="text-sm text-status-fail">
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
        <p role="alert" data-testid="releases-error" className="text-status-fail">
          Failed to load releases{error instanceof Error ? `: ${error.message}` : '.'}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {releases?.map((release) => (
          <Card key={release.id} data-testid={`release-card-${release.id}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{release.name}</CardTitle>
                <Badge variant="neutral">{release.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-sm text-slate-500">Version {release.version}</p>
              <Link
                to={`/releases/${release.id}`}
                className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
              >
                View readiness detail &rarr;
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
