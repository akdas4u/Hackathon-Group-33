using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;

namespace ReleaseReadiness.API.Configuration;

/// <summary>
/// ASP.NET Core built-in rate limiting: a fixed 1-minute window per authenticated user
/// (falling back to remote IP for anonymous requests), applied globally.
/// </summary>
public static class RateLimitingSetup
{
    public static IServiceCollection AddReleaseReadinessRateLimiting(this IServiceCollection services, IConfiguration configuration)
    {
        int requestsPerMinute = configuration.GetValue<int?>("RateLimit:RequestsPerMinute") ?? 100;

        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

            options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
            {
                string partitionKey = httpContext.User.Identity?.IsAuthenticated == true
                    ? httpContext.User.Identity!.Name ?? "authenticated-unknown"
                    : httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

                return RateLimitPartition.GetFixedWindowLimiter(partitionKey, _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = requestsPerMinute,
                    Window = TimeSpan.FromMinutes(1),
                    QueueLimit = 0
                });
            });
        });

        return services;
    }
}
