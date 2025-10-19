import { z } from 'zod';

// Twitter OAuth state validation schema
export const twitterOAuthStateSchema = z.object({
  query: z.object({
    state: z.string().optional(),
    redirect: z.string().url().optional(),
  }),
});

// Twitter OAuth callback validation schema
export const twitterCallbackSchema = z.object({
  query: z.object({
    code: z.string().min(1, 'Authorization code is required'),
    state: z.string().optional(),
  }),
  body: z.object({
    codeVerifier: z.string().min(1, 'Code verifier is required'),
  }),
});

// Refresh token validation schema
export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

// User profile update validation schema
export const userUpdateSchema = z.object({
  body: z.object({
    username: z.string().min(1, 'Username is required').max(50, 'Username too long').optional(),
    settings: z.record(z.any()).optional(),
  }),
});

// User settings validation schema
export const userSettingsSchema = z.object({
  body: z.object({
    notifications: z
      .object({
        email: z.boolean().optional(),
        dm: z.boolean().optional(),
        slack: z.boolean().optional(),
        discord: z.boolean().optional(),
        webhook: z.boolean().optional(),
      })
      .optional(),
    privacy: z
      .object({
        profileVisibility: z.enum(['public', 'private']).optional(),
        shareAnalytics: z.boolean().optional(),
      })
      .optional(),
    thresholds: z
      .object({
        low: z.number().min(0).max(1).optional(),
        medium: z.number().min(0).max(1).optional(),
        high: z.number().min(0).max(1).optional(),
      })
      .optional(),
    features: z
      .object({
        autoReply: z.boolean().optional(),
        imageAnalysis: z.boolean().optional(),
        advancedMetrics: z.boolean().optional(),
        mlScoring: z.boolean().optional(),
      })
      .optional(),
    integrations: z
      .object({
        slack: z
          .object({
            webhookUrl: z.string().url().optional(),
            channel: z.string().optional(),
            enabled: z.boolean().optional(),
          })
          .optional(),
        discord: z
          .object({
            webhookUrl: z.string().url().optional(),
            channelId: z.string().optional(),
            enabled: z.boolean().optional(),
          })
          .optional(),
        email: z
          .object({
            address: z.string().email().optional(),
            enabled: z.boolean().optional(),
          })
          .optional(),
      })
      .optional(),
  }),
});

// Event review validation schema
export const eventReviewSchema = z.object({
  params: z.object({
    eventId: z.string().cuid('Invalid event ID'),
  }),
  body: z.object({
    action: z.enum(['ignore', 'queue_review', 'flag_high', 'auto_respond']),
    notes: z.string().max(1000, 'Notes too long').optional(),
    confidence: z.number().min(0).max(1).optional(),
    reviewed: z.boolean().default(true),
  }),
});

// Report creation validation schema
export const reportCreationSchema = z.object({
  body: z.object({
    eventId: z.string().cuid('Invalid event ID'),
    reason: z.enum([
      'lookalike_username',
      'stolen_profile_picture',
      'impersonation_attempt',
      'fake_verification',
      'suspicious_behavior',
      'spam_account',
      'other',
    ]),
    description: z
      .string()
      .min(10, 'Description must be at least 10 characters')
      .max(1000, 'Description too long'),
    evidence: z
      .object({
        screenshots: z.array(z.string().url('Invalid screenshot URL')).optional(),
        tweetUrls: z.array(z.string().url('Invalid tweet URL')).optional(),
        additionalInfo: z.string().max(500).optional(),
      })
      .optional(),
  }),
});

// Pagination validation schema
export const paginationSchema = z.object({
  query: z.object({
    page: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().min(1))
      .default('1'),
    limit: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().min(1).max(100))
      .default('10'),
    sortBy: z.enum(['createdAt', 'updatedAt', 'score', 'username']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    search: z.string().optional(),
  }),
});

// Event filters validation schema
export const eventFiltersSchema = z.object({
  query: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    minScore: z
      .string()
      .transform((val) => parseFloat(val))
      .pipe(z.number().min(0).max(1))
      .optional(),
    maxScore: z
      .string()
      .transform((val) => parseFloat(val))
      .pipe(z.number().min(0).max(1))
      .optional(),
    action: z.enum(['ignore', 'queue_review', 'flag_high', 'auto_respond']).optional(),
    reviewed: z
      .string()
      .transform((val) => val === 'true')
      .pipe(z.boolean())
      .optional(),
    source: z.enum(['webhook', 'stream', 'manual']).optional(),
  }),
});

// Webhook subscription validation schema
export const webhookSubscriptionSchema = z.object({
  body: z.object({
    events: z.array(
      z.enum([
        'user.authenticated',
        'event.detected',
        'event.reviewed',
        'report.created',
        'notification.sent',
        'subscription.updated',
      ])
    ),
    active: z.boolean().default(true),
  }),
});

