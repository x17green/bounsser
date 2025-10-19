import { Router } from 'express';

// Import route modules
import { authRoutes } from './auth.routes';
import { healthRoutes } from './health';
import { metricsRoutes } from './metrics';

import { authMiddleware } from '@/core/middleware/auth';
// Import module-specific routes
import { userRoutes } from '@/modules/user/user.routes';
import { orgRoutes } from '@/modules/org/org.routes';
import { ingestRoutes } from '@/modules/ingest/ingest.routes';
import { monitoringRoutes } from '@/modules/monitoring/monitoring.routes';

/**
 * Bouncer Backend API Router Configuration
 *
 * This module provides centralized router configuration for the Bouncer backend API.
 * It organizes routes into logical groups and applies appropriate middleware for
 * authentication, rate limiting, and request validation.
 *
 * ## Route Structure
 * - **Public Routes**: Authentication, monitoring, webhooks
 * - **Protected Routes**: User management, organization management, data ingestion
 * - **System Routes**: Health checks, metrics, status endpoints
 *
 * ## Security Model
 * All protected routes require JWT authentication via the `authMiddleware`.
 * Public routes implement their own rate limiting and validation as needed.
 *
 * @module RouteConfiguration
 * @version 1.0.0
 * @since 2024-01-15
 */

/**
 * Create and configure the main API router.
 *
 * Assembles all API routes into a single router with proper organization
 * and middleware application. Routes are grouped by functionality and
 * access level for better maintainability and security.
 *
 * @function createApiRouter
 * @returns {Router} Configured Express router with all API routes
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * import { createApiRouter } from '@/core/routes';
 *
 * const app = express();
 * const apiRouter = createApiRouter();
 * app.use('/api/v1', apiRouter);
 * ```
 */
export function createApiRouter(): Router {
  const apiRouter = Router();

  // ================================
  // Public Routes (No Authentication Required)
  // ================================

  /**
   * Authentication routes - handles OAuth flows, token management, and user authentication.
   *
   * Routes:
   * - GET  /auth/twitter - Initiate Twitter OAuth flow
   * - POST /auth/twitter/callback - Handle OAuth callback
   * - POST /auth/refresh - Refresh JWT tokens
   * - POST /auth/logout - Logout and invalidate tokens
   * - GET  /auth/me - Get current user info
   * - POST /auth/verify - Verify JWT token
   * - GET  /auth/status - Get auth system status
   */
  apiRouter.use('/auth', authRoutes);

  /**
   * Monitoring routes - handles system monitoring, alerts, and external webhooks.
   *
   * Routes:
   * - GET  /monitoring/health - Service health check
   * - POST /monitoring/alerts - Receive external alerts
   * - GET  /monitoring/status - Get monitoring status
   */
  apiRouter.use('/monitoring', monitoringRoutes);

  /**
   * Webhook routes - handles incoming webhooks from Twitter and other external services.
   *
   * Routes:
   * - POST /webhooks/twitter - Twitter webhook endpoint
   * - POST /webhooks/challenge - Twitter webhook challenge response
   * - GET  /webhooks/status - Webhook system status
   */
  apiRouter.use('/webhooks', ingestRoutes); // Twitter webhooks

  // ================================
  // Protected Routes (Authentication Required)
  // ================================

  /**
   * User management routes - handles user profiles, settings, events, and reports.
   * Requires JWT authentication for all endpoints.
   *
   * Routes:
   * - GET    /users/profile - Get user profile
   * - PUT    /users/profile - Update user profile
   * - DELETE /users/profile - Delete user account
   * - GET    /users/settings - Get user settings
   * - PUT    /users/settings - Update user settings
   * - GET    /users/events - Get impersonation events
   * - PATCH  /users/events/:id/review - Review event
   * - POST   /users/reports - Create impersonation report
   * - GET    /users/reports - Get user reports
   * - GET    /users/stats - Get user statistics
   * - GET    /users/analytics - Get user analytics
   * - GET    /users/notifications - Get notifications
   * - POST   /users/export - Export user data (GDPR)
   */
  apiRouter.use('/users', authMiddleware, userRoutes);

  /**
   * Organization management routes - handles multi-user organizations and team management.
   * Requires JWT authentication and appropriate role permissions.
   *
   * Routes:
   * - GET    /orgs - Get user organizations
   * - POST   /orgs - Create new organization
   * - GET    /orgs/:id - Get organization details
   * - PUT    /orgs/:id - Update organization
   * - DELETE /orgs/:id - Delete organization
   * - GET    /orgs/:id/members - Get organization members
   * - POST   /orgs/:id/members - Add organization member
   * - DELETE /orgs/:id/members/:userId - Remove member
   */
  apiRouter.use('/orgs', authMiddleware, orgRoutes);

  /**
   * Data ingestion routes (protected) - handles manual data ingestion and processing.
   * Requires JWT authentication and appropriate permissions.
   *
   * Routes:
   * - POST /ingest/twitter/user - Ingest Twitter user data
   * - POST /ingest/analysis/run - Run manual analysis
   * - GET  /ingest/jobs - Get ingestion job status
   */
  apiRouter.use('/ingest', authMiddleware, ingestRoutes);

  return apiRouter;
}

/**
 * Create router for system-level routes (health, metrics).
 *
 * Assembles system-level endpoints that are typically mounted at the root level
 * or under a system namespace. These routes provide operational visibility
 * and are used by monitoring tools, load balancers, and deployment systems.
 *
 * @function createSystemRouter
 * @returns {Router} Configured Express router with system routes
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * import { createSystemRouter } from '@/core/routes';
 *
 * const app = express();
 * const systemRouter = createSystemRouter();
 * app.use('/', systemRouter);
 * ```
 */
export function createSystemRouter(): Router {
  const systemRouter = Router();

  /**
   * Health check routes - provides application health status for monitoring.
   *
   * Routes:
   * - GET /health - Comprehensive health check (database, Redis, external services)
   * - GET /ready - Readiness probe for Kubernetes/container orchestration
   * - GET /live - Liveness probe for Kubernetes/container orchestration
   */
  systemRouter.use('/health', healthRoutes);
  systemRouter.use('/ready', healthRoutes);
  systemRouter.use('/live', healthRoutes);

  /**
   * Metrics routes - provides application metrics in Prometheus format.
   *
   * Routes:
   * - GET /metrics - Prometheus-formatted application metrics
   * - GET /metrics/custom - Custom business metrics
   */
  systemRouter.use('/metrics', metricsRoutes);

  return systemRouter;
}

/**
 * Export individual route modules for flexibility and testing.
 *
 * These exports allow direct access to individual route modules
 * for testing, custom mounting, or alternative configurations.
 *
 * @since 1.0.0
 */
export {
  /** Authentication and authorization routes */
  authRoutes,
  /** User management and profile routes */
  userRoutes,
  /** Organization and team management routes */
  orgRoutes,
  /** Data ingestion and processing routes */
  ingestRoutes,
  /** System monitoring and alerting routes */
  monitoringRoutes,
  /** Health check and status routes */
  healthRoutes,
  /** Application metrics and telemetry routes */
  metricsRoutes,
};
