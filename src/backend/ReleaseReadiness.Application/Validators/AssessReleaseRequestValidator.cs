using FluentValidation;
using ReleaseReadiness.Application.DTOs;

namespace ReleaseReadiness.Application.Validators;

/// <summary>
/// Validates the route-bound release id before an assessment is triggered. Invoked
/// explicitly by the controller/service (not via MVC auto-validation) so every failure
/// path funnels through <see cref="ReleaseReadiness.Domain.Exceptions.ValidationException"/>
/// and the single global exception-to-422 mapping.
/// </summary>
public sealed class AssessReleaseRequestValidator : AbstractValidator<AssessReleaseRequest>
{
    public AssessReleaseRequestValidator()
    {
        RuleFor(x => x.ReleaseId)
            .NotEmpty().WithMessage("Release id is required.")
            .MaximumLength(64).WithMessage("Release id must be 64 characters or fewer.");
    }
}
