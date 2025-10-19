import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

import { prisma } from '@/db/index';
import { logger } from '@/modules/shared/utils/logger';
import { NotFoundError, ConflictError, ValidationError } from '@/modules/shared/types/errors';

export interface UserCreateInput {
  xId: string;
  username: string;
  accessToken: string;
  refreshToken: string;
  settings?: Prisma.JsonValue;
}

export interface UserUpdateInput {
  username?: string;
  accessToken?: string;
  refreshToken?: string;
  settings?: Prisma.JsonValue;
}

export interface UserFilters {
  username?: string;
  xId?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  hasSubscription?: boolean;
  webhookSubscribed?: boolean;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserWithCounts {
  id: string;
  xId: string;
  username: string;
  settings: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    events: number;
    subscriptions: number;
    auditLogs: number;
  };
}

export interface UserWithRelations {
  id: string;
  xId: string;
  username: string;
  settings: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
  events: Array<{
    id: string;
    score: number;
    action: string;
    reviewed: boolean;
    createdAt: Date;
  }>;
  subscriptions: Array<{
    id: string;
    status: string;
    planId: string;
    startedAt: Date;
    endsAt: Date | null;
  }>;
}

export class UserModel {
  /**
   * Create a new user
   */
  static async create(data: UserCreateInput) {
    try {
      const user = await prisma.user.create({
        data: {
          xId: data.xId,
          username: data.username,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          settings: data.settings || {},
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

      logger.debug('User created in database', {
        userId: user.id,
        username: user.username,
        xId: user.xId,
      });

      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const field = error.meta?.target as string[];
          if (field?.includes('x_id')) {
            throw new ConflictError('User with this Twitter ID already exists');
          }
          if (field?.includes('username')) {
            throw new ConflictError('Username already taken');
          }
          throw new ConflictError('User already exists');
        }
      }

      logger.error('Failed to create user in database', {
        error,
        data: { xId: data.xId, username: data.username },
      });
      throw new Error('Failed to create user');
    }
  }

  /**
   * Find user by ID
   */
  static async findById(id: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
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
              auditLogs: true,
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

      logger.error('Failed to find user by ID', { error, id });
      throw new Error('Failed to retrieve user');
    }
  }

