import type { ReactElement } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useRelease } from '../hooks/useRelease';
import { useReport } from '../hooks/useReport';
import { useTriggerAssessment } from '../hooks/useTriggerAssessment';
import { useAuthStore } from '../store/authStore';
import { usePipelineStore } from '../store/pipelineStore';
import { Button } from '../components/ui/Button';
import { StageTable } from '../components/pipeline/StageTable';
import { ConfidenceScoreGauge } from '../components/pipeline/ConfidenceScoreGauge';
import { GoNoGoPanel } from '../components/decision/GoNoGoPanel';
import { CriticalIssuesPanel } from '../components/decision/CriticalIssuesPanel';
import { ExecutiveSummary } from '../components/decision/ExecutiveSummary';
import { isApiErrorEnvelope } from '../types';

export function ReleaseDetail(): ReactElement {
  const { id } = useParams<{ id: string }>();
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canTrigger = hasPermission('TriggerAssessment');

  const { data: release } = useRelease(id);
  const { data: report, isLoading: isReportLoading } = useReport(id);
  const triggerAssessment = useTriggerAssessment(id ?? '');
  const pipelineResult = usePipelineStore((state) => state.result);

  const activeResult = pipelineResult?.releaseId === id ? pipelineResult : report;

  if (!id) {
    return (
      <p role="alert" data-testid="release-id-error" className="p-8 text-status-fail">
        No release ID provided.
      </p>
    );
  }

  const triggerErrorMessage = (): string | null => {
    const error = triggerAssessment.error;
    if (!error) {
      return null;
    }
    const responseData = (error as { response?: { data?: unknown; status?: number } }).response
      ?.data;
    const status = (error as { response?: { status?: number } }).response?.status;
    if (status === 403) {
      return 'You do not have permission to trigger an assessment.';
    }
    if (isApiErrorEnvelope(responseData)) {
      return responseData.message;
    }
    return 'Failed to trigger assessment.';
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link to="/dashboard" className="text-sm text-brand-600 hover:underline">
        &larr; Back to releases
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {release?.name ?? `Release ${id}`}
          </h1>
          {release && <p className="text-sm text-slate-500">Version {release.version}</p>}
        </div>
        <div className="flex flex-col items-end gap-1">
          {canTrigger ? (
            <Button
              onClick={() => triggerAssessment.mutate()}
              disabled={triggerAssessment.isPending}
              data-testid="trigger-assessment-button"
            >
              {triggerAssessment.isPending ? 'Running assessment…' : 'Run Assessment'}
            </Button>
          ) : (
            <p data-testid="trigger-forbidden-message" className="text-sm text-slate-500">
              Your role cannot trigger assessments.
            </p>
          )}
          {triggerErrorMessage() && (
            <p role="alert" data-testid="trigger-error" className="text-sm text-status-fail">
              {triggerErrorMessage()}
            </p>
          )}
        </div>
      </div>

      {isReportLoading && !activeResult && (
        <p className="mt-8 text-slate-500" data-testid="report-loading">
          Loading latest report…
        </p>
      )}

      {activeResult && (
        <div className="mt-8 flex flex-col gap-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <GoNoGoPanel
              decision={activeResult.decision}
              confidenceScore={activeResult.confidenceScore}
            />
            <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <ConfidenceScoreGauge score={activeResult.confidenceScore} />
            </div>
          </div>

          <CriticalIssuesPanel stages={activeResult.stages} />

          <ExecutiveSummary summary={activeResult.executiveSummary} />

          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <h2 className="border-b border-slate-100 p-4 text-lg font-semibold text-slate-900">
              Pipeline Stages
            </h2>
            <StageTable stages={activeResult.stages} />
          </div>

          <Link
            to={`/releases/${id}/report`}
            className="self-start text-sm font-medium text-brand-600 hover:underline"
          >
            View print-friendly report &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}

export default ReleaseDetail;
