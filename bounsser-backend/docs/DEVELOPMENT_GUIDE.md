# Bouncer Backend Development Guide

This comprehensive guide provides everything needed to continue developing the Bouncer backend from the current scaffolded state to a fully functional production system.

## 🏗️ Current Project Status

### ✅ Completed Infrastructure
- **Core Application Setup**: Express app, server, configuration management
- **Database Layer**: Prisma schema, client setup, connection management
- **Cache & Queues**: Redis integration, BullMQ worker system
- **Middleware Stack**: Authentication, error handling, metrics, validation
- **Logging System**: Winston-based structured logging with multiple transports
- **Development Tools**: ESLint, Prettier, Jest configuration
- **Docker Setup**: Development and production containers
- **CI/CD Foundation**: GitHub Actions workflows ready

### 🚧 Next Development Phases

## Phase 1: Core Module Implementation (Weeks 1-3)

### 1.1 User Module Completion
**Priority: HIGH**

```bash
# Files to create/complete:
src/modules/user/user.controller.ts
src/modules/user/user.service.ts
src/modules/user/user.model.ts
src/modules/user/user.validation.ts
```

**Key Features to Implement:**
- OAuth 2.0 Twitter integration using twitter-api-v2
- JWT-based authentication with refresh tokens
- User profile management
- Settings and preferences
- Account Activity API subscription management

**Development Steps:**
1. Complete OAuth flow implementation
2. Implement user CRUD operations
3. Add Twitter token encryption/decryption
4. Set up Account Activity API webhooks
5. Add comprehensive input validation

### 1.2 Authentication Middleware
**Priority: HIGH**

```bash
# Files to create:
src/core/middleware/auth.ts
src/core/middleware/validation.ts
```

**Implementation Details:**
- JWT verification and parsing
- User context injection
- Role-based access control
- Request validation using Zod schemas
- Rate limiting integration

### 1.3 Organization Module
**Priority: MEDIUM**

```bash
# Files to create:
src/modules/org/org.controller.ts
src/modules/org/org.service.ts
src/modules/org/org.model.ts
src/modules/org/org.routes.ts
src/modules/org/org.validation.ts
```

**Key Features:**
- Organization management
- Filtered Stream rule configuration
- Multi-user organization access
- Brand monitoring setup

## Phase 2: Twitter Integration (Weeks 3-5)

### 2.1 Ingest Module
**Priority: HIGH**

```bash
# Files to create:
src/modules/ingest/ingest.controller.ts
src/modules/ingest/ingest.service.ts
src/modules/ingest/ingest.routes.ts
src/modules/ingest/webhook.handler.ts
src/modules/ingest/stream.handler.ts
```

**Implementation Focus:**
- Account Activity API webhook handling
- Filtered Stream processing
- Event normalization and validation
- Queue job creation for processing

**Key Components:**
```typescript
// Example webhook handler structure
class WebhookHandler {
  async handleTweetCreateEvent(event: TwitterEvent): Promise<void>
  async handleUserUpdateEvent(event: TwitterEvent): Promise<void>
  async handleFollowEvent(event: TwitterEvent): Promise<void>
  async handleDirectMessageEvent(event: TwitterEvent): Promise<void>
}
```

### 2.2 Twitter API Service Layer
**Priority: HIGH**

```bash
# Files to create:
src/modules/shared/services/twitter.service.ts
src/modules/shared/types/twitter.types.ts
```

**Implementation Details:**
- Rate limit handling and queuing
- Error handling and retry logic
- Token refresh automation
- API response caching

## Phase 3: Detection Engine (Weeks 5-8)

### 3.1 Feature Extraction
**Priority: HIGH**

```bash
# Files to create:
src/modules/features/features.service.ts
src/modules/features/text.extractor.ts
src/modules/features/image.extractor.ts
src/modules/features/metadata.extractor.ts
```

**Feature Types to Implement:**
- **Text Similarity**: Levenshtein distance, SBERT embeddings
- **Image Analysis**: pHash, dHash, CLIP embeddings
- **Metadata Analysis**: Account age, verification status, follower patterns
- **Behavioral Patterns**: Posting frequency, interaction patterns

**Example Implementation:**
```typescript
interface FeatureExtractor {
  extractUsernameFeatures(suspect: string, target: string): UsernameFeatures;
  extractDisplayNameFeatures(suspect: string, target: string): DisplayNameFeatures;
  extractProfileImageFeatures(suspectUrl: string, targetUrl: string): Promise<ImageFeatures>;
  extractMetadataFeatures(suspectAccount: Account, targetAccount: Account): MetadataFeatures;
}
```

### 3.2 Scoring Engine
**Priority: HIGH**

```bash
# Files to create:
src/modules/scoring/scoring.service.ts
src/modules/scoring/rule-based.scorer.ts
src/modules/scoring/ml.scorer.ts (future)
src/modules/scoring/scoring.types.ts
```

