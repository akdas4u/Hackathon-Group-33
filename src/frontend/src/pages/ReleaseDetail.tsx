import { useState, type ReactElement } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useRelease } from '../hooks/useRelease';
import { useReport } from '../hooks/useReport';
import { useTriggerAssessment } from '../hooks/useTriggerAssessment';
import { useAuthStore } from '../store/authStore';
import { usePipelineStore } from '../store/pipelineStore';
import { getReportPdf } from '../api/releasesApi';
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

  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfExportError, setPdfExportError] = useState(false);

  const activeResult = pipelineResult?.releaseId === id ? pipelineResult : report;

  if (!id) {
    return (
      <p role="alert" data-testid="release-id-error" className="p-8 text-danger">
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

  async function handleExportPdf(): Promise<void> {
    setPdfExportError(false);
    setIsExportingPdf(true);
    try {
      // Through axiosInstance (carries the bearer token) rather than a plain
      // <a href>, which the browser would send unauthenticated.
      const blob = await getReportPdf(id as string);
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `release-readiness-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
    } catch {
      setPdfExportError(true);
    } finally {
      setIsExportingPdf(false);
    }
  }

  const criticalCount = activeResult
    ? activeResult.stages.filter((stage) => stage.riskLevel === 'Critical').length
    : 0;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <Link to="/dashboard" className="text-sm text-brand-teal hover:underline">
        &larr; Back to releases
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{release?.name ?? `Release ${id}`}</h1>
          {release && <p className="text-sm text-text-muted">Version {release.version}</p>}
        </div>
        <div className="flex flex-col items-end gap-1">
          {canTrigger ? (
            <Button
              onClick={() => triggerAssessment.mutate()}
              disabled={triggerAssessment.isPending}
              data-testid="trigger-assessment-button"
              className="bg-brand-teal hover:bg-brand-teal-hover focus-visible:ring-brand-teal"
            >
              {triggerAssessment.isPending ? 'Running assessment…' : 'Run Assessment'}
            </Button>
          ) : (
            <p data-testid="trigger-forbidden-message" className="text-sm text-text-muted">
              Your role cannot trigger assessments.
            </p>
          )}
          {triggerErrorMessage() && (
            <p role="alert" data-testid="trigger-error" className="text-sm text-danger">
              {triggerErrorMessage()}
            </p>
          )}
        </div>
      </div>

      {isReportLoading && !activeResult && (
        <p className="text-text-muted" data-testid="report-loading">
          Loading latest report…
        </p>
      )}

      {!isReportLoading && !activeResult && (
        <p className="text-text-muted" data-testid="no-report-yet">
          No assessment has been run for this release yet. Click &ldquo;Run Assessment&rdquo; above
          to generate one.
        </p>
      )}

      {activeResult && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <div className="flex-1 overflow-hidden rounded-lg border border-border-default bg-surface-card shadow-sm">
              <h2 className="border-b border-border-default p-4 text-base font-semibold text-text-primary">
                Pipeline Stages
              </h2>
              <StageTable stages={activeResult.stages} />
            </div>

            <div className="w-full shrink-0 lg:w-64">
              <GoNoGoPanel decision={activeResult.decision} confidenceScore={activeResult.confidenceScore}>
                <ConfidenceScoreGauge score={activeResult.confidenceScore} />
                <p className="text-center text-xs leading-relaxed text-text-muted">
                  {criticalCount > 0
                    ? `${criticalCount} critical blocker${criticalCount > 1 ? 's' : ''} detected`
                    : 'No critical blockers detected'}
                </p>
                <div className="mt-1 flex w-full flex-col gap-2">
                  <Button
                    size="sm"
                    onClick={handleExportPdf}
                    disabled={isExportingPdf}
                    className="w-full bg-brand-teal hover:bg-brand-teal-hover focus-visible:ring-brand-teal"
                  >
                    {isExportingPdf ? 'Exporting…' : 'Export PDF'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => triggerAssessment.mutate()}
                    disabled={triggerAssessment.isPending || !canTrigger}
                    className="w-full"
                  >
                    Re-run
                  </Button>
                </div>
                {pdfExportError && (
                  <p role="alert" className="text-center text-[11px] text-danger">
                    PDF export failed. Your session may have expired — try signing in again.
                  </p>
                )}
              </GoNoGoPanel>
            </div>
          </div>

          <CriticalIssuesPanel stages={activeResult.stages} />

          <ExecutiveSummary summary={activeResult.executiveSummary} />

          <Link
            to={`/releases/${id}/report`}
            className="self-start text-sm font-medium text-brand-teal hover:underline"
          >
            View print-friendly report &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}

export default ReleaseDetail;
