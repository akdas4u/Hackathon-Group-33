using Microsoft.Extensions.Logging;
using ReleaseReadiness.Domain.Events;

namespace ReleaseReadiness.Infrastructure.Events;

/// <summary>
/// Default <see cref="IDomainEventPublisher"/>: logs the event for audit purposes and
/// does nothing else. TECHNICAL DEBT: replace with an Azure Service Bus / event grid
/// publisher when downstream consumers exist.
/// </summary>
public sealed class NoOpEventPublisher : IDomainEventPublisher
{
    private readonly ILogger<NoOpEventPublisher> _logger;

    public NoOpEventPublisher(ILogger<NoOpEventPublisher> logger)
    {
        _logger = logger;
    }

    public Task PublishAsync<TEvent>(TEvent domainEvent, CancellationToken cancellationToken) where TEvent : notnull
    {
        _logger.LogInformation("Domain event published (no-op transport): {EventType} {@Event}", typeof(TEvent).Name, domainEvent);
        return Task.CompletedTask;
    }
}