  /**
   * Find user by Twitter ID
   */
  static async findByXId(xId: string) {
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

      logger.error('Failed to find user by X ID', { error, xId });
      throw new Error('Failed to retrieve user');
    }
  }

  /**
   * Find user by username
   */
  static async findByUsername(username: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { username },
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

      logger.error('Failed to find user by username', { error, username });
      throw new Error('Failed to retrieve user');
    }
  }

  /**
   * Find user with full relations
   */
  static async findByIdWithRelations(id: string): Promise<UserWithRelations> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          xId: true,
          username: true,
          settings: true,
          createdAt: true,
          updatedAt: true,
          events: {
            select: {
              id: true,
              score: true,
              action: true,
              reviewed: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          subscriptions: {
            select: {
              id: true,
              status: true,
              planId: true,
              startedAt: true,
              endsAt: true,
            },
            orderBy: { createdAt: 'desc' },
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

      logger.error('Failed to find user with relations', { error, id });
      throw new Error('Failed to retrieve user with relations');
    }
  }

  /**
   * Update user
   */
  static async update(id: string, data: UserUpdateInput) {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: {
          username: data.username,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          settings: data.settings,
          updatedAt: new Date(),
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

      logger.debug('User updated in database', {
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
          const field = error.meta?.target as string[];
          if (field?.includes('username')) {
            throw new ConflictError('Username already taken');
          }
          throw new ConflictError('User data conflicts with existing data');
        }
      }

      logger.error('Failed to update user in database', { error, id });
      throw new Error('Failed to update user');
    }
  }

  /**
   * Upsert user (create or update)
   */
  static async upsert(xId: string, createData: UserCreateInput, updateData: UserUpdateInput) {
    try {
      const user = await prisma.user.upsert({
        where: { xId },
        create: {
          xId: createData.xId,
          username: createData.username,
          accessToken: createData.accessToken,
          refreshToken: createData.refreshToken,
          settings: createData.settings || {},
        },
        update: {
          username: updateData.username || createData.username,
          accessToken: updateData.accessToken || createData.accessToken,
          refreshToken: updateData.refreshToken || createData.refreshToken,
          settings: updateData.settings || createData.settings || {},
          updatedAt: new Date(),
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

      logger.debug('User upserted in database', {
        userId: user.id,
        username: user.username,
        xId: user.xId,
      });

      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const field = error.meta?.target as string[];
          if (field?.includes('username')) {
            throw new ConflictError('Username already taken');
          }
        }
      }

      logger.error('Failed to upsert user in database', {
        error,
        xId,
        username: createData.username,
      });
      throw new Error('Failed to create or update user');
    }
  }

  /**
   * Delete user
   */
  static async delete(id: string): Promise<void> {
    try {
      await prisma.user.delete({
        where: { id },
      });

      logger.debug('User deleted from database', { userId: id });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundError('User not found');
        }
      }

      logger.error('Failed to delete user from database', { error, id });
      throw new Error('Failed to delete user');
    }
  }

  /**
   * Find users with filters and pagination
   */
  static async findMany(filters: UserFilters = {}, options: PaginationOptions = {}) {
    try {
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;

      const skip = (page - 1) * limit;

      // Build where clause
      const where: Prisma.UserWhereInput = {};

      if (filters.username) {
        where.username = {
          contains: filters.username,
          mode: 'insensitive',
        };
      }

      if (filters.xId) {
        where.xId = filters.xId;
      }

      if (filters.createdAfter || filters.createdBefore) {
        where.createdAt = {};
        if (filters.createdAfter) {
          where.createdAt.gte = filters.createdAfter;
        }
        if (filters.createdBefore) {
          where.createdAt.lte = filters.createdBefore;
        }
      }

      if (filters.hasSubscription !== undefined) {
        if (filters.hasSubscription) {
          where.subscriptions = {
            some: {
              status: 'active',
            },
          };
        } else {
          where.subscriptions = {
            none: {},
          };
        }
      }

      if (filters.webhookSubscribed !== undefined) {
        where.settings = {
          path: ['webhookSubscribed'],
          equals: filters.webhookSubscribed,
        };
      }

      // Execute queries
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
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
                auditLogs: true,
              },
            },
          },
          orderBy: {
            [sortBy]: sortOrder,
          },
          skip,
          take: limit,
        }),
        prisma.user.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      logger.error('Failed to find users with filters', { error, filters, options });
      throw new Error('Failed to retrieve users');
    }
  }

  /**
   * Get user statistics
   */
  static async getStats(id: string) {
    try {
      const stats = await prisma.user.findUnique({
        where: { id },
        select: {
          _count: {
            select: {
              events: true,
              subscriptions: true,
              auditLogs: true,
            },
          },
          events: {
            select: {
              score: true,
              reviewed: true,
              createdAt: true,
            },
          },
          subscriptions: {
            select: {
              status: true,
              startedAt: true,
              endsAt: true,
            },
            orderBy: {
              startedAt: 'desc',
            },
            take: 1,
          },
        },
      });

      if (!stats) {
        throw new NotFoundError('User not found');
      }

      // Calculate additional statistics
      const highScoreEvents = stats.events.filter((event) => event.score >= 0.8).length;
      const reviewedEvents = stats.events.filter((event) => event.reviewed).length;
      const recentEvents = stats.events.filter(
        (event) => event.createdAt >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length;

      return {
        totalEvents: stats._count.events,
        totalSubscriptions: stats._count.subscriptions,
        totalAuditLogs: stats._count.auditLogs,
        highScoreEvents,
        reviewedEvents,
        recentEvents,
        currentSubscription: stats.subscriptions[0] || null,
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      logger.error('Failed to get user stats', { error, id });
      throw new Error('Failed to retrieve user statistics');
    }
  }

  /**
   * Update user settings
   */
  static async updateSettings(id: string, settings: Prisma.JsonValue) {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: {
          settings,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          settings: true,
          updatedAt: true,
        },
      });

      logger.debug('User settings updated', { userId: id });

      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundError('User not found');
        }
      }

      logger.error('Failed to update user settings', { error, id });
      throw new Error('Failed to update user settings');
    }
  }

  /**
   * Get user tokens (for internal use only)
   */
  static async getTokens(id: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          accessToken: true,
          refreshToken: true,
        },
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      return {
        accessToken: user.accessToken,
        refreshToken: user.refreshToken,
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      logger.error('Failed to get user tokens', { error, id });
      throw new Error('Failed to retrieve user tokens');
    }
  }

  /**
   * Update user tokens
   */
  static async updateTokens(id: string, accessToken: string, refreshToken: string) {
    try {
      await prisma.user.update({
        where: { id },
        data: {
          accessToken,
          refreshToken,
          updatedAt: new Date(),
        },
      });

      logger.debug('User tokens updated', { userId: id });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundError('User not found');
        }
      }

      logger.error('Failed to update user tokens', { error, id });
      throw new Error('Failed to update user tokens');
    }
  }

  /**
   * Check if user exists
   */
  static async exists(xId: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { xId },
        select: { id: true },
      });

      return !!user;
    } catch (error) {
      logger.error('Failed to check if user exists', { error, xId });
      return false;
    }
  }

  /**
   * Get users count
   */
  static async count(filters: UserFilters = {}): Promise<number> {
    try {
      const where: Prisma.UserWhereInput = {};

      if (filters.createdAfter || filters.createdBefore) {
        where.createdAt = {};
        if (filters.createdAfter) {
          where.createdAt.gte = filters.createdAfter;
        }
        if (filters.createdBefore) {
          where.createdAt.lte = filters.createdBefore;
        }
      }

      if (filters.hasSubscription !== undefined) {
        if (filters.hasSubscription) {
          where.subscriptions = {
            some: {
              status: 'active',
            },
          };
        } else {
          where.subscriptions = {
            none: {},
          };
        }
      }

      return await prisma.user.count({ where });
    } catch (error) {
      logger.error('Failed to count users', { error, filters });
      throw new Error('Failed to count users');
    }
  }
}
