import { Router } from 'express';
import rateLimit from 'express-rate-limit';

import { UserController } from './user.controller';
import {
  userUpdateSchema,
  userSettingsSchema,
  eventReviewSchema,
  reportCreationSchema,
  paginationSchema,
  analyticsQuerySchema,
  exportRequestSchema,
  userDeletionSchema,
  twitterTokenRefreshSchema,
} from './user.validation';

import { asyncHandler } from '@/core/middleware/errorHandler';
import { validateRequest } from '@/core/middleware/validation';
import { authMiddleware } from '@/core/middleware/auth';

/**
 * User management routes for the Bouncer backend API.
 *
 * This module handles all user-related endpoints including:
 * - User profile management (view, update, delete)
 * - User settings and preferences
 * - Twitter integration and token management
 * - Webhook subscription management
 * - Event and report management
 * - Analytics and statistics
 * - Notification management
 * - Session management
 * - Data export (GDPR compliance)
 *
 * All routes require authentication and implement appropriate rate limiting.
 *
 * @module UserRoutes
 * @version 1.0.0
 * @since 2024-01-15
 */

const router = Router();
const userController = new UserController();

/**
 * Standard API rate limiter for user endpoints.
 *
 * Allows 100 requests per 15-minute window per authenticated user.
 * This provides reasonable protection against API abuse while allowing
 * normal application usage patterns.
 *
 * @type {import('express-rate-limit').RateLimitRequestHandler}
 * @since 1.0.0
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Standard API rate limit
  message: {
    error: 'Too many API requests',
    message: 'Please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiter for sensitive user operations.
 *
 * Allows only 3 requests per hour for high-security endpoints like
 * account deletion, data export, or bulk operations. This prevents
 * abuse of sensitive user management features.
 *
 * @type {import('express-rate-limit').RateLimitRequestHandler}
 * @since 1.0.0
 */
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Very restrictive for sensitive operations
  message: {
    error: 'Too many attempts',
    message: 'Please try again in 1 hour',
  },
});

// ================================
// Protected User Routes (All require authentication)
// ================================

/**
 * Get current user's profile information.
 *
 * Retrieves complete profile information for the authenticated user,
 * including personal details, account settings, subscription status,
 * and Twitter integration details.
 *
 * @route GET /users/profile
 * @access Private (requires authentication)
 * @returns {Object} Response containing user profile data
 * @returns {boolean} returns.success - Whether the request was successful
 * @returns {Object} returns.data - User profile data
 * @returns {string} returns.data.id - User's unique ID
 * @returns {string} returns.data.xId - User's Twitter/X ID
 * @returns {string} returns.data.username - User's Twitter username
 * @returns {string} returns.data.displayName - User's display name
 * @returns {string} returns.data.email - User's email address
 * @returns {string} returns.data.role - User's role (user/admin)
 * @returns {Object} returns.data.subscription - Subscription details
 * @returns {Object} returns.data.twitterIntegration - Twitter integration status
 * @returns {string} returns.data.createdAt - Account creation timestamp
 * @returns {string} returns.data.updatedAt - Last profile update timestamp
 * @returns {string} returns.message - Success message
 *
 * @example
 * // Request
 * GET /users/profile
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 *
 * // Response
 * {
 *   "success": true,
 *   "data": {
 *     "id": "user_123",
 *     "xId": "1234567890",
 *     "username": "johndoe",
 *     "displayName": "John Doe",
 *     "email": "john@example.com",
 *     "role": "user",
 *     "subscription": {
 *       "plan": "premium",
 *       "status": "active"
 *     },
 *     "twitterIntegration": {
 *       "connected": true,
 *       "lastSync": "2024-01-15T10:30:00Z"
 *     },
 *     "createdAt": "2024-01-01T00:00:00Z",
 *     "updatedAt": "2024-01-15T10:30:00Z"
 *   },
 *   "message": "Profile retrieved successfully"
 * }
 *
 * @throws {AuthenticationError} When user is not authenticated
 * @throws {NotFoundError} When user profile is not found
 * @since 1.0.0
 */
router.get(
  '/profile',
  authMiddleware,
  apiLimiter,
  asyncHandler(userController.getProfile.bind(userController))
);

/**
 * Update current user's profile information.
 *
 * Updates the authenticated user's profile with the provided data.
 * Only the fields included in the request body will be updated.
 * Certain fields like user ID and Twitter ID cannot be modified.
 *
 * @route PUT /users/profile
 * @access Private (requires authentication)
 * @param {Object} body - Updated profile data
 * @param {string} [body.displayName] - Updated display name
 * @param {string} [body.email] - Updated email address
 * @param {Object} [body.preferences] - User preferences object
 * @param {Object} [body.notificationSettings] - Notification settings
 * @returns {Object} Response containing updated profile data
 * @returns {boolean} returns.success - Whether the update was successful
 * @returns {Object} returns.data - Updated user profile data
 * @returns {string} returns.message - Success message
 *
 * @example
 * // Request
 * PUT /users/profile
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 * {
 *   "displayName": "John Smith",
 *   "email": "john.smith@example.com",
 *   "preferences": {
 *     "theme": "dark",
 *     "language": "en"
 *   }
 * }
 *
 * // Response
 * {
 *   "success": true,
 *   "data": {
 *     "id": "user_123",
 *     "displayName": "John Smith",
 *     "email": "john.smith@example.com",
 *     "updatedAt": "2024-01-15T11:00:00Z"
 *   },
 *   "message": "Profile updated successfully"
 * }
 *
 * @throws {ValidationError} When request body contains invalid data
 * @throws {ConflictError} When email is already in use
 * @since 1.0.0
 */
