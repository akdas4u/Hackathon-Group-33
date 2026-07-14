import { useState, type ReactElement } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useReport } from '../hooks/useReport';
import { getReportPdf } from '../api/releasesApi';
import { Button } from '../components/ui/Button';
import { StageTable } from '../components/pipeline/StageTable';
import { ConfidenceScoreGauge } from '../components/pipeline/ConfidenceScoreGauge';
import { GoNoGoPanel } from '../components/decision/GoNoGoPanel';
import { CriticalIssuesPanel } from '../components/decision/CriticalIssuesPanel';
import { ExecutiveSummary } from '../components/decision/ExecutiveSummary';
import { formatDateTime } from '../utils/confidence';

/** Print-friendly release readiness report, with a link to the binary PDF export. */
export function Report(): ReactElement {
  const { id } = useParams<{ id: string }>();
  const { data: report, isLoading, isError } = useReport(id);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfExportError, setPdfExportError] = useState(false);

  if (!id) {
    return (
      <p role="alert" className="p-8 text-status-fail">
        No release ID provided.
      </p>
    );
  }

  const releaseId = id;

  async function handleExportPdf(): Promise<void> {
    setPdfExportError(false);
    setIsExportingPdf(true);
    try {
      // Fetched through axiosInstance (carries the bearer token) rather than a
      // plain <a href>, which the browser would send unauthenticated and the
      // API would reject with 401.
      const blob = await getReportPdf(releaseId);
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `release-readiness-${releaseId}.pdf`;
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 print:px-0">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link to={`/releases/${id}`} className="text-sm text-brand-600 hover:underline">
          &larr; Back to release detail
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            Print
          </Button>
          <Button
            variant="secondary"
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            data-testid="pdf-export-button"
            aria-label="Export report as PDF"
          >
            {isExportingPdf ? 'Exporting…' : 'Export PDF'}
          </Button>
        </div>
      </div>

      {pdfExportError && (
        <p role="alert" data-testid="pdf-export-error" className="mb-4 text-xs text-status-fail">
          PDF export failed. Your session may have expired — try signing in again.
        </p>
      )}

      {isLoading && <p data-testid="report-loading">Loading report…</p>}
      {isError && (
        <p role="alert" data-testid="report-error" className="text-status-fail">
          Failed to load report.
        </p>
      )}

      {report && (
        <article className="flex flex-col gap-6">
          <header>
            <h1 className="text-2xl font-bold text-slate-900">Release Readiness Report</h1>
            <p className="text-sm text-slate-500">
              Release {report.releaseId} &middot; generated {formatDateTime(report.generatedAt)}
            </p>
            <p className="text-xs text-slate-400">Correlation ID: {report.correlationId}</p>
          </header>

          <div className="grid gap-6 sm:grid-cols-2">
            <GoNoGoPanel decision={report.decision} confidenceScore={report.confidenceScore} />
            <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <ConfidenceScoreGauge score={report.confidenceScore} />
            </div>
          </div>

          <CriticalIssuesPanel stages={report.stages} />

          <ExecutiveSummary summary={report.executiveSummary} />

          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <h2 className="border-b border-slate-100 p-4 text-lg font-semibold text-slate-900">
              Pipeline Stages
            </h2>
            <StageTable stages={report.stages} />
          </div>
        </article>
      )}
    </div>
  );
}

export default Report;
