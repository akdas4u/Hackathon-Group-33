using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;

namespace ReleaseReadiness.Tests.Integration;

/// <summary>
/// Hosts the real API in-memory (real Program.cs wiring, real mock Infrastructure) for
/// full HTTP-pipeline integration tests -- JWT auth, policy enforcement, the exception
/// middleware's ErrorResponse envelope, everything. Forces the Development environment
/// so appsettings.Development.json's dev JWT secret is used regardless of ambient
/// ASPNETCORE_ENVIRONMENT.
/// </summary>
public sealed class TestApiFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");
    }
}