router.put(
  '/profile',
  authMiddleware,
  apiLimiter,
  validateRequest({ body: userUpdateSchema.shape.body }),
  asyncHandler(userController.updateProfile.bind(userController))
);

/**
 * Delete current user's account permanently.
 *
 * Permanently deletes the authenticated user's account and all associated data.
 * This action is irreversible and requires explicit confirmation.
 * All user data, events, reports, and settings will be permanently removed.
 *
 * @route DELETE /users/profile
 * @access Private (requires authentication, strict rate limited)
 * @param {Object} body - Account deletion confirmation
 * @param {string} body.confirmation - Must be "DELETE_MY_ACCOUNT"
 * @param {string} [body.reason] - Optional reason for account deletion
 * @returns {Object} Response confirming account deletion
 * @returns {boolean} returns.success - Whether deletion was successful
 * @returns {string} returns.message - Deletion confirmation message
 *
 * @example
 * // Request
 * DELETE /users/profile
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 * {
 *   "confirmation": "DELETE_MY_ACCOUNT",
 *   "reason": "No longer using the service"
 * }
 *
 * // Response
 * {
 *   "success": true,
 *   "message": "Account deleted successfully"
 * }
 *
 * @throws {ValidationError} When confirmation text is incorrect
 * @throws {AuthenticationError} When user is not authenticated
 * @since 1.0.0
 */
router.delete(
  '/profile',
  authMiddleware,
  strictLimiter,
  validateRequest({ body: userDeletionSchema.shape.body }),
  asyncHandler(userController.deleteAccount.bind(userController))
);

/**
 * Get current user's settings and preferences.
 *
 * Retrieves all user settings including notification preferences,
 * privacy settings, monitoring configurations, and system preferences.
 *
 * @route GET /users/settings
 * @access Private (requires authentication)
 * @returns {Object} Response containing user settings
 * @returns {boolean} returns.success - Whether the request was successful
 * @returns {Object} returns.data - User settings data
 * @returns {Object} returns.data.notifications - Notification preferences
 * @returns {Object} returns.data.privacy - Privacy settings
 * @returns {Object} returns.data.monitoring - Monitoring configurations
 * @returns {Object} returns.data.ui - UI preferences
 * @returns {string} returns.message - Success message
 *
 * @example
 * // Response
 * {
 *   "success": true,
 *   "data": {
 *     "notifications": {
 *       "email": true,
 *       "impersonationAlerts": true,
 *       "weeklyReports": false
 *     },
 *     "privacy": {
 *       "profileVisibility": "private",
 *       "dataSharing": false
 *     },
 *     "monitoring": {
 *       "autoDetection": true,
 *       "sensitivityLevel": "medium"
 *     },
 *     "ui": {
 *       "theme": "dark",
 *       "language": "en"
 *     }
 *   },
 *   "message": "Settings retrieved successfully"
 * }
 *
 * @since 1.0.0
 */
router.get(
  '/settings',
  authMiddleware,
  apiLimiter,
  asyncHandler(userController.getSettings.bind(userController))
);

/**
 * Update current user's settings and preferences.
 *
 * Updates user settings with the provided configuration. Only the
 * settings included in the request body will be updated, allowing
 * for partial updates of specific setting categories.
 *
 * @route PUT /users/settings
 * @access Private (requires authentication)
 * @param {Object} body - Settings update data
 * @param {Object} [body.notifications] - Notification preferences
 * @param {Object} [body.privacy] - Privacy settings
 * @param {Object} [body.monitoring] - Monitoring configurations
 * @param {Object} [body.ui] - UI preferences
 * @returns {Object} Response containing updated settings
 * @returns {boolean} returns.success - Whether the update was successful
 * @returns {Object} returns.data - Updated settings data
 * @returns {string} returns.message - Success message
 *
 * @example
 * // Request
 * PUT /users/settings
 * {
 *   "notifications": {
 *     "email": false,
 *     "impersonationAlerts": true
 *   },
 *   "ui": {
 *     "theme": "light"
 *   }
 * }
 *
 * @throws {ValidationError} When settings data is invalid
 * @since 1.0.0
 */
router.put(
  '/settings',
  authMiddleware,
  apiLimiter,
  validateRequest({ body: userSettingsSchema.shape.body }),
  asyncHandler(userController.updateSettings.bind(userController))
);

