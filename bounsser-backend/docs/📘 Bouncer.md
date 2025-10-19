## 1. Product Overview

**Bouncer** is a hybrid impersonation-detection bot for X (Twitter) that:

1. **Protects individuals** (personal mode): via OAuth, monitors account mentions/replies/DMs, runs impersonation detection, and alerts owners.
    
2. **Protects organizations/brands** (centralized mode): via filtered-stream rules, monitors replies to official accounts, hashtags, and public mentions.
    

The backend orchestrates monitoring, impersonation scoring, decision logic, and action pipelines with scalability, modularity, and compliance with X’s automation rules.

---

## 2. Core Goals

- **Accuracy & Safety**: Detect impersonators with minimal false positives.
    
- **Hybrid Architecture**: One codebase supports both per-user protection and centralized brand protection.
    
- **Scalability**: Handle 100s → 100k+ accounts/events concurrently.
    
- **Extensibility**: Modular structure for future ML upgrades, additional platforms, or new detection logic.
    
- **Compliance**: Respect X Developer policies and data privacy.
    

---

## 3. High-Level System Architecture

```
                          ┌───────────────────────────┐
                          │  Monitoring Layer         │
                          │   - Account Activity API  │
                          │   - Filtered Stream       │
                          └─────────┬─────────────────┘
                                    │
                ┌───────────────────┴───────────────────┐
                │                                       │
      ┌─────────▼────────┐                    ┌─────────▼─────────┐
      │ OAuth Manager     │                    │ Ingest & Preproc   │
      │ (tokens, refresh) │                    │ (normalize events) │
      └─────────┬────────┘                    └─────────┬─────────┘
                │                                       │
          ┌─────▼─────┐                         ┌───────▼─────────┐
          │ User & Org │                         │ Feature Extract │
          │ Profiles   │                         │ - Text/Image    │
          └─────┬─────┘                         │ - Metadata      │
                │                               └───────┬─────────┘
                │                                       │
         ┌──────▼────────┐                       ┌──────▼──────────┐
         │ Scoring Engine │  <──── Features ─────│ ML/Rule Models   │
         └──────┬────────┘                       └──────┬──────────┘
                │                                       │
         ┌──────▼────────┐                       ┌──────▼──────────┐
         │ Decision Layer │───► DM/Reply/Notify ─► Actions Handler  │
         └──────┬────────┘                       └──────┬──────────┘
                │                                       │
         ┌──────▼──────────┐                   ┌────────▼───────────┐
         │ PostgreSQL (DB) │                   │ Redis (Queue/Cache) │
         └─────────────────┘                   └─────────────────────┘
```

---

## 4. Backend Tech Stack

- **Runtime**: Node.js (TypeScript, ES modules).
    
- **Framework**: Express (or Fastify for performance).
    
- **DB**: PostgreSQL (via Prisma ORM).
    
- **Cache/Queue**: Redis + BullMQ (for async tasks, retries, rate-limit handling).
    
- **API Client**: `twitter-api-v2` (for X API v2 + webhooks).
    
- **Testing**: Jest (unit), Supertest (API/e2e), Playwright (integration).
    
- **Deployment**: Docker + Kubernetes (for scaling), CI/CD with GitHub Actions.
    
- **Logging/Monitoring**: Winston + Prometheus/Grafana (metrics).
    

---

## 5. Directory Structure (Recursive Modular Design)

```
bouncer-backend/
│
├── src/
│   ├── modules/
│   │   ├── user/                 # user accounts, OAuth, tokens
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.model.ts
│   │   │   └── user.routes.ts
│   │   ├── org/                  # organizations / brands
│   │   ├── ingest/               # API ingest (webhooks/streams)
│   │   ├── features/             # feature extraction (text, image, metadata)
│   │   ├── scoring/              # impersonation scoring engine
│   │   ├── decision/             # thresholds + actions
│   │   ├── notifications/        # DMs, Slack, email
│   │   ├── monitoring/           # metrics & observability
│   │   └── shared/               # types, utils, constants
│   │
│   ├── core/
│   │   ├── app.ts                # main Express app
│   │   ├── server.ts             # entry point
│   │   └── config.ts             # env configs
│   │
│   ├── db/
│   │   ├── prisma/               # prisma schema & migrations
│   │   └── index.ts              # prisma client
│   │
│   └── workers/
│       ├── stream.worker.ts      # handle filtered stream events
│       ├── webhook.worker.ts     # handle user webhook events
│       └── scoring.worker.ts     # background scoring
│
├── tests/                        # unit & e2e tests
├── docker/                       # Docker & K8s manifests
├── .github/workflows/            # CI/CD pipelines
├── prisma/schema.prisma           # Prisma schema
└── package.json
```