// Twitter token refresh validation schema
export const twitterTokenRefreshSchema = z.object({
  params: z.object({
    userId: z.string().cuid('Invalid user ID').optional(),
  }),
});

// User deletion validation schema
export const userDeletionSchema = z.object({
  body: z.object({
    confirmation: z.string().refine((val) => val === 'DELETE_MY_ACCOUNT', {
      message: 'Must type "DELETE_MY_ACCOUNT" to confirm deletion',
    }),
    reason: z
      .enum(['not_needed', 'privacy_concerns', 'switching_services', 'technical_issues', 'other'])
      .optional(),
    feedback: z.string().max(500).optional(),
  }),
});

// Notification preferences validation schema
export const notificationPreferencesSchema = z.object({
  body: z.object({
    channels: z.object({
      dm: z.boolean().default(true),
      email: z.boolean().default(false),
      slack: z.boolean().default(false),
      discord: z.boolean().default(false),
      webhook: z.boolean().default(false),
    }),
    frequency: z.enum(['immediate', 'hourly', 'daily', 'weekly']).default('immediate'),
    quietHours: z
      .object({
        enabled: z.boolean().default(false),
        startTime: z
          .string()
          .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
          .optional(),
        endTime: z
          .string()
          .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
          .optional(),
        timezone: z.string().optional(),
      })
      .optional(),
    eventTypes: z.object({
      lowScore: z.boolean().default(false),
      mediumScore: z.boolean().default(true),
      highScore: z.boolean().default(true),
      newReport: z.boolean().default(true),
      systemUpdate: z.boolean().default(false),
    }),
  }),
});

// Analytics query validation schema
export const analyticsQuerySchema = z.object({
  query: z.object({
    period: z.enum(['day', 'week', 'month', 'quarter', 'year']).default('week'),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    metrics: z
      .array(
        z.enum([
          'events_count',
          'high_score_events',
          'reviewed_events',
          'reports_created',
          'response_time',
          'detection_accuracy',
        ])
      )
      .optional(),
    groupBy: z.enum(['day', 'week', 'month']).optional(),
  }),
});

// Bulk action validation schema
export const bulkActionSchema = z.object({
  body: z.object({
    eventIds: z.array(z.string().cuid('Invalid event ID')).min(1).max(100),
    action: z.enum(['ignore', 'queue_review', 'flag_high', 'mark_reviewed']),
    notes: z.string().max(500).optional(),
  }),
});

// Export validation schema
export const exportRequestSchema = z.object({
  body: z.object({
    format: z.enum(['json', 'csv', 'xlsx']).default('json'),
    dateRange: z.object({
      startDate: z.string().datetime(),
      endDate: z.string().datetime(),
    }),
    includeEvents: z.boolean().default(true),
    includeReports: z.boolean().default(true),
    includeSettings: z.boolean().default(false),
  }),
});

// Session management validation schema
export const sessionManagementSchema = z.object({
  params: z.object({
    sessionId: z.string().optional(),
  }),
});

// API key management validation schema (for future use)
export const apiKeyCreationSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'API key name is required').max(100, 'Name too long'),
    permissions: z.array(z.enum(['read', 'write'])).default(['read']),
    expiresAt: z.string().datetime().optional(),
    description: z.string().max(500).optional(),
  }),
});

// Subscription management validation schema
export const subscriptionSchema = z.object({
  body: z.object({
    planId: z.string().cuid('Invalid plan ID'),
    billingCycle: z.enum(['monthly', 'yearly']).default('monthly'),
  }),
});

// Feature flag validation schema
export const featureFlagSchema = z.object({
  body: z.object({
    features: z.record(z.boolean()),
  }),
});

// Common parameter validation schemas
export const userIdParamSchema = z.object({
  params: z.object({
    userId: z.string().cuid('Invalid user ID'),
  }),
});

export const eventIdParamSchema = z.object({
  params: z.object({
    eventId: z.string().cuid('Invalid event ID'),
  }),
});

export const reportIdParamSchema = z.object({
  params: z.object({
    reportId: z.string().cuid('Invalid report ID'),
  }),
});

// Type exports for TypeScript integration
export type TwitterOAuthState = z.infer<typeof twitterOAuthStateSchema>;
export type TwitterCallback = z.infer<typeof twitterCallbackSchema>;
export type RefreshToken = z.infer<typeof refreshTokenSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;
export type UserSettings = z.infer<typeof userSettingsSchema>;
export type EventReview = z.infer<typeof eventReviewSchema>;
export type ReportCreation = z.infer<typeof reportCreationSchema>;
export type Pagination = z.infer<typeof paginationSchema>;
export type EventFilters = z.infer<typeof eventFiltersSchema>;
export type NotificationPreferences = z.infer<typeof notificationPreferencesSchema>;
export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;
export type BulkAction = z.infer<typeof bulkActionSchema>;
export type ExportRequest = z.infer<typeof exportRequestSchema>;