/**
 * Get user's Twitter profile information.
 *
 * Retrieves the user's Twitter profile data from the connected Twitter account,
 * including public profile information and integration status.
 *
 * @route GET /users/twitter/profile
 * @access Private (requires authentication)
 * @returns {Object} Response containing Twitter profile data
 * @returns {boolean} returns.success - Whether the request was successful
 * @returns {Object} returns.data - Twitter profile data
 * @returns {string} returns.data.xId - Twitter user ID
 * @returns {string} returns.data.username - Twitter username
 * @returns {string} returns.data.displayName - Twitter display name
 * @returns {string} returns.data.profileImageUrl - Profile image URL
 * @returns {number} returns.data.followersCount - Number of followers
 * @returns {number} returns.data.followingCount - Number of following
 * @returns {boolean} returns.data.verified - Twitter verification status
 * @returns {string} returns.data.lastSync - Last synchronization timestamp
 * @returns {string} returns.message - Success message
 *
 * @throws {AuthenticationError} When Twitter account is not connected
 * @throws {ExternalServiceError} When Twitter API is unavailable
 * @since 1.0.0
 */
router.get(
  '/twitter/profile',
  authMiddleware,
  apiLimiter,
  asyncHandler(userController.getTwitterProfile.bind(userController))
);

/**
 * Refresh user's Twitter API tokens.
 *
 * Refreshes the user's Twitter API access tokens to maintain connectivity
 * with their Twitter account. This is necessary when tokens expire or
 * when enhanced permissions are required.
 *
 * @route POST /users/twitter/refresh
 * @access Private (requires authentication)
 * @returns {Object} Response containing token refresh status
 * @returns {boolean} returns.success - Whether token refresh was successful
 * @returns {Object} returns.data - Token refresh data
 * @returns {string} returns.data.status - Refresh status
 * @returns {string} returns.data.lastRefresh - Last refresh timestamp
 * @returns {string} returns.message - Success message
 *
 * @throws {AuthenticationError} When Twitter account is not connected
 * @throws {ExternalServiceError} When Twitter token refresh fails
 * @since 1.0.0
 */
router.post(
  '/twitter/refresh',
  authMiddleware,
  apiLimiter,
  validateRequest({ params: twitterTokenRefreshSchema.shape.params }),
  asyncHandler(userController.refreshTwitterToken.bind(userController))
);

/**
 * Disconnect user's Twitter account integration.
 *
 * Permanently disconnects the user's Twitter account from Bouncer,
 * removing all stored Twitter tokens and disabling Twitter-based
 * monitoring and detection features.
 *
 * @route DELETE /users/twitter/disconnect
 * @access Private (requires authentication, strict rate limited)
 * @returns {Object} Response confirming Twitter disconnection
 * @returns {boolean} returns.success - Whether disconnection was successful
 * @returns {string} returns.message - Disconnection confirmation message
 *
 * @example
 * // Response
 * {
 *   "success": true,
 *   "message": "Twitter account disconnected successfully"
 * }
 *
 * @throws {AuthenticationError} When Twitter account is not connected
 * @since 1.0.0
 */
router.delete(
  '/twitter/disconnect',
  authMiddleware,
  strictLimiter,
  asyncHandler(userController.disconnectTwitter.bind(userController))
);

/**
 * Subscribe to Twitter webhook notifications.
 *
 * Subscribes the user to receive real-time Twitter webhook notifications
 * for their account activity, enabling immediate impersonation detection
 * and monitoring.
 *
 * @route POST /users/twitter/webhook/subscribe
 * @access Private (requires authentication)
 * @returns {Object} Response containing subscription status
 * @returns {boolean} returns.success - Whether subscription was successful
 * @returns {Object} returns.data - Subscription data
 * @returns {string} returns.data.webhookId - Webhook subscription ID
 * @returns {string} returns.data.status - Subscription status
 * @returns {string} returns.data.subscribedAt - Subscription timestamp
 * @returns {string} returns.message - Success message
 *
 * @throws {ConflictError} When already subscribed to webhooks
 * @throws {ExternalServiceError} When Twitter webhook setup fails
 * @since 1.0.0
 */
router.post(
  '/twitter/webhook/subscribe',
  authMiddleware,
  apiLimiter,
  asyncHandler(userController.subscribeToWebhook.bind(userController))
);

/**
 * Unsubscribe from Twitter webhook notifications.
 *
 * Removes the user's subscription to Twitter webhook notifications,
 * disabling real-time monitoring and switching to polling-based
 * detection methods.
 *
 * @route DELETE /users/twitter/webhook/unsubscribe
 * @access Private (requires authentication)
 * @returns {Object} Response confirming webhook unsubscription
 * @returns {boolean} returns.success - Whether unsubscription was successful
 * @returns {string} returns.message - Unsubscription confirmation message
 *
 * @throws {NotFoundError} When no active webhook subscription exists
 * @since 1.0.0
 */
router.delete(
  '/twitter/webhook/unsubscribe',
  authMiddleware,
  apiLimiter,
  asyncHandler(userController.unsubscribeFromWebhook.bind(userController))
);