---

## 6. Core Modules & Responsibilities

### 🔹 `user/`

- Handles OAuth login, token encryption/storage.
    
- Stores settings (thresholds, notifications).
    
- Manages subscriptions (Account Activity API).
    

### 🔹 `org/`

- Handles centralized monitoring for brands.
    
- Defines stream rules for official accounts.
    

### 🔹 `ingest/`

- Webhook handlers for Account Activity API.
    
- Stream listeners for Filtered Stream.
    
- Normalization & enqueue events → Redis.
    

### 🔹 `features/`

- Text similarity (Levenshtein, SBERT embeddings).
    
- Image hashing (pHash/dHash) + CLIP embeddings.
    
- Metadata (account age, verification, follower overlap).
    

### 🔹 `scoring/`

- Rule-based weighted score (MVP).
    
- ML classifier (future).
    
- Returns impersonation confidence.
    

### 🔹 `decision/`

- Applies thresholds → actions (`ignore`, `queue_review`, `flag_high`).
    
- Escalates to notifications.
    

### 🔹 `notifications/`

- DM to account owners.
    
- Slack/email integrations for orgs.
    
- Optional auto-reply.
    

---

## 7. Database Schema (Prisma)

```prisma
// --------------------------------------
// Generator & Datasource
// --------------------------------------
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// --------------------------------------
// Core Models
// --------------------------------------

/// Represents an individual end-user of Bouncer's in personal mode.
/// Each `User` links to their X account via OAuth.
model User {
  id           String       @id @default(cuid())
  xId          String       @unique @map("x_id")     /// Unique X platform ID.
  username     String       @unique                  /// X handle.
  accessToken  String       @map("access_token")
  refreshToken String       @map("refresh_token")
  settings     Json

  createdAt    DateTime     @default(now()) @map("created_at")
  updatedAt    DateTime     @updatedAt @map("updated_at")

  // Relations
  events       Event[]      /// Events where this user is impersonated.
  subscriptions Subscription[] /// User subscriptions
  auditLogs    AuditLog[]
}

/// Represents an organization or brand protected in centralized mode.
/// Organizations can have multiple rules & accounts monitored.
model Org {
  id        String       @id @default(cuid())
  name      String
  xId       String?      @unique @map("x_id") /// Optional main X account.
  rules     Json
  createdAt DateTime     @default(now()) @map("created_at")
  updatedAt DateTime     @updatedAt @map("updated_at")

  // Relations
  events    Event[]
  streamRules StreamRule[]
  subscriptions Subscription[]
  auditLogs AuditLog[]
}

/// Represents any monitored account on X (can be a user, org, or suspect).
model Account {
  id        String   @id @default(cuid())
  xId       String   @unique @map("x_id")
  username  String   @map("username")
  type      String   /// "User", "Org", "Suspect"

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relations
  flags     Flag[]
  eventsAsSuspect Event[] @relation("SuspectAccount")
}

/// A detected event (possible impersonation attempt).
model Event {
  id          String    @id @default(cuid())
  source      String
  suspectId   String    @map("suspect_id")
  targetId    String    @map("target_id")
  targetType  String    @map("target_type")
  tweetId     String?   @map("tweet_id")
  features    Json
  score       Float
  action      String
  reviewed    Boolean   @default(false)
  reviewNotes String?   @map("review_notes")

  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  // Relations
  user        User?     @relation(fields: [targetId], references: [xId], onDelete: Cascade)
  org         Org?      @relation(fields: [targetId], references: [xId], onDelete: Cascade)
  notifications Notification[]
  reports     Report[]
}

/// User/Org report of an impersonation event (manual action).
model Report {
  id        String   @id @default(cuid())
  eventId   String   @map("event_id")
  reporter  String   /// Who reported (userId/orgId/xId)
  reason    String   /// e.g. "lookalike username", "stolen profile picture"
  status    String   /// "pending", "reviewed", "action_taken"

  createdAt DateTime @default(now()) @map("created_at")

  // Relations
  event     Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
}

/// A flag applied to a suspect account (blacklist marker).
model Flag {
  id        String   @id @default(cuid())
  accountId String   @map("account_id")
  type      String   /// e.g. "impersonation", "bot", "suspicious"
  level     Int      /// Severity scale
  reason    String?

  createdAt DateTime @default(now()) @map("created_at")

  // Relations
  account   Account  @relation(fields: [accountId], references: [id], onDelete: Cascade)
}

/// Configurable rule for org stream monitoring.
model StreamRule {
  id        String   @id @default(cuid())
  orgId     String   @map("org_id")
  value     String
  tag       String
  enabled   Boolean  @default(true)

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relations
  org       Org      @relation(fields: [orgId], references: [id], onDelete: Cascade)

  @@unique([orgId, value])
}

/// Notifications triggered by impersonation events.
model Notification {
  id        String    @id @default(cuid())
  eventId   String    @map("event_id")
  type      String
  recipient String
  status    String
  message   String?

  sentAt    DateTime? @map("sent_at")
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")

  // Relations
  event     Event     @relation(fields: [eventId], references: [id], onDelete: Cascade)
}

/// Subscription plans (e.g., Free, Pro, Enterprise).
model Plan {
  id        String   @id @default(cuid())
  name      String   @unique
  price     Float
  features  Json     /// JSON describing included features.

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relations
  subscriptions Subscription[]
}

/// Active subscription by a User or Org.
model Subscription {
  id        String   @id @default(cuid())
  planId    String   @map("plan_id")
  userId    String?  @map("user_id")
  orgId     String?  @map("org_id")
  status    String   /// "active", "expired", "cancelled"

  startedAt DateTime @default(now()) @map("started_at")
  endsAt    DateTime? @map("ends_at")

  // Relations
  plan      Plan     @relation(fields: [planId], references: [id], onDelete: Cascade)
  user      User?    @relation(fields: [userId], references: [id])
  org       Org?     @relation(fields: [orgId], references: [id])
}

/// Immutable logs for security & compliance.
model AuditLog {
  id        String   @id @default(cuid())
  userId    String?  @map("user_id")
  orgId     String?  @map("org_id")
  eventId   String?  @map("event_id")
  action    String
  details   Json?
  ipAddress String?  @map("ip_address")

  createdAt DateTime @default(now()) @map("created_at")

  // Relations
  user      User?    @relation(fields: [userId], references: [id])
  org       Org?     @relation(fields: [orgId], references: [id])
  event     Event?   @relation(fields: [eventId], references: [id])
}
```

