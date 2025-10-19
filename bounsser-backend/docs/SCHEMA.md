Modelling the system upfront in Prisma means the bot’s backend will be clean, auditable, and scalable. 

Here is a **complete Prisma schema**, including:

- **Users & Orgs** → capture personal vs. centralised protection modes.
    
- **Accounts** → distinct records of monitored X accounts (suspects/targets).
    
- **Events & Reports** → impersonation detections and user actions.
    
- **Plans & Subscriptions** → SaaS model for monetization.
    
- **Audit logs & Notifications** → for compliance and visibility.
    
- **Flags** → lightweight way to mark accounts as suspicious/fake.
    

---

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

/// Represents an individual end-user of Bouncer in personal mode.
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

### 🔑 Why this schema works

- **Scalable**: separates `User`, `Org`, and `Account` (so suspect accounts don’t clog your user/org tables).
    
- **Flexible**: events are central, linking suspects + targets, with `Reports` for manual reviews and `Flags` for blacklisting.
    
- **SaaS-ready**: `Plan` + `Subscription` allows both individual and enterprise pricing tiers.
    
- **Auditable**: `AuditLog` ensures every action is tracked.
    
- **Actionable**: `Notification` table lets you send auto-replies, Slack alerts, emails, etc.
    

---