namespace ReleaseReadiness.Infrastructure.Caching;

/// <summary>
/// Scalability placeholder: a generic async cache abstraction. The default
/// <see cref="NoOpCacheService"/> is an in-memory dictionary sufficient for a single
/// demo instance; swap for Redis / Azure Cache to scale horizontally without touching
/// any caller.
/// </summary>
public interface ICacheService
{
    Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken);

    Task SetAsync<T>(string key, T value, TimeSpan? ttl, CancellationToken cancellationToken);
}