---

## 8. Testing Strategy

### Unit Tests

- `features/username.test.ts`: test similarity metrics.
    
- `scoring/engine.test.ts`: test scoring weights.
    
- `decision/thresholds.test.ts`: test threshold actions.
    

### Integration Tests

- Simulate webhook event → ingest → score → decision → notification.
    
- Mock X API calls (twitter-api-v2 stubs).
    

### E2E Tests

- Full OAuth login flow.
    
- End-to-end impersonation detection from suspect tweet → DM.
    

### Tools

- Jest + Supertest for APIs.
    
- Playwright for OAuth/UI flows.
    
- Test containers (Postgres, Redis).
    

---

## 9. CI/CD Workflow (GitHub Actions)

1. **Lint & typecheck** (ESLint + tsc).
    
2. **Run unit & integration tests** on PR.
    
3. **Build Docker image** → push to registry.
    
4. **Run e2e tests** (staging environment).
    
5. **Deploy to prod** via Kubernetes (ArgoCD or Helm).
    

---

## 10. Deployment Strategy

- **Local Dev**: Docker Compose (Node + Postgres + Redis).
    
- **Staging**: Small k8s cluster (1–2 nodes).
    
- **Production**:
    
    - Kubernetes cluster (autoscaling).
        
    - Postgres (managed service e.g., AWS RDS).
        
    - Redis (Elasticache).
        
    - Horizontal scaling workers (BullMQ).
        
    - Load balancer + HTTPS termination.
        
    - Secrets via Vault/KMS.
        

---

## 11. Scalability Plan

- **Sharding**: split worker pools (stream vs webhook vs scoring).
    
- **Caching**: Redis for follower overlap, embeddings.
    
- **Queues**: rate-limit API calls via BullMQ concurrency.
    
- **Microservices** (later): split scoring engine as ML microservice.
    

---

## 12. Roadmap

**Phase 1 (MVP)**

- Rule-based scoring.
    
- Personal account protection.
    
- DM alerts.
    

**Phase 2**

- Centralized org monitoring.
    
- Dashboard for human review.
    
- Configurable thresholds.
    

**Phase 3**

- ML-powered scoring (XGBoost/siamese net).
    
- Slack/Discord integration.
    
- Public auto-reply (conservative rollout).
    

---

✅ This doc sets you up to start coding **Bouncer’s backend from scratch** in a structured, scalable way.

---