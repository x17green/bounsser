# ADR-002: BullMQ for Job Queue Processing

## Status

Accepted

## Date

2024-01-15

## Context

The Bouncer backend requires a robust job queue system to handle asynchronous
tasks such as:

- Processing Twitter webhook payloads
- Running impersonation detection algorithms on user data
- Sending notification emails
- Generating analytics reports
- Periodic data cleanup and maintenance tasks
- Rate-limited API calls to external services

### Requirements

- **Reliability**: Jobs must not be lost, even during system failures
- **Scalability**: Handle high-throughput job processing across multiple workers
- **Observability**: Monitor job status, failures, and performance metrics
- **Priority Handling**: Support job prioritization and delayed execution
- **Retry Logic**: Automatic retry with exponential backoff for failed jobs
- **Concurrency Control**: Limit concurrent jobs per queue/worker type
- **Development Experience**: Easy to use, test, and debug
- **Redis Integration**: Leverage existing Redis infrastructure

### Alternatives Considered

#### 1. RabbitMQ + Bull

**Pros:**

- Mature message broker with AMQP protocol
- Strong durability guarantees
- Built-in clustering and high availability
- Bull provides good Node.js integration

**Cons:**

- Additional infrastructure complexity (separate RabbitMQ service)
- Bull is no longer actively maintained
- Higher operational overhead
- More complex deployment and monitoring

#### 2. AWS SQS + Custom Implementation

**Pros:**

- Fully managed service with high availability
- Pay-per-use pricing model
- Integrates well with other AWS services
- No infrastructure management

**Cons:**

- Vendor lock-in to AWS ecosystem
- Higher latency compared to Redis-based solutions
- Limited customization options
- Cost implications for high-volume processing
- Additional complexity for local development

#### 3. Kafka + KafkaJS

**Pros:**

- Excellent for high-throughput event streaming
- Strong durability and replay capabilities
- Good for event sourcing patterns
- Horizontal scalability

**Cons:**

- Overkill for simple job queue use cases
- Complex operational requirements (Zookeeper, etc.)
- Higher resource usage
- Steeper learning curve
- Not ideal for traditional job queue patterns

#### 4. PostgreSQL + pg-boss

**Pros:**

- Uses existing PostgreSQL database
- ACID compliance and strong consistency
- No additional infrastructure required
- Good for simple job queue needs

**Cons:**

- Database overhead for high-volume job processing
- Limited scalability compared to Redis-based solutions
- Potential impact on main database performance
- Less specialized features for job processing

#### 5. BullMQ

**Pros:**

- Modern successor to Bull with active maintenance
- Built on Redis for excellent performance
- Rich feature set (priorities, delays, repeatable jobs, etc.)
- Excellent observability with Bull Dashboard
- Strong TypeScript support
- Flexible worker configuration
- Built-in retry mechanisms with exponential backoff
- Low latency job processing
- Easy horizontal scaling

**Cons:**

- Depends on Redis availability
- In-memory nature requires careful backup strategies
- Learning curve for advanced features

## Decision

We will use **BullMQ** as our job queue processing system.

### Key Factors

1. **Performance**: Redis-based architecture provides excellent performance for
   job processing
2. **Feature Completeness**: Rich feature set covering all our requirements
   (priorities, delays, retries, etc.)
3. **Developer Experience**: Excellent TypeScript support and intuitive API
4. **Observability**: Bull Dashboard provides comprehensive job monitoring
5. **Community**: Active development and strong community support
6. **Infrastructure Alignment**: Leverages existing Redis infrastructure
7. **Scalability**: Easy horizontal scaling with multiple workers

### Technical Specifications

- **Version**: BullMQ 4.x
- **Redis**: Redis 6+ for optimal performance
- **Worker Strategy**: Separate worker processes for different job types
- **Dashboard**: Bull Dashboard for monitoring and management
- **Retry Policy**: Exponential backoff with configurable max attempts

## Consequences

### Positive

- **High Performance**: Redis-based storage provides low-latency job processing
- **Rich Features**: Comprehensive job queue functionality out of the box
- **Excellent Observability**: Built-in dashboard and metrics
- **Type Safety**: Full TypeScript support for job definitions and handlers
- **Flexible Scaling**: Easy to add workers for specific job types
- **Development Friendly**: Good local development experience
- **Reliable Processing**: Built-in retry logic and job persistence

### Negative

- **Redis Dependency**: System reliability depends on Redis availability
- **Memory Usage**: Redis stores all job data in memory
- **Backup Complexity**: Need proper Redis backup and persistence strategies
- **Learning Curve**: Advanced features require understanding of BullMQ concepts

### Mitigation Strategies

1. **Redis High Availability**: Use Redis Sentinel or Cluster for production
2. **Persistent Storage**: Configure Redis with appropriate persistence (RDB +
   AOF)
3. **Monitoring**: Implement Redis monitoring and alerting
4. **Graceful Degradation**: Handle Redis unavailability gracefully
5. **Job Cleanup**: Implement automatic cleanup of completed jobs
6. **Resource Limits**: Configure appropriate memory limits and job concurrency

## Implementation Details

### Job Types

```typescript
// Core job types for the system
export enum JobType {
  WEBHOOK_PROCESSING = 'webhook:process',
  IMPERSONATION_DETECTION = 'detection:analyze',
  EMAIL_NOTIFICATION = 'email:send',
  ANALYTICS_GENERATION = 'analytics:generate',
  DATA_CLEANUP = 'maintenance:cleanup',
  TWITTER_API_CALL = 'twitter:api-call',
}
```

### Queue Configuration

```typescript
// Queue configuration with different priorities and settings
const queueConfig = {
  [JobType.WEBHOOK_PROCESSING]: {
    concurrency: 50,
    priority: 10,
    attempts: 3,
  },
  [JobType.IMPERSONATION_DETECTION]: {
    concurrency: 5,
    priority: 5,
    attempts: 2,
  },
  [JobType.EMAIL_NOTIFICATION]: {
    concurrency: 10,
    priority: 3,
    attempts: 5,
  },
};
```

### Worker Strategy

- **Webhook Workers**: High concurrency for processing Twitter webhooks
- **Detection Workers**: CPU-intensive, lower concurrency for ML algorithms
- **Notification Workers**: Medium concurrency for email/notification sending
- **Maintenance Workers**: Low priority, scheduled cleanup tasks

## Monitoring and Observability

- Bull Dashboard for real-time job monitoring
- Custom Prometheus metrics for job queue performance
- Alerting on job failure rates and queue depth
- Redis monitoring for memory usage and performance

## References

- [BullMQ Documentation](https://docs.bullmq.io/)
- [Redis Best Practices](https://redis.io/docs/manual/admin/)
- [Job Queue Pattern Comparison](https://blog.logrocket.com/comparing-message-queues-node-js/)
- [Bull Dashboard](https://github.com/felixmosh/bull-board)

## Review Date

2024-07-15 (6 months from decision date)
