import { useEffect, type ReactElement } from 'react';
import { ChevronDown } from 'lucide-react';
import { StatusBadge } from '../shared/StatusBadge';
import { RiskBadge } from '../shared/RiskBadge';
import { useUiStore } from '../../store/uiStore';
import { cn } from '../../utils/cn';
import type { StageResult } from '../../types';

export interface StageTableProps {
  readonly stages: readonly StageResult[];
}

/**
 * Prototype-style pipeline stage list: hoverable rows, a 4px red left border
 * on critical stages, and a click-to-expand inline findings panel (slide
 * down, not a modal). Escape or clicking the row again collapses it.
 */
export function StageTable({ stages }: StageTableProps): ReactElement {
  const expandedStageId = useUiStore((state) => state.expandedStageId);
  const toggleStageExpansion = useUiStore((state) => state.toggleStageExpansion);

  useEffect(() => {
    if (!expandedStageId) {
      return undefined;
    }
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape' && expandedStageId) {
        toggleStageExpansion(expandedStageId);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expandedStageId, toggleStageExpansion]);

  return (
    <div data-testid="stage-table" role="table" className="flex flex-col">
      <div
        role="row"
        className="flex items-center gap-3 border-b border-border-default px-4 py-2 text-xs font-medium uppercase tracking-wide text-text-muted"
      >
        <span className="w-32 shrink-0">Stage</span>
        <span className="flex-1">Evidence</span>
        <span className="w-24 shrink-0">Status</span>
        <span className="w-24 shrink-0">Risk</span>
        <span className="w-10 shrink-0" />
      </div>

      {stages.map((stage) => {
        const isCritical = stage.riskLevel === 'Critical';
        const isExpanded = expandedStageId === stage.stageKey;

        return (
          <div
            key={stage.stageKey}
            data-testid={`stage-row-${stage.stageKey}`}
            className={cn(
              'border-b border-border-default last:border-b-0',
              isCritical && 'border-l-4 border-l-danger',
            )}
          >
            <button
              type="button"
              onClick={() => toggleStageExpansion(stage.stageKey)}
              aria-expanded={isExpanded}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-surface-subtle"
            >
              <span className="w-32 shrink-0 truncate font-medium text-text-primary">
                {stage.stageKey}
              </span>
              <span className="flex-1 truncate text-xs text-text-secondary">{stage.evidence}</span>
              <span className="w-24 shrink-0">
                <StatusBadge status={stage.status} size="sm" />
              </span>
              <span className="w-24 shrink-0">
                <RiskBadge risk={stage.riskLevel} size="sm" />
              </span>
              <ChevronDown
                size={14}
                aria-hidden="true"
                className={cn(
                  'w-10 shrink-0 text-text-muted transition-transform duration-200',
                  isExpanded && 'rotate-180',
                )}
              />
            </button>

            {isExpanded && (
              <div className="animate-fade-in-up border-t border-border-default bg-surface-subtle px-4 py-3 text-sm">
                <p className="text-text-secondary">
                  <span className="font-medium text-text-primary">Evidence:</span> {stage.evidence}
                </p>
                {stage.remediation && (
                  <p className="mt-1 text-text-secondary">
                    <span className="font-medium text-text-primary">Remediation:</span>{' '}
                    {stage.remediation}
                  </p>
                )}
                {stage.findings.length > 0 && (
                  <ul className="mt-1 list-inside list-disc text-text-secondary">
                    {stage.findings.map((finding) => (
                      <li key={finding}>{finding}</li>
                    ))}
                  </ul>
                )}
                <p className="mt-1 text-xs text-text-muted">Score: {stage.score}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
