using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReleaseReadiness.API.Configuration;
using ReleaseReadiness.API.Middleware;
using ReleaseReadiness.Application.DTOs;
using ReleaseReadiness.Application.Services;
using ReleaseReadiness.Application.Services.Reporting;

namespace ReleaseReadiness.API.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/releases")]
[Authorize]
public sealed class ReleasesController : ControllerBase
{
    private readonly IReleaseReadinessService _releaseReadinessService;
    private readonly IReleaseReadinessReportFactory _reportFactory;

    public ReleasesController(IReleaseReadinessService releaseReadinessService, IReleaseReadinessReportFactory reportFactory)
    {
        _releaseReadinessService = releaseReadinessService;
        _reportFactory = reportFactory;
    }

    /// <summary>Lists every release known to the mock repository.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<ReleaseDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<ReleaseDto>>> GetAll(CancellationToken cancellationToken)
    {
        var releases = await _releaseReadinessService.GetAllReleasesAsync(cancellationToken).ConfigureAwait(false);
        return Ok(releases);
    }

    /// <summary>Gets a single release by id.</summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ReleaseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ReleaseDto>> GetById(string id, CancellationToken cancellationToken)
    {
        var release = await _releaseReadinessService.GetReleaseAsync(id, cancellationToken).ConfigureAwait(false);
        return Ok(release);
    }

    /// <summary>
    /// Triggers a full release readiness assessment: runs all eight stage validators in
    /// parallel, computes the confidence score/decision, and caches the result for
    /// subsequent GET /report calls. Requires the <c>CanTriggerAssessment</c> policy.
    /// </summary>
    [HttpPost("{id}/assess")]
    [Authorize(Policy = AuthorizationPolicies.CanTriggerAssessment)]
    [ProducesResponseType(typeof(ReleaseReadinessResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<ActionResult<ReleaseReadinessResponse>> Assess(string id, CancellationToken cancellationToken)
    {
        var correlationId = HttpContext.Items.TryGetValue(CorrelationIdMiddleware.HttpContextItemKey, out var value)
            ? value?.ToString() ?? Guid.NewGuid().ToString()
            : Guid.NewGuid().ToString();

        var triggeredBy = User.Identity?.Name;

        var result = await _releaseReadinessService.AssessAsync(id, correlationId, triggeredBy, cancellationToken).ConfigureAwait(false);
        return Ok(result);
    }

    /// <summary>Returns the last cached assessment result for a release.</summary>
    [HttpGet("{id}/report")]
    [ProducesResponseType(typeof(ReleaseReadinessResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ReleaseReadinessResponse>> GetReport(string id, CancellationToken cancellationToken)
    {
        var result = await _releaseReadinessService.GetCachedReportAsync(id, cancellationToken).ConfigureAwait(false);
        return Ok(result);
    }

    /// <summary>Returns the last cached assessment result rendered as a PDF.</summary>
    [HttpGet("{id}/report/pdf")]
    [Produces("application/pdf")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetReportPdf(string id, CancellationToken cancellationToken)
    {
        var result = await _releaseReadinessService.GetCachedReportAsync(id, cancellationToken).ConfigureAwait(false);
        byte[] pdfBytes = _reportFactory.Create(result, ReportFormat.Pdf);
        return File(pdfBytes, "application/pdf", $"release-readiness-{id}.pdf");
    }
}