/**
 * Get Twitter webhook subscription status.
 *
 * Retrieves the current status of the user's Twitter webhook subscription,
 * including subscription details and health information.
 *
 * @route GET /users/twitter/webhook/status
 * @access Private (requires authentication)
 * @returns {Object} Response containing webhook status
 * @returns {boolean} returns.success - Whether the request was successful
 * @returns {Object} returns.data - Webhook status data
 * @returns {boolean} returns.data.subscribed - Whether user is subscribed
 * @returns {string} [returns.data.webhookId] - Webhook subscription ID
 * @returns {string} [returns.data.status] - Subscription status
 * @returns {string} [returns.data.lastActivity] - Last webhook activity
 * @returns {number} [returns.data.eventsReceived] - Total events received
 * @returns {string} returns.message - Status message
 *
 * @since 1.0.0
 */
router.get(
  '/twitter/webhook/status',
  authMiddleware,
  apiLimiter,
  asyncHandler(userController.getWebhookStatus.bind(userController))
);

/**
 * Get user's impersonation detection events.
 *
 * Retrieves a paginated list of impersonation detection events for the
 * authenticated user, including both confirmed and potential impersonations.
 *
 * @route GET /users/events
 * @access Private (requires authentication)
 * @param {Object} [query] - Query parameters for pagination and filtering
 * @param {number} [query.page=1] - Page number for pagination
 * @param {number} [query.limit=20] - Number of events per page
 * @param {string} [query.status] - Filter by event status (pending, confirmed, dismissed)
 * @param {string} [query.dateFrom] - Filter events from this date (ISO string)
 * @param {string} [query.dateTo] - Filter events to this date (ISO string)
 * @returns {Object} Response containing events and pagination info
 * @returns {boolean} returns.success - Whether the request was successful
 * @returns {Object} returns.data - Events data
 * @returns {Array} returns.data.events - Array of event objects
 * @returns {Object} returns.data.pagination - Pagination information
 * @returns {number} returns.data.pagination.page - Current page number
 * @returns {number} returns.data.pagination.limit - Events per page
 * @returns {number} returns.data.pagination.total - Total number of events
 * @returns {number} returns.data.pagination.pages - Total number of pages
 * @returns {string} returns.message - Success message
 *
 * @example
 * // Request
 * GET /users/events?page=1&limit=10&status=pending
 *
 * // Response
 * {
 *   "success": true,
 *   "data": {
 *     "events": [
 *       {
 *         "id": "event_123",
 *         "type": "impersonation_detected",
 *         "status": "pending",
 *         "suspiciousAccount": {
 *           "username": "john_doe_fake",
 *           "profileSimilarity": 0.85
 *         },
 *         "detectedAt": "2024-01-15T10:30:00Z"
 *       }
 *     ],
 *     "pagination": {
 *       "page": 1,
 *       "limit": 10,
 *       "total": 25,
 *       "pages": 3
 *     }
 *   },
 *   "message": "Events retrieved successfully"
 * }
 *
 * @throws {ValidationError} When query parameters are invalid
 * @since 1.0.0
 */
router.get(
  '/events',
  authMiddleware,
  apiLimiter,
  validateRequest({ query: paginationSchema.shape.query }),
  asyncHandler(userController.getUserEvents.bind(userController))
);

/**
 * Get detailed information about a specific event.
 *
 * Retrieves comprehensive details about a specific impersonation detection
 * event, including analysis results, evidence, and current status.
 *
 * @route GET /users/events/:eventId
 * @access Private (requires authentication)
 * @param {Object} params - Route parameters
 * @param {string} params.eventId - Unique event identifier
 * @returns {Object} Response containing detailed event information
 * @returns {boolean} returns.success - Whether the request was successful
 * @returns {Object} returns.data - Detailed event data
 * @returns {string} returns.data.id - Event unique identifier
 * @returns {string} returns.data.type - Event type
 * @returns {string} returns.data.status - Current event status
 * @returns {Object} returns.data.suspiciousAccount - Suspicious account details
 * @returns {Object} returns.data.analysis - Detection analysis results
 * @returns {Array} returns.data.evidence - Evidence supporting the detection
 * @returns {string} returns.data.detectedAt - Detection timestamp
 * @returns {string} [returns.data.reviewedAt] - Review timestamp if reviewed
 * @returns {string} returns.message - Success message
 *
 * @example
 * // Response
 * {
 *   "success": true,
 *   "data": {
 *     "id": "event_123",
 *     "type": "impersonation_detected",
 *     "status": "pending",
 *     "suspiciousAccount": {
 *       "username": "john_doe_fake",
 *       "displayName": "John Doe",
 *       "profileImageUrl": "https://...",
 *       "profileSimilarity": 0.85
 *     },
 *     "analysis": {
 *       "textSimilarity": 0.92,
 *       "imageSimilarity": 0.78,
 *       "behaviorScore": 0.65,
 *       "riskLevel": "high"
 *     },
 *     "evidence": [
 *       {
 *         "type": "profile_text",
 *         "similarity": 0.92,
 *         "description": "Bio text matches 92% with original"
 *       }
 *     ],
 *     "detectedAt": "2024-01-15T10:30:00Z"
 *   },
 *   "message": "Event details retrieved successfully"
 * }
 *
 * @throws {NotFoundError} When event is not found or doesn't belong to user
 * @since 1.0.0
 */
router.get(
  '/events/:eventId',
  authMiddleware,
  apiLimiter,
  asyncHandler(userController.getEventDetails.bind(userController))
);