**Scoring Implementation:**
- Weighted rule-based scoring (MVP)
- Configurable thresholds
- Score explanation and reasoning
- Performance monitoring

### 3.3 Decision Engine
**Priority: MEDIUM**

```bash
# Files to create:
src/modules/decision/decision.service.ts
src/modules/decision/action.handler.ts
src/modules/decision/threshold.manager.ts
```

**Decision Actions:**
- `ignore`: Low confidence, no action
- `queue_review`: Medium confidence, human review
- `flag_high`: High confidence, immediate alert
- `auto_respond`: Very high confidence, automated response

## Phase 4: Worker Implementation (Weeks 6-9)

### 4.1 Complete Worker Processors
**Priority: HIGH**

```bash
# Files to complete:
src/workers/stream.worker.ts
src/workers/webhook.worker.ts
src/workers/scoring.worker.ts
src/workers/notification.worker.ts
```

**Worker Architecture:**
```typescript
// Example worker structure
export async function processWebhookJob(job: Job<WebhookJobData>): Promise<void> {
  const { eventType, userId, data } = job.data;
  
  // 1. Validate event data
  // 2. Extract features
  // 3. Queue scoring job
  // 4. Update user statistics
  // 5. Log processing metrics
}
```

### 4.2 Job Scheduling
**Priority: MEDIUM**

```bash
# Files to create:
src/workers/scheduler.ts
src/workers/cleanup.worker.ts
```

**Scheduled Tasks:**
- Token refresh automation
- Database cleanup jobs
- Statistics aggregation
- Health check monitoring

## Phase 5: Notification System (Weeks 8-10)

### 5.1 Notification Module
**Priority: MEDIUM**

```bash
# Files to create:
src/modules/notifications/notification.service.ts
src/modules/notifications/channels/email.channel.ts
src/modules/notifications/channels/slack.channel.ts
src/modules/notifications/channels/discord.channel.ts
src/modules/notifications/channels/dm.channel.ts
src/modules/notifications/notification.types.ts
```

**Notification Channels:**
- Email notifications via SMTP
- Slack webhook integration
- Discord webhook integration
- Twitter DM responses
- Custom webhook endpoints

## Phase 6: Monitoring & Analytics (Weeks 9-11)

### 6.1 Monitoring Module
**Priority: MEDIUM**

```bash
# Files to create:
src/modules/monitoring/monitoring.service.ts
src/modules/monitoring/metrics.server.ts
src/modules/monitoring/health.service.ts
src/modules/monitoring/monitoring.routes.ts
```

**Monitoring Features:**
- Real-time dashboards
- Performance metrics
- Error tracking
- Usage analytics
- Cost monitoring

### 6.2 Analytics Engine
**Priority: LOW**

```bash
# Files to create:
src/modules/analytics/analytics.service.ts
src/modules/analytics/report.generator.ts
```

## Phase 7: Testing Implementation (Ongoing)

### 7.1 Test Infrastructure
**Priority: HIGH**

```bash
# Files to create:
tests/setup.ts
tests/globalSetup.ts
tests/globalTeardown.ts
tests/matchers.ts
tests/fixtures/
tests/unit/
tests/integration/
tests/e2e/
```

**Test Coverage Goals:**
- Unit tests: 80%+ coverage
- Integration tests: Critical paths
- E2E tests: User workflows
- Load tests: Performance validation

### 7.2 Test Data Management
```bash
# Create test fixtures:
tests/fixtures/users.json
tests/fixtures/events.json
tests/fixtures/twitter-data.json
```

## Phase 8: Production Readiness (Weeks 11-12)

### 8.1 Security Hardening
- Input sanitization
- Rate limiting optimization
- Security headers configuration
- Vulnerability scanning
- Penetration testing

### 8.2 Performance Optimization
- Database query optimization
- Redis caching strategy
- API response caching
- Connection pooling
- Memory leak prevention

### 8.3 Deployment Pipeline
- Kubernetes manifests
- Helm charts
- Environment-specific configs
- Blue-green deployment
- Rollback procedures

## 🛠️ Development Environment Setup

### Prerequisites
```bash
# Required versions
node --version  # >= 18.0.0
npm --version   # >= 9.0.0
docker --version
docker-compose --version
```

### Quick Start
```bash
# 1. Clone and install
git clone <repository>
cd bouncer-backend
npm install

# 2. Environment setup
cp .env.example .env
# Edit .env with your configurations

# 3. Start development stack
docker-compose up -d postgres redis

# 4. Database setup
npm run db:generate
npm run db:migrate
npm run db:seed

# 5. Start development server
npm run dev
```

### Development Workflow
```bash
# Code development
npm run dev          # Start with hot reload
npm run lint         # Check code quality
npm run format       # Format code
npm run typecheck    # Type checking

# Testing
npm run test         # Run all tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report

# Database operations
npm run db:studio    # Open Prisma Studio
npm run db:migrate   # Run migrations
npm run db:reset     # Reset database
```

