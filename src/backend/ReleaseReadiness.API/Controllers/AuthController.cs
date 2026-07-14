using Asp.Versioning;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReleaseReadiness.Application.DTOs;
using ReleaseReadiness.Infrastructure.Identity;
using DomainValidationException = ReleaseReadiness.Domain.Exceptions.ValidationException;

namespace ReleaseReadiness.API.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/auth")]
[AllowAnonymous]
public sealed class AuthController : ControllerBase
{
    private readonly IIdentityProvider _identityProvider;
    private readonly IValidator<LoginRequest> _loginValidator;
    private readonly IValidator<RefreshRequest> _refreshValidator;

    public AuthController(
        IIdentityProvider identityProvider,
        IValidator<LoginRequest> loginValidator,
        IValidator<RefreshRequest> refreshValidator)
    {
        _identityProvider = identityProvider;
        _loginValidator = loginValidator;
        _refreshValidator = refreshValidator;
    }

    /// <summary>Mock login: issues an HS256 JWT + refresh token for one of the five demo users (see users.json).</summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        var validationResult = await _loginValidator.ValidateAsync(request, cancellationToken).ConfigureAwait(false);
        if (!validationResult.IsValid)
        {
            throw new DomainValidationException(validationResult.Errors.Select(e => e.ErrorMessage).ToArray());
        }

        var user = await _identityProvider.ValidateCredentialsAsync(request.Username, request.Password, cancellationToken).ConfigureAwait(false);
        if (user is null)
        {
            return Unauthorized();
        }

        var tokens = await _identityProvider.IssueTokensAsync(user, cancellationToken).ConfigureAwait(false);
        var userDto = new UserDto(user.Username, user.Role, user.Permissions);

        return Ok(new LoginResponse(tokens.AccessToken, tokens.RefreshToken, userDto));
    }

    /// <summary>Exchanges a refresh token for a new access token.</summary>
    [HttpPost("refresh")]
    [ProducesResponseType(typeof(RefreshResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<ActionResult<RefreshResponse>> Refresh([FromBody] RefreshRequest request, CancellationToken cancellationToken)
    {
        var validationResult = await _refreshValidator.ValidateAsync(request, cancellationToken).ConfigureAwait(false);
        if (!validationResult.IsValid)
        {
            throw new DomainValidationException(validationResult.Errors.Select(e => e.ErrorMessage).ToArray());
        }

        var accessToken = await _identityProvider.RefreshAccessTokenAsync(request.RefreshToken, cancellationToken).ConfigureAwait(false);
        if (accessToken is null)
        {
            return Unauthorized();
        }

        return Ok(new RefreshResponse(accessToken));
    }
}
