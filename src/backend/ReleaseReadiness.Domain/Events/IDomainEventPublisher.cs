namespace ReleaseReadiness.Domain.Events;

/// <summary>
/// Event-driven extension seam. Interface lives in Domain so Application services can
/// raise domain events without depending on Infrastructure; the default implementation
/// (<c>NoOpEventPublisher</c>, in Infrastructure) is a placeholder for a future
/// Azure Service Bus / event grid publisher.
/// </summary>
public interface IDomainEventPublisher
{
    Task PublishAsync<TEvent>(TEvent domainEvent, CancellationToken cancellationToken) where TEvent : notnull;
}
