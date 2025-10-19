import crypto from 'crypto';

import { TwitterApi } from 'twitter-api-v2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

import { prisma } from '@/db/index';
import { config } from '@/core/config';
import { logger } from '@/modules/shared/utils/logger';
import { AuthenticationError, NotFoundError, ConflictError } from '@/modules/shared/types/errors';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '@/core/middleware/auth';

export interface CreateUserData {
  xId: string;
  username: string;
  accessToken: string;
  refreshToken: string;
  settings?: Record<string, any>;
}

export interface UpdateUserData {
  username?: string;
  settings?: Record<string, any>;
}

export interface TwitterProfile {
  id: string;
  username: string;
  name: string;
  profile_image_url?: string;
  verified?: boolean;
  followers_count?: number;
  following_count?: number;
  tweet_count?: number;
  created_at?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  user: {
    id: string;
    xId: string;
    username: string;
  };
}

export interface UserStats {
  totalEvents: number;
  reviewedEvents: number;
  highScoreEvents: number;
  recentEventCount: number;
  subscriptionStatus: string;
}

export class UserService {
  private twitterClient: TwitterApi;
  private isDevelopmentMode: boolean;

  constructor() {
    this.isDevelopmentMode =
      config.app.isDevelopment &&
      (!config.twitter.clientId ||
        !config.twitter.clientSecret ||
        config.twitter.clientId === 'your_twitter_client_id' ||
        config.twitter.clientSecret === 'your_twitter_client_secret');

    if (this.isDevelopmentMode) {
      logger.warn('Twitter OAuth running in mock mode - credentials not configured');
      // Create a minimal client for development
      this.twitterClient = {} as TwitterApi;
    } else {
      this.twitterClient = new TwitterApi({
        clientId: config.twitter.clientId,
        clientSecret: config.twitter.clientSecret,
      });
    }
  }

  /**
   * Encrypt sensitive token data using AES-256-GCM.
   */
  private encryptToken(token: string): string {
    try {
      // Ensure you are using a 32-byte key (e.g., a 64-char hex key)
      const key = Buffer.from(config.auth.encryption.key, 'hex');
      const iv = crypto.randomBytes(config.auth.encryption.ivLength);

      const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

      let encrypted = cipher.update(token, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // GCM provides an authentication tag, which is crucial for security
      const authTag = cipher.getAuthTag().toString('hex');

      // Store the iv, authTag, and encrypted data together
      return `${iv.toString('hex')}:${authTag}:${encrypted}`;
    } catch (error) {
      logger.error('Token encryption failed', { error });
      throw new Error('Failed to encrypt token');
    }
  }

  /**
   * Decrypt sensitive token data using AES-256-GCM.
   */
  private decryptToken(encryptedToken: string): string {
    try {
      const parts = encryptedToken.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted token format');
      }

      const key = Buffer.from(config.auth.encryption.key, 'hex');
      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];

      const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);