/**
 * Review and update the status of an impersonation event.
 *
 * Allows the user to review an impersonation detection event and mark it
 * as confirmed (true positive) or dismissed (false positive). This feedback
 * helps improve the detection algorithm accuracy.
 *
 * @route PATCH /users/events/:eventId/review
 * @access Private (requires authentication)
 * @param {Object} params - Route parameters
 * @param {string} params.eventId - Unique event identifier
 * @param {Object} body - Review data
 * @param {string} body.status - New event status ('confirmed' or 'dismissed')
 * @param {string} [body.feedback] - Optional feedback about the event
 * @param {Array} [body.actions] - Actions taken by user (e.g., ['reported', 'blocked'])
 * @returns {Object} Response containing updated event information
 * @returns {boolean} returns.success - Whether the review was successful
 * @returns {Object} returns.data - Updated event data
 * @returns {string} returns.data.id - Event unique identifier
 * @returns {string} returns.data.status - Updated event status
 * @returns {string} returns.data.reviewedAt - Review timestamp
 * @returns {string} returns.message - Success message
 *
 * @example
 * // Request
 * PATCH /users/events/event_123/review
 * {
 *   "status": "confirmed",
 *   "feedback": "Definitely an impersonation attempt",
 *   "actions": ["reported", "blocked"]
 * }
 *
 * // Response
 * {
 *   "success": true,
 *   "data": {
 *     "id": "event_123",
 *     "status": "confirmed",
 *     "reviewedAt": "2024-01-15T11:00:00Z"
 *   },
 *   "message": "Event reviewed successfully"
 * }
 *
 * @throws {ValidationError} When review data is invalid
 * @throws {NotFoundError} When event is not found
 * @throws {ConflictError} When event has already been reviewed
 * @since 1.0.0
 */
router.patch(
  '/events/:eventId/review',
  authMiddleware,
  apiLimiter,
  validateRequest({ params: eventReviewSchema.shape.params, body: eventReviewSchema.shape.body }),
  asyncHandler(userController.reviewEvent.bind(userController))
);

/**
 * Create a new impersonation report.
 *
 * Allows the user to manually report a suspected impersonation account
 * that may not have been automatically detected by the system.
 *
 * @route POST /users/reports
 * @access Private (requires authentication)
 * @param {Object} body - Report data
 * @param {string} body.suspiciousUsername - Username of suspected impersonator
 * @param {string} body.reason - Reason for reporting
 * @param {string} [body.description] - Detailed description of the impersonation
 * @param {Array} [body.evidence] - URLs or descriptions of evidence
 * @param {string} [body.priority] - Priority level ('low', 'medium', 'high')
 * @returns {Object} Response containing created report information
 * @returns {boolean} returns.success - Whether the report was created successfully
 * @returns {Object} returns.data - Created report data
 * @returns {string} returns.data.id - Report unique identifier
 * @returns {string} returns.data.status - Report status
 * @returns {string} returns.data.createdAt - Report creation timestamp
 * @returns {string} returns.message - Success message
 *
 * @example
 * // Request
 * POST /users/reports
 * {
 *   "suspiciousUsername": "fake_john_doe",
 *   "reason": "profile_impersonation",
 *   "description": "This account is using my profile picture and bio",
 *   "evidence": ["https://twitter.com/fake_john_doe"],
 *   "priority": "high"
 * }
 *
 * // Response
 * {
 *   "success": true,
 *   "data": {
 *     "id": "report_456",
 *     "status": "submitted",
 *     "createdAt": "2024-01-15T11:30:00Z"
 *   },
 *   "message": "Report created successfully"
 * }
 *
 * @throws {ValidationError} When report data is invalid
 * @throws {ConflictError} When a report for this account already exists
 * @since 1.0.0
 */
router.post(
  '/reports',
  authMiddleware,
  apiLimiter,
  validateRequest({ body: reportCreationSchema.shape.body }),
  asyncHandler(userController.createReport.bind(userController))
);

/**
 * Get user's submitted impersonation reports.
 *
 * Retrieves a paginated list of impersonation reports submitted by the
 * authenticated user, including their current status and resolution.
 *
 * @route GET /users/reports
 * @access Private (requires authentication)
 * @param {Object} [query] - Query parameters for pagination
 * @param {number} [query.page=1] - Page number for pagination
 * @param {number} [query.limit=20] - Number of reports per page
 * @param {string} [query.status] - Filter by report status
 * @returns {Object} Response containing reports and pagination info
 * @returns {boolean} returns.success - Whether the request was successful
 * @returns {Object} returns.data - Reports data
 * @returns {Array} returns.data.reports - Array of report objects
 * @returns {Object} returns.data.pagination - Pagination information
 * @returns {string} returns.message - Success message
 *
 * @example
 * // Response
 * {
 *   "success": true,
 *   "data": {
 *     "reports": [
 *       {
 *         "id": "report_456",
 *         "suspiciousUsername": "fake_john_doe",
 *         "reason": "profile_impersonation",
 *         "status": "under_review",
 *         "priority": "high",
 *         "createdAt": "2024-01-15T11:30:00Z",
 *         "updatedAt": "2024-01-15T12:00:00Z"
 *       }
 *     ],
 *     "pagination": {
 *       "page": 1,
 *       "limit": 20,
 *       "total": 5,
 *       "pages": 1
 *     }
 *   },
 *   "message": "Reports retrieved successfully"
 * }
 *
 * @since 1.0.0
 */
