import type { ReactElement } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useUiStore, type EnvironmentFilter } from '../../store/uiStore';
import { cn } from '../../utils/cn';

const ENVIRONMENT_OPTIONS: readonly EnvironmentFilter[] = ['Production', 'Staging', 'Development', 'All'];

/** Human labels for the 8 real STAGE_KEYS (src/types/index.ts). */
const STAGE_LABELS: Record<string, string> = {
  Jira: 'Jira',
  GitHub: 'GitHub',
  SonarQube: 'SonarQube',
  TestResults: 'Test results',
  AzureMonitor: 'Azure Monitor',
  OwaspCompliance: 'OWASP compliance',
  DeploymentConfig: 'Deployment config',
  StressTest: 'Stress test',
};

export function ReleasePrefsSection(): ReactElement {
  const prefs = useUiStore((state) => state.releasePrefs);
  const setReleasePref = useUiStore((state) => state.setReleasePref);
  const reorderStages = useUiStore((state) => state.reorderStages);

  function moveStage(index: number, direction: -1 | 1): void {
    const target = index + direction;
    if (target < 0 || target >= prefs.stageOrder.length) {
      return;
    }
    const next = [...prefs.stageOrder];
    [next[index], next[target]] = [next[target], next[index]];
    reorderStages(next);
  }

  return (
    <div>
      <h2 className="mb-4 text-base font-semibold text-text-primary">Release preferences</h2>

      <div className="mb-6">
        <p className="mb-2 text-xs font-medium text-text-secondary">Default environment</p>
        <div className="flex gap-2">
          {ENVIRONMENT_OPTIONS.map((env) => (
            <button
              key={env}
              type="button"
              aria-pressed={prefs.defaultEnvironmentFilter === env}
              onClick={() => setReleasePref('defaultEnvironmentFilter', env)}
              className={cn(
                'flex-1 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors',
                prefs.defaultEnvironmentFilter === env
                  ? 'border-brand-teal bg-brand-teal text-white'
                  : 'border-border-default text-text-secondary hover:bg-surface-subtle',
              )}
            >
              {env}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-text-muted">
          Saved to your preferences — the release list doesn&apos;t filter by environment yet (the
          backend has no environment tagging on releases).
        </p>
      </div>

      <div className="mb-6">
        <p className="mb-2 text-xs font-medium text-text-secondary">Pipeline stage order</p>
        <ul className="flex flex-col gap-1.5">
          {prefs.stageOrder.map((stageKey, index) => {
            const label = STAGE_LABELS[stageKey] ?? stageKey;
            return (
              <li
                key={stageKey}
                className="flex items-center gap-2 rounded-md border border-border-default bg-surface-card px-3 py-2"
              >
                <span className="text-sm text-text-primary">{label}</span>
                <div className="ml-auto flex items-center gap-1">
                  <button
                    type="button"
                    aria-label={`Move ${label} up`}
                    disabled={index === 0}
                    onClick={() => moveStage(index, -1)}
                    className="rounded p-1 text-text-muted transition-colors hover:bg-surface-subtle disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ChevronUp size={14} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Move ${label} down`}
                    disabled={index === prefs.stageOrder.length - 1}
                    onClick={() => moveStage(index, 1)}
                    className="rounded p-1 text-text-muted transition-colors hover:bg-surface-subtle disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ChevronDown size={14} aria-hidden="true" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-xs text-text-muted">
          Saved to your preferences — the pipeline table doesn&apos;t read this order yet.
        </p>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-text-secondary">PDF export contents</p>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm text-text-primary">
            <input
              type="checkbox"
              checked={prefs.pdfIncludeExecutiveSummary}
              onChange={(event) => setReleasePref('pdfIncludeExecutiveSummary', event.target.checked)}
              style={{ accentColor: 'var(--color-brand-teal)' }}
              className="h-4 w-4"
            />
            Executive summary
          </label>
          <label className="flex items-center gap-2 text-sm text-text-primary">
            <input
              type="checkbox"
              checked={prefs.pdfIncludeEvidence}
              onChange={(event) => setReleasePref('pdfIncludeEvidence', event.target.checked)}
              style={{ accentColor: 'var(--color-brand-teal)' }}
              className="h-4 w-4"
            />
            Evidence detail
          </label>
          <label className="flex items-center gap-2 text-sm text-text-primary">
            <input
              type="checkbox"
              checked={prefs.pdfIncludeRemediation}
              onChange={(event) => setReleasePref('pdfIncludeRemediation', event.target.checked)}
              style={{ accentColor: 'var(--color-brand-teal)' }}
              className="h-4 w-4"
            />
            Remediation guidance
          </label>
        </div>
        <p className="mt-2 text-xs text-text-muted">
          Saved to your preferences — the PDF export doesn&apos;t read these toggles yet.
        </p>
      </div>
    </div>
  );
}