      // Set the authentication tag before decryption. This is the integrity check.
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      logger.error('Token decryption failed', { error });
      throw new Error('Failed to decrypt token');
    }
  }

  /**
   * Generate Twitter OAuth URL for user authentication
   */
  async generateTwitterAuthUrl(
    state?: string
  ): Promise<{ url: string; codeVerifier: string; state: string }> {
    try {
      // Development mode mock
      if (this.isDevelopmentMode) {
        const mockCodeVerifier = 'mock-code-verifier-' + Math.random().toString(36).substring(7);
        const mockState = state || 'mock-state-' + Math.random().toString(36).substring(7);
        const mockAuthUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=mock-client&redirect_uri=${encodeURIComponent(config.twitter.callbackUrl || 'http://localhost:3000/api/v1/auth/twitter/callback')}&scope=tweet.read%20users.read%20follows.read&state=${mockState}&code_challenge=${mockCodeVerifier}&code_challenge_method=S256`;

        logger.info('Generated Twitter OAuth URL (MOCK MODE)', {
          state: mockState,
          hasUrl: true,
          urlLength: mockAuthUrl.length,
          urlStart: mockAuthUrl.substring(0, 50),
        });

        return {
          url: mockAuthUrl,
          state: mockState,
          codeVerifier: mockCodeVerifier,
        };
      }

      // Production mode with real Twitter API
      const authData = this.twitterClient.generateOAuth2AuthLink(config.twitter.callbackUrl, {
        scope: ['tweet.read', 'users.read', 'follows.read'],
        state,
      });

      logger.info('Generated Twitter OAuth URL', {
        state,
        hasUrl: !!authData.url,
        urlLength: authData.url?.length || 0,
        urlStart: authData.url?.substring(0, 50) || 'No URL',
      });

      if (!authData.url || !authData.codeVerifier) {
        throw new Error('Twitter OAuth URL generation failed - missing required fields');
      }

      return {
        url: authData.url,
        codeVerifier: authData.codeVerifier,
        state: authData.state || state || '',
      };
    } catch (error) {
      logger.error('Failed to generate Twitter OAuth URL', { error });
      throw new AuthenticationError('Failed to generate authentication URL');
    }
  }

  /**
   * Handle Twitter OAuth callback and create/update user
   */
  async handleTwitterCallback(
    code: string,
    codeVerifier: string,
    state?: string
  ): Promise<AuthTokens> {
    try {
      let profile: TwitterProfile;
      let accessToken: string;
      let twitterRefreshToken: string | undefined;

      // Development mode mock
      if (this.isDevelopmentMode) {
        logger.info('Handling Twitter OAuth callback (MOCK MODE)', {
          code: code.substring(0, 10),
          state,
        });

        // Mock user profile
        profile = {
          id: 'mock-twitter-user-' + Date.now(),
          username: 'mockuser_' + Math.random().toString(36).substring(7),
          name: 'Mock Twitter User',
          profile_image_url: 'https://pbs.twimg.com/profile_images/1/default_profile_normal.png',
          verified: false,
          followers_count: 100,
          following_count: 50,
          tweet_count: 25,
          created_at: new Date().toISOString(),
        };

        accessToken = 'mock-twitter-access-token-' + Math.random().toString(36);
        twitterRefreshToken = 'mock-twitter-refresh-token-' + Math.random().toString(36);
      } else {
        // Production mode with real Twitter API
        const tokenData = await this.twitterClient.loginWithOAuth2({
          code,
          codeVerifier,
          redirectUri: config.twitter.callbackUrl,
        });

        accessToken = tokenData.accessToken;
        twitterRefreshToken = tokenData.refreshToken;

        // Get user profile from Twitter
        const twitterUserClient = new TwitterApi(accessToken);
        const twitterUser = await twitterUserClient.v2.me({
          'user.fields': ['verified', 'public_metrics', 'created_at', 'profile_image_url'],
        });

        if (!twitterUser.data) {
          throw new AuthenticationError('Failed to fetch Twitter user profile');
        }

        profile = {
          id: twitterUser.data.id,
          username: twitterUser.data.username,
          name: twitterUser.data.name,
          profile_image_url: twitterUser.data.profile_image_url,
          verified: twitterUser.data.verified,
          followers_count: twitterUser.data.public_metrics?.followers_count,
          following_count: twitterUser.data.public_metrics?.following_count,
          tweet_count: twitterUser.data.public_metrics?.tweet_count,
          created_at: twitterUser.data.created_at,
        };
      }

      // Encrypt tokens before storing
      const encryptedAccessToken = this.encryptToken(accessToken);
      const encryptedRefreshToken = twitterRefreshToken
        ? this.encryptToken(twitterRefreshToken)
        : '';

      // Create or update user in database
      const userData: CreateUserData = {
        xId: profile.id,
        username: profile.username,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        settings: {
          profile,
          notifications: {
            email: true,
            dm: true,
            slack: false,
          },
          thresholds: {
            low: config.scoring.thresholds.low,
            medium: config.scoring.thresholds.medium,
            high: config.scoring.thresholds.high,
          },
          features: {
            autoReply: false,
            imageAnalysis: true,
            advancedMetrics: true,
          },
        },
      };

      const user = await this.createOrUpdateUser(userData);

      // Generate JWT tokens
      const jwtAccessToken = generateToken(user);
      const jwtRefreshToken = generateRefreshToken(user);

      logger.info('User authenticated successfully via Twitter OAuth', {
        userId: user.id,
        username: user.username,
        xId: user.xId,
        state,
      });

      return {
        accessToken: jwtAccessToken,
        refreshToken: jwtRefreshToken,
        expiresIn: config.auth.jwt.expiresIn,
        user: {
          id: user.id,
          xId: user.xId,
          username: user.username,
        },
      };
    } catch (error) {
      logger.error('Twitter OAuth callback failed', { error, code: code.substring(0, 10) });

      if (error instanceof AuthenticationError) {
        throw error;
      }

      throw new AuthenticationError('Authentication failed');
    }
  }

  /**
   * Create or update user in database
   */
  async createOrUpdateUser(userData: CreateUserData) {
    try {
      const user = await prisma.user.upsert({
        where: { xId: userData.xId },
        update: {
          username: userData.username,
          accessToken: userData.accessToken,
          refreshToken: userData.refreshToken,
          settings: userData.settings || {},
          updatedAt: new Date(),
        },
        create: {
          xId: userData.xId,
          username: userData.username,
          accessToken: userData.accessToken,
          refreshToken: userData.refreshToken,
          settings: userData.settings || {},
        },
        select: {
          id: true,
          xId: true,
          username: true,
          settings: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      logger.info('User created/updated successfully', {
        userId: user.id,
        username: user.username,
        xId: user.xId,
      });

      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictError('User already exists with this Twitter account');
        }
      }

      logger.error('Failed to create/update user', {
        error,
        userData: { xId: userData.xId, username: userData.username },
      });
      throw new Error('Failed to create user account');
    }
  }

  /**
   * Refresh JWT tokens using refresh token
   */
  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    try {
      // Verify refresh token
      const payload = verifyRefreshToken(refreshToken);

      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          xId: true,
          username: true,
        },
      });

      if (!user) {
        throw new AuthenticationError('User not found');
      }

      // Generate new tokens
      const newAccessToken = generateToken(user);
      const newRefreshToken = generateRefreshToken(user);

      logger.info('Tokens refreshed successfully', {
        userId: user.id,
        username: user.username,
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: config.auth.jwt.expiresIn,
        user: {
          id: user.id,
          xId: user.xId,
          username: user.username,
        },
      };
    } catch (error) {
      logger.error('Token refresh failed', { error });

      if (error instanceof AuthenticationError) {
        throw error;
      }

      throw new AuthenticationError('Failed to refresh tokens');
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          xId: true,
          username: true,
          settings: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              events: true,
              subscriptions: true,
            },
          },
        },
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      logger.error('Failed to get user by ID', { error, userId });
      throw new Error('Failed to retrieve user');
    }
  }

  /**
   * Get user by Twitter ID
   */
  async getUserByXId(xId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { xId },
        select: {
          id: true,
          xId: true,
          username: true,
          settings: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      logger.error('Failed to get user by X ID', { error, xId });
      throw new Error('Failed to retrieve user');
    }
  }

  /**
   * Update user profile
   */
  async updateUser(userId: string, updateData: UpdateUserData) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          username: updateData.username,
          settings: updateData.settings,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          xId: true,
          username: true,
          settings: true,
          updatedAt: true,
        },
      });

      logger.info('User updated successfully', {
        userId: user.id,
        username: user.username,
      });

      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundError('User not found');
        }
        if (error.code === 'P2002') {
          throw new ConflictError('Username already taken');
        }
      }

      logger.error('Failed to update user', { error, userId });
      throw new Error('Failed to update user');
    }
  }

  /**
   * Delete user account
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      await prisma.user.delete({
        where: { id: userId },
      });

      logger.info('User deleted successfully', { userId });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundError('User not found');
        }
      }

      logger.error('Failed to delete user', { error, userId });
      throw new Error('Failed to delete user');
    }
  }

  /**
   * Get fresh Twitter profile for user
   */
  async getTwitterProfile(userId: string): Promise<TwitterProfile> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          accessToken: true,
          xId: true,
        },
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Decrypt access token
      const decryptedToken = this.decryptToken(user.accessToken);

      // Create Twitter client with user's token
      const userTwitterClient = new TwitterApi(decryptedToken);

      // Fetch fresh profile data
      const twitterUser = await userTwitterClient.v2.me({
        'user.fields': ['verified', 'public_metrics', 'created_at', 'profile_image_url'],
      });

      if (!twitterUser.data) {
        throw new AuthenticationError('Failed to fetch Twitter profile');
      }

      return {
        id: twitterUser.data.id,
        username: twitterUser.data.username,
        name: twitterUser.data.name,
        profile_image_url: twitterUser.data.profile_image_url,
        verified: twitterUser.data.verified,
        followers_count: twitterUser.data.public_metrics?.followers_count,
        following_count: twitterUser.data.public_metrics?.following_count,
        tweet_count: twitterUser.data.public_metrics?.tweet_count,
        created_at: twitterUser.data.created_at,
      };
    } catch (error) {
      logger.error('Failed to get Twitter profile', { error, userId });

      if (error instanceof NotFoundError || error instanceof AuthenticationError) {
        throw error;
      }

      throw new Error('Failed to retrieve Twitter profile');
    }
  }

  /**
   * Refresh Twitter tokens
   */
  async refreshTwitterTokens(userId: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          refreshToken: true,
        },
      });

      if (!user || !user.refreshToken) {
        throw new NotFoundError('User or refresh token not found');
      }

      // Decrypt refresh token
      const decryptedRefreshToken = this.decryptToken(user.refreshToken);

      // Refresh Twitter tokens
      const { accessToken, refreshToken } =
        await this.twitterClient.refreshOAuth2Token(decryptedRefreshToken);

      // Encrypt new tokens
      const encryptedAccessToken = this.encryptToken(accessToken);
      const encryptedRefreshToken = refreshToken
        ? this.encryptToken(refreshToken)
        : user.refreshToken;

      // Update user with new tokens
      await prisma.user.update({
        where: { id: userId },
        data: {
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken,
          updatedAt: new Date(),
        },
      });

      logger.info('Twitter tokens refreshed successfully', { userId });
    } catch (error) {
      logger.error('Failed to refresh Twitter tokens', { error, userId });

      if (error instanceof NotFoundError) {
        throw error;
      }

      throw new AuthenticationError('Failed to refresh Twitter tokens');
    }
  }

  /**
   * Disconnect Twitter account
   */
  async disconnectTwitter(userId: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          accessToken: '',
          refreshToken: '',
          updatedAt: new Date(),
        },
      });

      logger.info('Twitter account disconnected', { userId });
    } catch (error) {
      logger.error('Failed to disconnect Twitter account', { error, userId });
      throw new Error('Failed to disconnect Twitter account');
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<UserStats> {
    try {
      const [eventStats, subscription] = await Promise.all([
        prisma.event.aggregate({
          where: { targetUserId: userId },
          _count: {
            id: true,
          },
        }),
        prisma.subscription.findFirst({
          where: { userId },
          select: { status: true },
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      const [reviewedEvents, highScoreEvents, recentEvents] = await Promise.all([
        prisma.event.count({
          where: { targetUserId: userId, reviewed: true },
        }),
        prisma.event.count({
          where: { targetUserId: userId, score: { gte: config.scoring.thresholds.high } },
        }),
        prisma.event.count({
          where: {
            targetUserId: userId,
            createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
        }),
      ]);

      return {
        totalEvents: eventStats._count.id,
        reviewedEvents,
        highScoreEvents,
        recentEventCount: recentEvents,
        subscriptionStatus: subscription?.status || 'none',
      };
    } catch (error) {
      logger.error('Failed to get user stats', { error, userId });
      throw new Error('Failed to retrieve user statistics');
    }
  }

  /**
   * Subscribe user to Account Activity API
   */
  async subscribeToWebhook(userId: string): Promise<void> {
    try {
      const user = await this.getUserById(userId);

      // This would integrate with Twitter's Account Activity API
      // For now, we'll update the user settings to indicate subscription
      await prisma.user.update({
        where: { id: userId },
        data: {
          settings: {
            ...user.settings,
            webhookSubscribed: true,
            webhookSubscribedAt: new Date().toISOString(),
          },
        },
      });

      logger.info('User subscribed to webhook', { userId });
    } catch (error) {
      logger.error('Failed to subscribe to webhook', { error, userId });
      throw new Error('Failed to subscribe to webhook');
    }
  }

  /**
   * Unsubscribe user from Account Activity API
   */
  async unsubscribeFromWebhook(userId: string): Promise<void> {
    try {
      const user = await this.getUserById(userId);

      await prisma.user.update({
        where: { id: userId },
        data: {
          settings: {
            ...user.settings,
            webhookSubscribed: false,
            webhookUnsubscribedAt: new Date().toISOString(),
          },
        },
      });

      logger.info('User unsubscribed from webhook', { userId });
    } catch (error) {
      logger.error('Failed to unsubscribe from webhook', { error, userId });
      throw new Error('Failed to unsubscribe from webhook');
    }
  }

  /**
   * Get webhook subscription status
   */
  async getWebhookStatus(userId: string): Promise<{ subscribed: boolean; subscribedAt?: string }> {
    try {
      const user = await this.getUserById(userId);
      const settings = user.settings as any;

      return {
        subscribed: settings?.webhookSubscribed || false,
        subscribedAt: settings?.webhookSubscribedAt,
      };
    } catch (error) {
      logger.error('Failed to get webhook status', { error, userId });
      throw new Error('Failed to get webhook status');
    }
  }
}

export const userService = new UserService();
