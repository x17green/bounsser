import { Request, Response } from 'express';

import {
  twitterOAuthStateSchema,
  twitterCallbackSchema,
  refreshTokenSchema,
  userUpdateSchema,
  userSettingsSchema,
  eventReviewSchema,
  reportCreationSchema,
  paginationSchema,
  eventFiltersSchema,
  analyticsQuerySchema,
  exportRequestSchema,
  userDeletionSchema,
} from './user.validation';
import { userService } from './user.service';
import { UserModel } from './user.model';

import { asyncHandler } from '@/core/middleware/errorHandler';
import { logger } from '@/modules/shared/utils/logger';
import { prisma } from '@/db/index';
import { AuthenticationError, NotFoundError, ConflictError } from '@/modules/shared/types/errors';

export class UserController {
  // ================================
  // Authentication & OAuth Routes
  // ================================

  /**
   * Initiate Twitter OAuth flow
   * GET /api/v1/auth/twitter
   */
  initiateTwitterAuth = asyncHandler(async (req: Request, res: Response) => {
    const { query } = twitterOAuthStateSchema.parse(req);

    try {
      const { url, codeVerifier, state } = await userService.generateTwitterAuthUrl(query.state);

      // Store code verifier in session or return it to client
      // For security, we'll return it to be stored client-side temporarily
      res.json({
        success: true,
        data: {
          authUrl: url,
          codeVerifier,
          state,
        },
        message: 'Twitter OAuth URL generated successfully',
      });

      logger.info('Twitter OAuth initiated', {
        state,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });
    } catch (error) {
      logger.error('Failed to initiate Twitter OAuth', { error, ip: req.ip });
      throw new AuthenticationError('Failed to initiate Twitter authentication');
    }
  });

  /**
   * Handle Twitter OAuth callback
   * POST /api/v1/auth/twitter/callback
   */
  handleTwitterCallback = asyncHandler(async (req: Request, res: Response) => {
    const { query, body } = twitterCallbackSchema.parse(req);

    try {
      const tokens = await userService.handleTwitterCallback(
        query.code,
        body.codeVerifier,
        query.state
      );

      res.json({
        success: true,
        data: tokens,
        message: 'Authentication successful',
      });

      logger.info('Twitter OAuth callback processed successfully', {
        userId: tokens.user.id,
        username: tokens.user.username,
        ip: req.ip,
      });
    } catch (error) {
      logger.error('Twitter OAuth callback failed', { error, ip: req.ip });

      if (error instanceof AuthenticationError) {
        throw error;
      }

      throw new AuthenticationError('Authentication failed');
    }
  });

  /**
   * Refresh JWT tokens
   * POST /api/v1/auth/refresh
   */
  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { body } = refreshTokenSchema.parse(req);

