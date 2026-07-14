using System.Collections.Concurrent;

namespace ReleaseReadiness.Infrastructure.Caching;

/// <summary>
/// "NoOp" in the sense of having no external dependency -- it is a real, working
/// process-local cache backed by a dictionary, used today by <c>SonarQubeMockClient</c>
/// to demonstrate the Polly Fallback pattern (serve last-known-good on failure).
/// TECHNICAL DEBT: replace with a distributed cache (Redis / Azure Cache) before
/// scaling beyond a single instance.
/// </summary>
public sealed class NoOpCacheService : ICacheService
{
    private sealed record Entry(object? Value, DateTimeOffset? ExpiresAt);

    private readonly ConcurrentDictionary<string, Entry> _store = new();

    public Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken)
    {
        if (_store.TryGetValue(key, out var entry) && (entry.ExpiresAt is null || entry.ExpiresAt > DateTimeOffset.UtcNow))
        {
            return Task.FromResult((T?)entry.Value);
        }

        return Task.FromResult(default(T));
    }

    public Task SetAsync<T>(string key, T value, TimeSpan? ttl, CancellationToken cancellationToken)
    {
        var expiresAt = ttl.HasValue ? DateTimeOffset.UtcNow.Add(ttl.Value) : (DateTimeOffset?)null;
        _store[key] = new Entry(value, expiresAt);
        return Task.CompletedTask;
    }
}