router.get(
  '/reports',
  authMiddleware,
  apiLimiter,
  validateRequest({ query: paginationSchema.shape.query }),
  asyncHandler(userController.getUserReports.bind(userController))
);

/**
 * Get user's account statistics and summary.
 *
 * Retrieves comprehensive statistics about the user's account including
 * detection counts, report statistics, and account health metrics.
 *
 * @route GET /users/stats
 * @access Private (requires authentication)
 * @returns {Object} Response containing user statistics
 * @returns {boolean} returns.success - Whether the request was successful
 * @returns {Object} returns.data - User statistics data
 * @returns {Object} returns.data.events - Event statistics
 * @returns {number} returns.data.events.total - Total events detected
 * @returns {number} returns.data.events.confirmed - Confirmed impersonations
 * @returns {number} returns.data.events.dismissed - Dismissed false positives
 * @returns {number} returns.data.events.pending - Events awaiting review
 * @returns {Object} returns.data.reports - Report statistics
 * @returns {number} returns.data.reports.submitted - Reports submitted by user
 * @returns {number} returns.data.reports.resolved - Resolved reports
 * @returns {Object} returns.data.protection - Protection metrics
 * @returns {number} returns.data.protection.threatsBlocked - Total threats blocked
 * @returns {string} returns.data.protection.lastScan - Last account scan timestamp
 * @returns {string} returns.message - Success message
 *
 * @example
 * // Response
 * {
 *   "success": true,
 *   "data": {
 *     "events": {
 *       "total": 15,
 *       "confirmed": 8,
 *       "dismissed": 5,
 *       "pending": 2
 *     },
 *     "reports": {
 *       "submitted": 3,
 *       "resolved": 2
 *     },
 *     "protection": {
 *       "threatsBlocked": 8,
 *       "lastScan": "2024-01-15T10:00:00Z"
 *     }
 *   },
 *   "message": "Statistics retrieved successfully"
 * }
 *
 * @since 1.0.0
 */
router.get(
  '/stats',
  authMiddleware,
  apiLimiter,
  asyncHandler(userController.getUserStats.bind(userController))
);

/**
 * Get detailed user analytics and trends.
 *
 * Retrieves detailed analytics data including time-series data for
 * impersonation detection trends, threat analysis, and protection metrics.
 *
 * @route GET /users/analytics
 * @access Private (requires authentication)
 * @param {Object} [query] - Query parameters for analytics
 * @param {string} [query.period='30d'] - Time period ('7d', '30d', '90d', '1y')
 * @param {string} [query.metric] - Specific metric to retrieve
 * @param {string} [query.granularity='day'] - Data granularity ('hour', 'day', 'week', 'month')
 * @returns {Object} Response containing analytics data
 * @returns {boolean} returns.success - Whether the request was successful
 * @returns {Object} returns.data - Analytics data
 * @returns {Object} returns.data.summary - Summary statistics for the period
 * @returns {Array} returns.data.timeSeries - Time-series data points
 * @returns {Object} returns.data.trends - Trend analysis
 * @returns {Array} returns.data.topThreats - Most common threat types
 * @returns {string} returns.message - Success message
 *
 * @example
 * // Request
 * GET /users/analytics?period=30d&granularity=day
 *
 * // Response
 * {
 *   "success": true,
 *   "data": {
 *     "summary": {
 *       "totalEvents": 25,
 *       "averagePerDay": 0.83,
 *       "threatReduction": 0.15
 *     },
 *     "timeSeries": [
 *       {
 *         "date": "2024-01-01",
 *         "events": 2,
 *         "confirmed": 1
 *       }
 *     ],
 *     "trends": {
 *       "direction": "decreasing",
 *       "changePercent": -15.2
 *     },
 *     "topThreats": [
 *       {
 *         "type": "profile_impersonation",
 *         "count": 12,
 *         "percentage": 48
 *       }
 *     ]
 *   },
 *   "message": "Analytics retrieved successfully"
 * }
 *
 * @throws {ValidationError} When query parameters are invalid
 * @since 1.0.0
 */
router.get(
  '/analytics',
  authMiddleware,
  apiLimiter,
  validateRequest({ query: analyticsQuerySchema.shape.query }),
  asyncHandler(userController.getUserAnalytics.bind(userController))
);