    try {
      const tokens = await userService.refreshTokens(body.refreshToken);

      res.json({
        success: true,
        data: tokens,
        message: 'Tokens refreshed successfully',
      });

      logger.info('JWT tokens refreshed', {
        userId: tokens.user.id,
        ip: req.ip,
      });
    } catch (error) {
      logger.error('Token refresh failed', { error, ip: req.ip });
      throw new AuthenticationError('Failed to refresh tokens');
    }
  });

  /**
   * Logout user (invalidate tokens)
   * POST /api/v1/auth/logout
   */
  logout = asyncHandler(async (req: Request, res: Response) => {
    try {
      // In a full implementation, you would:
      // 1. Add the JWT to a blacklist
      // 2. Clear any session data
      // 3. Optionally revoke Twitter tokens

      res.json({
        success: true,
        message: 'Logged out successfully',
      });

      if (req.user) {
        logger.info('User logged out', {
          userId: req.user.id,
          username: req.user.username,
          ip: req.ip,
        });
      }
    } catch (error) {
      logger.error('Logout failed', { error, ip: req.ip });
      throw new Error('Logout failed');
    }
  });

  // ================================
  // User Profile Management
  // ================================

  /**
   * Get user profile
   * GET /api/v1/profile
   */
  getProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    try {
      const user = await UserModel.findByIdWithRelations(req.user.id);

      res.json({
        success: true,
        data: {
          id: user.id,
          xId: user.xId,
          username: user.username,
          settings: user.settings,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          recentEvents: user.events.slice(0, 5),
          subscriptions: user.subscriptions,
        },
        message: 'Profile retrieved successfully',
      });

      logger.debug('User profile retrieved', {
        userId: req.user.id,
        username: req.user.username,
      });
    } catch (error) {
      logger.error('Failed to get user profile', { error, userId: req.user.id });

      if (error instanceof NotFoundError) {
        throw error;
      }

      throw new Error('Failed to retrieve profile');
    }
  });

  /**
   * Update user profile
   * PUT /api/v1/profile
   */
  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const { body } = userUpdateSchema.parse(req);

    try {
      const updatedUser = await userService.updateUser(req.user.id, body);

      res.json({
        success: true,
        data: {
          id: updatedUser.id,
          xId: updatedUser.xId,
          username: updatedUser.username,
          settings: updatedUser.settings,
          updatedAt: updatedUser.updatedAt,
        },
        message: 'Profile updated successfully',
      });

      logger.info('User profile updated', {
        userId: req.user.id,
        changes: Object.keys(body),
      });
    } catch (error) {
      logger.error('Failed to update user profile', { error, userId: req.user.id });

      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }

      throw new Error('Failed to update profile');
    }
  });

  /**
   * Delete user account
   * DELETE /api/v1/profile
   */
  deleteAccount = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const { body } = userDeletionSchema.parse(req);

    try {
      await userService.deleteUser(req.user.id);

      res.json({
        success: true,
        message: 'Account deleted successfully',
      });

      logger.info('User account deleted', {
        userId: req.user.id,
        username: req.user.username,
        reason: body.reason,
        feedback: body.feedback,
      });
    } catch (error) {
      logger.error('Failed to delete user account', { error, userId: req.user.id });

      if (error instanceof NotFoundError) {
        throw error;
      }

      throw new Error('Failed to delete account');
    }
  });

  // ================================
  // User Settings
  // ================================

  /**
   * Get user settings
   * GET /api/v1/settings
   */
  getSettings = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    try {
      const user = await UserModel.findById(req.user.id);

      res.json({
        success: true,
        data: user.settings,
        message: 'Settings retrieved successfully',
      });

      logger.debug('User settings retrieved', { userId: req.user.id });
    } catch (error) {
      logger.error('Failed to get user settings', { error, userId: req.user.id });
      throw new Error('Failed to retrieve settings');
    }
  });

  /**
   * Update user settings
   * PUT /api/v1/settings
   */
  updateSettings = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const { body } = userSettingsSchema.parse(req);

    try {
      const currentUser = await UserModel.findById(req.user.id);
      const currentSettings = currentUser.settings as any;

      // Merge settings
      const updatedSettings = {
        ...currentSettings,
        ...body,
        profile: currentSettings?.profile, // Preserve Twitter profile data
      };

      const user = await UserModel.updateSettings(req.user.id, updatedSettings);

      res.json({
        success: true,
        data: user.settings,
        message: 'Settings updated successfully',
      });

      logger.info('User settings updated', {
        userId: req.user.id,
        updatedFields: Object.keys(body),
      });
    } catch (error) {
      logger.error('Failed to update user settings', { error, userId: req.user.id });

      if (error instanceof NotFoundError) {
        throw error;
      }

      throw new Error('Failed to update settings');
    }
  });

  // ================================
  // Twitter Integration
  // ================================

  /**
   * Get Twitter profile
   * GET /api/v1/twitter/profile
   */
  getTwitterProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    try {
      const profile = await userService.getTwitterProfile(req.user.id);

      res.json({
        success: true,
        data: profile,
        message: 'Twitter profile retrieved successfully',
      });

      logger.debug('Twitter profile retrieved', { userId: req.user.id });
    } catch (error) {
      logger.error('Failed to get Twitter profile', { error, userId: req.user.id });

      if (error instanceof NotFoundError || error instanceof AuthenticationError) {
        throw error;
      }

      throw new Error('Failed to retrieve Twitter profile');
    }
  });

  /**
   * Refresh Twitter tokens
   * POST /api/v1/twitter/refresh
   */
  refreshTwitterToken = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    try {
      await userService.refreshTwitterTokens(req.user.id);

      res.json({
        success: true,
        message: 'Twitter tokens refreshed successfully',
      });

      logger.info('Twitter tokens refreshed', { userId: req.user.id });
    } catch (error) {
      logger.error('Failed to refresh Twitter tokens', { error, userId: req.user.id });

      if (error instanceof NotFoundError || error instanceof AuthenticationError) {
        throw error;
      }

      throw new Error('Failed to refresh Twitter tokens');
    }
  });

  /**
   * Disconnect Twitter account
   * DELETE /api/v1/twitter/disconnect
   */
  disconnectTwitter = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    try {
      await userService.disconnectTwitter(req.user.id);

      res.json({
        success: true,
        message: 'Twitter account disconnected successfully',
      });

      logger.info('Twitter account disconnected', { userId: req.user.id });
    } catch (error) {
      logger.error('Failed to disconnect Twitter account', { error, userId: req.user.id });
      throw new Error('Failed to disconnect Twitter account');
    }
  });

  // ================================
  // Webhook Management
  // ================================

  /**
   * Subscribe to webhook
   * POST /api/v1/twitter/webhook/subscribe
   */
  subscribeToWebhook = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    try {
      await userService.subscribeToWebhook(req.user.id);

      res.json({
        success: true,
        message: 'Webhook subscription successful',
      });

      logger.info('User subscribed to webhook', { userId: req.user.id });
    } catch (error) {
      logger.error('Failed to subscribe to webhook', { error, userId: req.user.id });
      throw new Error('Failed to subscribe to webhook');
    }
  });

  /**
   * Unsubscribe from webhook
   * DELETE /api/v1/twitter/webhook/unsubscribe
   */
  unsubscribeFromWebhook = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    try {
      await userService.unsubscribeFromWebhook(req.user.id);

      res.json({
        success: true,
        message: 'Webhook unsubscription successful',
      });

      logger.info('User unsubscribed from webhook', { userId: req.user.id });
    } catch (error) {
      logger.error('Failed to unsubscribe from webhook', { error, userId: req.user.id });
      throw new Error('Failed to unsubscribe from webhook');
    }
  });

  /**
   * Get webhook status
   * GET /api/v1/twitter/webhook/status
   */
  getWebhookStatus = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    try {
      const status = await userService.getWebhookStatus(req.user.id);

      res.json({
        success: true,
        data: status,
        message: 'Webhook status retrieved successfully',
      });

      logger.debug('Webhook status retrieved', { userId: req.user.id });
    } catch (error) {
      logger.error('Failed to get webhook status', { error, userId: req.user.id });
      throw new Error('Failed to get webhook status');
    }
  });

  // ================================
  // Events & Reports
  // ================================

  /**
   * Get user events
   * GET /api/v1/events
   */
  getUserEvents = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const { query } = paginationSchema.parse(req);
    const filters = eventFiltersSchema.parse(req);

    try {
      const events = await prisma.event.findMany({
        where: {
          targetUserId: req.user.xId,
          ...(filters.query.startDate && {
            createdAt: { gte: new Date(filters.query.startDate) },
          }),
          ...(filters.query.endDate && {
            createdAt: { lte: new Date(filters.query.endDate) },
          }),
          ...(filters.query.minScore && { score: { gte: filters.query.minScore } }),
          ...(filters.query.maxScore && { score: { lte: filters.query.maxScore } }),
          ...(filters.query.action && { action: filters.query.action }),
          ...(filters.query.reviewed !== undefined && { reviewed: filters.query.reviewed }),
          ...(filters.query.source && { source: filters.query.source }),
        },
        select: {
          id: true,
          suspectId: true,
          score: true,
          action: true,
          reviewed: true,
          features: true,
          tweetId: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { [query.sortBy]: query.sortOrder },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      });

      const total = await prisma.event.count({
        where: { targetUserId: req.user.xId },
      });

      res.json({
        success: true,
        data: {
          events,
          pagination: {
            page: query.page,
            limit: query.limit,
            total,
            totalPages: Math.ceil(total / query.limit),
          },
        },
        message: 'Events retrieved successfully',
      });

      logger.debug('User events retrieved', {
        userId: req.user.id,
        count: events.length,
        page: query.page,
      });
    } catch (error) {
      logger.error('Failed to get user events', { error, userId: req.user.id });
      throw new Error('Failed to retrieve events');
    }
  });

  /**
   * Get event details
   * GET /api/v1/events/:eventId
   */
  getEventDetails = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const { eventId } = req.params;

    try {
      const event = await prisma.event.findFirst({
        where: {
          id: eventId,
          targetUserId: req.user.xId,
        },
        include: {
          notifications: {
            select: {
              id: true,
              type: true,
              status: true,
              sentAt: true,
            },
          },
          reports: {
            select: {
              id: true,
              reason: true,
              status: true,
              createdAt: true,
            },
          },
        },
      });

      if (!event) {
        throw new NotFoundError('Event not found');
      }

      res.json({
        success: true,
        data: event,
        message: 'Event details retrieved successfully',
      });

      logger.debug('Event details retrieved', {
        userId: req.user.id,
        eventId,
      });
    } catch (error) {
      logger.error('Failed to get event details', { error, userId: req.user.id, eventId });

      if (error instanceof NotFoundError) {
        throw error;
      }

      throw new Error('Failed to retrieve event details');
    }
  });

  /**
   * Review event
   * PATCH /api/v1/events/:eventId/review
   */
  reviewEvent = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const { params, body } = eventReviewSchema.parse(req);

    try {
      const event = await prisma.event.findFirst({
        where: {
          id: params.eventId,
          targetUserId: req.user.xId,
        },
      });

      if (!event) {
        throw new NotFoundError('Event not found');
      }

      const updatedEvent = await prisma.event.update({
        where: { id: params.eventId },
        data: {
          action: body.action,
          reviewed: body.reviewed,
          reviewNotes: body.notes,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          action: true,
          reviewed: true,
          reviewNotes: true,
          updatedAt: true,
        },
      });

      res.json({
        success: true,
        data: updatedEvent,
        message: 'Event reviewed successfully',
      });

      logger.info('Event reviewed', {
        userId: req.user.id,
        eventId: params.eventId,
        action: body.action,
      });
    } catch (error) {
      logger.error('Failed to review event', {
        error,
        userId: req.user.id,
        eventId: params.eventId,
      });

      if (error instanceof NotFoundError) {
        throw error;
      }

      throw new Error('Failed to review event');
    }
  });

  /**
   * Create report
   * POST /api/v1/reports
   */
  createReport = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const { body } = reportCreationSchema.parse(req);

    try {
      // Verify the event belongs to the user
      const event = await prisma.event.findFirst({
        where: {
          id: body.eventId,
          targetUserId: req.user.xId,
        },
      });

      if (!event) {
        throw new NotFoundError('Event not found');
      }

      const report = await prisma.report.create({
        data: {
          eventId: body.eventId,
          reporter: req.user.id,
          reason: body.reason,
          status: 'pending',
        },
        select: {
          id: true,
          eventId: true,
          reason: true,
          status: true,
          createdAt: true,
        },
      });

      res.status(201).json({
        success: true,
        data: report,
        message: 'Report created successfully',
      });

      logger.info('Report created', {
        userId: req.user.id,
        reportId: report.id,
        eventId: body.eventId,
        reason: body.reason,
      });
    } catch (error) {
      logger.error('Failed to create report', { error, userId: req.user.id });

      if (error instanceof NotFoundError) {
        throw error;
      }

      throw new Error('Failed to create report');
    }
  });

  /**
   * Get user reports
   * GET /api/v1/reports
   */
  getUserReports = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const { query } = paginationSchema.parse(req);

    try {
      const reports = await prisma.report.findMany({
        where: { reporter: req.user.id },
        include: {
          event: {
            select: {
              id: true,
              suspectId: true,
              score: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      });

      const total = await prisma.report.count({
        where: { reporter: req.user.id },
      });

      res.json({
        success: true,
        data: {
          reports,
          pagination: {
            page: query.page,
            limit: query.limit,
            total,
            totalPages: Math.ceil(total / query.limit),
          },
        },
        message: 'Reports retrieved successfully',
      });

      logger.debug('User reports retrieved', {
        userId: req.user.id,
        count: reports.length,
      });
    } catch (error) {
      logger.error('Failed to get user reports', { error, userId: req.user.id });
      throw new Error('Failed to retrieve reports');
    }
  });

  // ================================
  // Analytics & Statistics
  // ================================

  /**
   * Get user statistics
   * GET /api/v1/stats
   */
  getUserStats = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    try {
      const stats = await userService.getUserStats(req.user.id);

      res.json({
        success: true,
        data: stats,
        message: 'Statistics retrieved successfully',
      });

      logger.debug('User stats retrieved', { userId: req.user.id });
    } catch (error) {
      logger.error('Failed to get user stats', { error, userId: req.user.id });
      throw new Error('Failed to retrieve statistics');
    }
  });

  /**
   * Get user analytics
   * GET /api/v1/analytics
   */
  getUserAnalytics = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const { query } = analyticsQuerySchema.parse(req);

    try {
      // This would be implemented with proper analytics aggregation
      const analytics = {
        period: query.period,
        events: {
          total: 0,
          highScore: 0,
          reviewed: 0,
        },
        trends: {
          daily: [],
          weekly: [],
        },
        topSuspects: [],
      };

      res.json({
        success: true,
        data: analytics,
        message: 'Analytics retrieved successfully',
      });

      logger.debug('User analytics retrieved', {
        userId: req.user.id,
        period: query.period,
      });
    } catch (error) {
      logger.error('Failed to get user analytics', { error, userId: req.user.id });
      throw new Error('Failed to retrieve analytics');
    }
  });

  // ================================
  // Notifications
  // ================================

  /**
   * Get notifications
   * GET /api/v1/notifications
   */
  getNotifications = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const { query } = paginationSchema.parse(req);

    try {
      const notifications = await prisma.notification.findMany({
        where: { recipient: req.user.id },
        include: {
          event: {
            select: {
              id: true,
              suspectId: true,
              score: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      });

      const total = await prisma.notification.count({
        where: { recipient: req.user.id },
      });

      res.json({
        success: true,
        data: {
          notifications,
          pagination: {
            page: query.page,
            limit: query.limit,
            total,
            totalPages: Math.ceil(total / query.limit),
          },
        },
        message: 'Notifications retrieved successfully',
      });

      logger.debug('User notifications retrieved', {
        userId: req.user.id,
        count: notifications.length,
      });
    } catch (error) {
      logger.error('Failed to get notifications', { error, userId: req.user.id });
      throw new Error('Failed to retrieve notifications');
    }
  });

  /**
   * Mark notification as read
   * PATCH /api/v1/notifications/:notificationId/read
   */
  markNotificationAsRead = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const { notificationId } = req.params;

    try {
      const notification = await prisma.notification.findFirst({
        where: {
          id: notificationId,
          recipient: req.user.id,
        },
      });

      if (!notification) {
        throw new NotFoundError('Notification not found');
      }

      await prisma.notification.update({
        where: { id: notificationId },
        data: { status: 'read' },
      });

      res.json({
        success: true,
        message: 'Notification marked as read',
      });

      logger.debug('Notification marked as read', {
        userId: req.user.id,
        notificationId,
      });
    } catch (error) {
      logger.error('Failed to mark notification as read', {
        error,
        userId: req.user.id,
        notificationId,
      });

      if (error instanceof NotFoundError) {
        throw error;
      }

      throw new Error('Failed to mark notification as read');
    }
  });

  /**
   * Mark all notifications as read
   * PATCH /api/v1/notifications/read-all
   */
  markAllNotificationsAsRead = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    try {
      const result = await prisma.notification.updateMany({
        where: {
          recipient: req.user.id,
          status: { not: 'read' },
        },
        data: { status: 'read' },
      });

      res.json({
        success: true,
        data: { updated: result.count },
        message: 'All notifications marked as read',
      });

      logger.debug('All notifications marked as read', {
        userId: req.user.id,
        count: result.count,
      });
    } catch (error) {
      logger.error('Failed to mark all notifications as read', {
        error,
        userId: req.user.id,
      });
      throw new Error('Failed to mark notifications as read');
    }
  });

  // ================================
  // Session Management
  // ================================

  /**
   * Get user sessions
   * GET /api/v1/sessions
   */
  getUserSessions = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    try {
      // This would integrate with your session storage system
      const sessions = [
        {
          id: 'current',
          device: req.get('User-Agent') || 'Unknown',
          ip: req.ip,
          lastActive: new Date(),
          current: true,
        },
      ];

      res.json({
        success: true,
        data: sessions,
        message: 'Sessions retrieved successfully',
      });

      logger.debug('User sessions retrieved', { userId: req.user.id });
    } catch (error) {
      logger.error('Failed to get user sessions', { error, userId: req.user.id });
      throw new Error('Failed to retrieve sessions');
    }
  });

  /**
   * Revoke session
   * DELETE /api/v1/sessions/:sessionId
   */
  revokeSession = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const { sessionId } = req.params;

    try {
      // This would implement actual session revocation
      res.json({
        success: true,
        message: 'Session revoked successfully',
      });

      logger.info('Session revoked', {
        userId: req.user.id,
        sessionId,
      });
    } catch (error) {
      logger.error('Failed to revoke session', {
        error,
        userId: req.user.id,
        sessionId,
      });
      throw new Error('Failed to revoke session');
    }
  });

  /**
   * Revoke all sessions
   * DELETE /api/v1/sessions
   */
  revokeAllSessions = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    try {
      // This would implement actual session revocation for all sessions
      res.json({
        success: true,
        message: 'All sessions revoked successfully',
      });

      logger.info('All sessions revoked', { userId: req.user.id });
    } catch (error) {
      logger.error('Failed to revoke all sessions', { error, userId: req.user.id });
      throw new Error('Failed to revoke sessions');
    }
  });

  // ================================
  // Data Export
  // ================================

  /**
   * Export user data
   * GET /api/v1/export
   */
  exportUserData = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const { body } = exportRequestSchema.parse(req);

    try {
      // For large exports, consider implementing background job processing
      // and returning a job ID for status checking

      // Implement pagination for large datasets
      // const batchSize = 1000;

      // Stream response for large data sets
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="user-data-${req.user.id}.json"`);

      // Start streaming response
      res.write('{"user":');

      const userData = {
        id: req.user.id,
        username: req.user.username,
        createdAt: new Date(),
      };

      res.write(JSON.stringify(userData));
      res.write(',"events":[],"reports":[],"settings":{}}');
      res.end();

      logger.info('User data exported', {
        userId: req.user.id,
        format: body.format,
      });
    } catch (error) {
      logger.error('Failed to export user data', { error, userId: req.user.id });
      throw new Error('Failed to export data');
    }
  });
}