## 🎯 Implementation Priorities

### Critical Path (Must Complete First)
1. **Authentication System** - Core security foundation
2. **User Module** - Basic CRUD operations
3. **Twitter Integration** - OAuth and API integration
4. **Basic Webhook Handling** - Event processing
5. **Simple Feature Extraction** - Username/display name similarity
6. **Rule-based Scoring** - Basic impersonation detection

### Secondary Features
1. **Organization Management** - Multi-tenant support
2. **Advanced Feature Extraction** - Image analysis, metadata
3. **Notification System** - Alert delivery
4. **Analytics Dashboard** - Usage insights
5. **ML-based Scoring** - Advanced detection

### Optional Enhancements
1. **Advanced Analytics** - Detailed reporting
2. **Real-time Dashboard** - Live monitoring
3. **Mobile API** - Mobile app support
4. **Public API** - Third-party integrations

## 📚 Key Libraries and APIs

### Core Dependencies
```json
{
  "twitter-api-v2": "^1.17.0",    // Twitter API integration
  "@prisma/client": "^5.7.0",     // Database ORM
  "bullmq": "^4.15.0",            // Job queues
  "ioredis": "^5.3.2",            // Redis client
  "express": "^4.18.2",           // Web framework
  "winston": "^3.11.0",           // Logging
  "zod": "^3.22.4",               // Validation
  "jsonwebtoken": "^9.0.2"        // JWT authentication
}
```

### Twitter API Integration
```typescript
import { TwitterApi } from 'twitter-api-v2';

const client = new TwitterApi({
  appKey: config.twitter.apiKey,
  appSecret: config.twitter.apiSecret,
  accessToken: config.twitter.accessToken,
  accessSecret: config.twitter.accessTokenSecret,
});
```

### Database Operations
```typescript
import { prisma } from '@/db';

// Example user operations
const user = await prisma.user.create({
  data: { username, xId, accessToken, refreshToken }
});
```

## 🚨 Common Pitfalls to Avoid

### 1. Twitter API Rate Limits
- Always implement proper rate limiting
- Use queues for API calls
- Monitor rate limit headers
- Implement exponential backoff

### 2. Token Management
- Encrypt stored tokens
- Implement token refresh
- Handle token revocation
- Monitor token expiration

### 3. Database Performance
- Use proper indexes
- Implement connection pooling
- Monitor query performance
- Optimize N+1 queries

### 4. Memory Management
- Monitor memory usage
- Implement proper cleanup
- Handle large data sets
- Use streaming for big files

### 5. Error Handling
- Implement comprehensive error handling
- Log errors with context
- Provide meaningful error messages
- Handle network failures gracefully

## 📖 Learning Resources

### Twitter API Documentation
- [Twitter API v2 Documentation](https://developer.twitter.com/en/docs/twitter-api)
- [Account Activity API](https://developer.twitter.com/en/docs/twitter-api/enterprise/account-activity-api/overview)
- [Filtered Stream](https://developer.twitter.com/en/docs/twitter-api/tweets/filtered-stream/introduction)

### Technical Documentation
- [Prisma Documentation](https://www.prisma.io/docs/)
- [BullMQ Documentation](https://docs.bullmq.io/)
- [Express.js Documentation](https://expressjs.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## 🎯 Success Metrics

### Development Milestones
- [ ] User registration and OAuth working
- [ ] Basic tweet ingestion and processing
- [ ] Simple impersonation detection
- [ ] Notification delivery
- [ ] Production deployment
- [ ] 100+ active users
- [ ] < 2% false positive rate
- [ ] 99.9% uptime

### Performance Targets
- API response time: < 200ms (95th percentile)
- Tweet processing: < 5 seconds end-to-end
- Queue processing: < 1000 jobs/minute
- Database queries: < 100ms average
- Memory usage: < 512MB per process

## 🤝 Contributing Guidelines

### Code Standards
- Follow TypeScript strict mode
- Use ESLint configuration provided
- Write comprehensive tests
- Document public APIs
- Follow conventional commits

### Pull Request Process
1. Create feature branch from `main`
2. Implement feature with tests
3. Update documentation
4. Ensure CI passes
5. Request code review
6. Address feedback
7. Merge when approved

### Code Review Checklist
- [ ] Code follows style guidelines
- [ ] Tests cover new functionality
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance impact considered
- [ ] Error handling implemented

## 🎉 Getting Started

**Your next steps:**
1. Review the current codebase structure
2. Set up your development environment
3. Start with Phase 1: User Module completion
4. Implement Twitter OAuth integration
5. Create your first webhook handler
6. Build basic feature extraction
7. Implement rule-based scoring

The foundation is solid, and the path forward is clear. Time to build something amazing! 🚀

---

**Questions?** Check the issues, documentation, or reach out to the development team.
**Ready to contribute?** Start with the high-priority items in Phase 1.