/**
 * Get user's notifications.
 *
 * Retrieves a paginated list of notifications for the authenticated user,
 * including system messages, detection alerts, and status updates.
 *
 * @route GET /users/notifications
 * @access Private (requires authentication)
 * @param {Object} [query] - Query parameters for pagination and filtering
 * @param {number} [query.page=1] - Page number for pagination
 * @param {number} [query.limit=20] - Number of notifications per page
 * @param {boolean} [query.unreadOnly=false] - Show only unread notifications
 * @returns {Object} Response containing notifications and pagination info
 * @returns {boolean} returns.success - Whether the request was successful
 * @returns {Object} returns.data - Notifications data
 * @returns {Array} returns.data.notifications - Array of notification objects
 * @returns {Object} returns.data.pagination - Pagination information
 * @returns {number} returns.data.unreadCount - Total unread notifications
 * @returns {string} returns.message - Success message
 *
 * @example
 * // Response
 * {
 *   "success": true,
 *   "data": {
 *     "notifications": [
 *       {
 *         "id": "notif_123",
 *         "type": "impersonation_detected",
 *         "title": "New impersonation detected",
 *         "message": "A suspicious account matching your profile has been detected",
 *         "read": false,
 *         "createdAt": "2024-01-15T10:30:00Z"
 *       }
 *     ],
 *     "pagination": {
 *       "page": 1,
 *       "limit": 20,
 *       "total": 10,
 *       "pages": 1
 *     },
 *     "unreadCount": 3
 *   },
 *   "message": "Notifications retrieved successfully"
 * }
 *
 * @since 1.0.0
 */
router.get(
  '/notifications',
  authMiddleware,
  apiLimiter,
  validateRequest({ query: paginationSchema.shape.query }),
  asyncHandler(userController.getNotifications.bind(userController))
);

/**
 * Mark a specific notification as read.
 *
 * Marks the specified notification as read for the authenticated user.
 * This helps track which notifications the user has already seen.
 *
 * @route PATCH /users/notifications/:notificationId/read
 * @access Private (requires authentication)
 * @param {Object} params - Route parameters
 * @param {string} params.notificationId - Unique notification identifier
 * @returns {Object} Response confirming notification was marked as read
 * @returns {boolean} returns.success - Whether the operation was successful
 * @returns {Object} returns.data - Updated notification data
 * @returns {string} returns.data.id - Notification unique identifier
 * @returns {boolean} returns.data.read - Notification read status (true)
 * @returns {string} returns.data.readAt - Timestamp when marked as read
 * @returns {string} returns.message - Success message
 *
 * @example
 * // Request
 * PATCH /users/notifications/notif_123/read
 *
 * // Response
 * {
 *   "success": true,
 *   "data": {
 *     "id": "notif_123",
 *     "read": true,
 *     "readAt": "2024-01-15T11:45:00Z"
 *   },
 *   "message": "Notification marked as read"
 * }
 *
 * @throws {NotFoundError} When notification is not found or doesn't belong to user
 * @since 1.0.0
 */
router.patch(
  '/notifications/:notificationId/read',
  authMiddleware,
  apiLimiter,
  asyncHandler(userController.markNotificationAsRead.bind(userController))
);

/**
 * Mark all notifications as read.
 *
 * Marks all unread notifications as read for the authenticated user.
 * This is useful for bulk operations when the user wants to clear
 * all notification indicators.
 *
 * @route PATCH /users/notifications/read-all
 * @access Private (requires authentication)
 * @returns {Object} Response confirming all notifications were marked as read
 * @returns {boolean} returns.success - Whether the operation was successful
 * @returns {Object} returns.data - Operation result data
 * @returns {number} returns.data.updatedCount - Number of notifications marked as read
 * @returns {string} returns.data.updatedAt - Timestamp when operation completed
 * @returns {string} returns.message - Success message
 *
 * @example
 * // Request
 * PATCH /users/notifications/read-all
 *
 * // Response
 * {
 *   "success": true,
 *   "data": {
 *     "updatedCount": 5,
 *     "updatedAt": "2024-01-15T11:45:00Z"
 *   },
 *   "message": "All notifications marked as read"
 * }
 *
 * @since 1.0.0
 */
router.patch(
  '/notifications/read-all',
  authMiddleware,
  apiLimiter,
  asyncHandler(userController.markAllNotificationsAsRead.bind(userController))
);

/**
 * Get user's active sessions.
 *
 * Retrieves a list of all active sessions for the authenticated user,
 * including session details, device information, and last activity.
 *
 * @route GET /users/sessions
 * @access Private (requires authentication)
 * @returns {Object} Response containing active sessions
 * @returns {boolean} returns.success - Whether the request was successful
 * @returns {Object} returns.data - Sessions data
 * @returns {Array} returns.data.sessions - Array of active session objects
 * @returns {string} returns.data.currentSessionId - Current session identifier
 * @returns {string} returns.message - Success message
 *
 * @example
 * // Response
 * {
 *   "success": true,
 *   "data": {
 *     "sessions": [
 *       {
 *         "id": "session_123",
 *         "deviceType": "desktop",
 *         "browser": "Chrome 120.0.0",
 *         "os": "Windows 11",
 *         "ipAddress": "192.168.1.100",
 *         "location": "New York, NY",
 *         "createdAt": "2024-01-15T09:00:00Z",
 *         "lastActivity": "2024-01-15T11:30:00Z",
 *         "current": true
 *       }
 *     ],
 *     "currentSessionId": "session_123"
 *   },
 *   "message": "Sessions retrieved successfully"
 * }
 *
 * @since 1.0.0
 */
router.get(
  '/sessions',
  authMiddleware,
  apiLimiter,
  asyncHandler(userController.getUserSessions.bind(userController))
);

