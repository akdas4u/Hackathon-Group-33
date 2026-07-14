using System.Text.Json;

namespace ReleaseReadiness.Infrastructure.MockData;

/// <summary>Loads and caches a mock fixture JSON document by file name.</summary>
public interface IMockDataProvider
{
    Task<JsonDocument> LoadAsync(string fileName, CancellationToken cancellationToken);
}
