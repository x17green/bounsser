import { PrismaClient } from '@prisma/client';

import { config } from '@/core/config';
import { logger } from '@/modules/shared/utils/logger';

// Extend PrismaClient with custom methods if needed
class ExtendedPrismaClient extends PrismaClient {
  constructor() {
    super({
      datasources: {
        db: {
          url: config.database.url,
        },
      },
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'event',
          level: 'info',
        },
        {
          emit: 'event',
          level: 'warn',
        },
      ],
      errorFormat: 'pretty',
    });

    // Enable query logging in development only
    if (config.app.isDevelopment) {
      // Note: Prisma v5+ uses different event handling
      // These will be implemented when we connect to actual database
      logger.info('Prisma client initialized in development mode');
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.error('Database health check failed:', error);
      return false;
    }
  }

  async getDatabaseInfo(): Promise<{
    version: string;
    size: string;
    activeConnections: number;
  }> {
    try {
      const versionResult = await this.$queryRaw<Array<{ version: string }>>`
        SELECT version()
      `;

      const sizeResult = await this.$queryRaw<Array<{ size: string }>>`
        SELECT pg_size_pretty(pg_database_size(current_database())) as size
      `;

      const connectionsResult = await this.$queryRaw<Array<{ count: number }>>`
        SELECT count(*) as count FROM pg_stat_activity WHERE state = 'active'
      `;

      return {
        version: versionResult[0]?.version || 'Unknown',
        size: sizeResult[0]?.size || 'Unknown',
        activeConnections: Number(connectionsResult[0]?.count) || 0,
      };
    } catch (error) {
      logger.error('Failed to get database info:', error);
      return {
        version: 'Unknown',
        size: 'Unknown',
        activeConnections: 0,
      };
    }
  }

  async getTableStats(): Promise<
    Array<{
      table: string;
      rowCount: number;
      size: string;
    }>
  > {
    try {
      const result = await this.$queryRaw<
        Array<{
          table_name: string;
          row_count: number;
          size: string;
        }>
      >`
        SELECT
          schemaname,
          tablename as table_name,
          n_tup_ins + n_tup_upd + n_tup_del as row_count,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
        FROM pg_stat_user_tables
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
      `;

      return result.map((row) => ({
        table: row.table_name,
        rowCount: Number(row.row_count) || 0,
        size: row.size,
      }));
    } catch (error) {
      logger.error('Failed to get table stats:', error);
      return [];
    }
  }

  async cleanupExpiredSessions(): Promise<number> {
    try {
      // Clean up expired user sessions (example cleanup task)
      const expiredDate = new Date(Date.now() - config.auth.session.maxAge);

      // This would be implemented based on your session storage strategy
      // For now, just return 0 as a placeholder
      return 0;
    } catch (error) {
      logger.error('Failed to cleanup expired sessions:', error);
      return 0;
    }
  }

  async cleanupOldAuditLogs(retentionDays: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const result = await this.auditLog.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
        },
      });

      logger.info(`Cleaned up ${result.count} old audit log entries`);
      return result.count;
    } catch (error) {
      logger.error('Failed to cleanup old audit logs:', error);
      return 0;
    }
  }

  async cleanupOldNotifications(retentionDays: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const result = await this.notification.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
          status: 'sent',
        },
      });

      logger.info(`Cleaned up ${result.count} old notification entries`);
      return result.count;
    } catch (error) {
      logger.error('Failed to cleanup old notifications:', error);
      return 0;
    }
  }
}

// Global variable to hold the singleton instance
declare global {
  const _prisma: ExtendedPrismaClient | undefined;
}

// Create singleton instance
const prisma = globalThis.__prisma ?? new ExtendedPrismaClient();

// In development, save the instance to global to prevent multiple instances
// due to hot reloading
if (config.app.isDevelopment) {
  globalThis.__prisma = prisma;
}

// Graceful shutdown handler
process.on('beforeExit', async () => {
  logger.info('Disconnecting from database...');
  await prisma.$disconnect();
});

// Handle specific database connection events
prisma
  .$connect()
  .then(() => {
    logger.info('Database connection established');
  })
  .catch((error) => {
    logger.error('Failed to connect to database:', error);
    process.exit(1);
  });

// Export the singleton instance
export { prisma };
export default prisma;

// Export types for convenience (available after database connection)
// Note: These types are generated by Prisma and will be available when connected to database
export type { Prisma } from '@prisma/client';

// Re-export Prisma client instance types when available
export type BouncerPrismaClient = typeof prisma;
// Transaction client type excludes connection management and middleware methods
// that are not available within transaction contexts
export type PrismaTransactionClient = Omit<
  typeof prisma,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
>;