/**
 * Revoke a specific user session.
 *
 * Revokes (logs out) a specific session for the authenticated user.
 * This is useful for logging out from other devices or browsers.
 * The current session cannot be revoked using this endpoint.
 *
 * @route DELETE /users/sessions/:sessionId
 * @access Private (requires authentication)
 * @param {Object} params - Route parameters
 * @param {string} params.sessionId - Unique session identifier to revoke
 * @returns {Object} Response confirming session revocation
 * @returns {boolean} returns.success - Whether the revocation was successful
 * @returns {Object} returns.data - Revocation result data
 * @returns {string} returns.data.sessionId - Revoked session identifier
 * @returns {string} returns.data.revokedAt - Revocation timestamp
 * @returns {string} returns.message - Success message
 *
 * @example
 * // Request
 * DELETE /users/sessions/session_456
 *
 * // Response
 * {
 *   "success": true,
 *   "data": {
 *     "sessionId": "session_456",
 *     "revokedAt": "2024-01-15T12:00:00Z"
 *   },
 *   "message": "Session revoked successfully"
 * }
 *
 * @throws {NotFoundError} When session is not found or doesn't belong to user
 * @throws {ConflictError} When trying to revoke the current session
 * @since 1.0.0
 */
router.delete(
  '/sessions/:sessionId',
  authMiddleware,
  apiLimiter,
  asyncHandler(userController.revokeSession.bind(userController))
);

/**
 * Revoke all user sessions except the current one.
 *
 * Revokes all active sessions for the authenticated user except the current
 * session. This is useful for security purposes when the user suspects
 * unauthorized access to their account.
 *
 * @route DELETE /users/sessions
 * @access Private (requires authentication, strict rate limited)
 * @returns {Object} Response confirming session revocation
 * @returns {boolean} returns.success - Whether the revocation was successful
 * @returns {Object} returns.data - Revocation result data
 * @returns {number} returns.data.revokedCount - Number of sessions revoked
 * @returns {string} returns.data.revokedAt - Revocation timestamp
 * @returns {string} returns.message - Success message
 *
 * @example
 * // Request
 * DELETE /users/sessions
 *
 * // Response
 * {
 *   "success": true,
 *   "data": {
 *     "revokedCount": 3,
 *     "revokedAt": "2024-01-15T12:00:00Z"
 *   },
 *   "message": "All other sessions revoked successfully"
 * }
 *
 * @since 1.0.0
 */
router.delete(
  '/sessions',
  authMiddleware,
  strictLimiter,
  asyncHandler(userController.revokeAllSessions.bind(userController))
);

/**
 * Request user data export for GDPR compliance.
 *
 * Initiates the process of exporting all user data in a portable format.
 * This endpoint complies with GDPR Article 20 (Right to data portability).
 * The export process is asynchronous and the user will be notified when ready.
 *
 * @route POST /users/export
 * @access Private (requires authentication, strict rate limited)
 * @param {Object} body - Export request data
 * @param {Array} body.dataTypes - Types of data to export (e.g., ['profile', 'events', 'reports'])
 * @param {string} body.format - Export format ('json' or 'csv')
 * @param {boolean} [body.includeDeleted=false] - Include deleted data if available
 * @param {string} [body.dateFrom] - Export data from this date (ISO string)
 * @param {string} [body.dateTo] - Export data to this date (ISO string)
 * @returns {Object} Response containing export request information
 * @returns {boolean} returns.success - Whether the export request was successful
 * @returns {Object} returns.data - Export request data
 * @returns {string} returns.data.exportId - Unique export request identifier
 * @returns {string} returns.data.status - Export status ('pending', 'processing', 'completed', 'failed')
 * @returns {string} returns.data.estimatedCompletion - Estimated completion time
 * @returns {string} returns.data.requestedAt - Export request timestamp
 * @returns {string} returns.message - Success message
 *
 * @example
 * // Request
 * POST /users/export
 * {
 *   "dataTypes": ["profile", "events", "reports"],
 *   "format": "json",
 *   "includeDeleted": false,
 *   "dateFrom": "2024-01-01T00:00:00Z"
 * }
 *
 * // Response
 * {
 *   "success": true,
 *   "data": {
 *     "exportId": "export_789",
 *     "status": "pending",
 *     "estimatedCompletion": "2024-01-15T13:00:00Z",
 *     "requestedAt": "2024-01-15T12:00:00Z"
 *   },
 *   "message": "Data export request submitted successfully"
 * }
 *
 * @throws {ValidationError} When export request data is invalid
 * @throws {ConflictError} When another export is already in progress
 * @since 1.0.0
 */
router.post(
  '/export',
  authMiddleware,
  strictLimiter,
  validateRequest({ body: exportRequestSchema.shape.body }),
  asyncHandler(userController.exportUserData.bind(userController))
);

/**
 * Export the configured user routes router.
 *
 * This router contains all user-related endpoints with proper authentication,
 * validation, and rate limiting. All routes require authentication and return
 * standardized response formats.
 *
 * @type {import('express').Router}
 * @since 1.0.0
 */
export { router as userRoutes };
