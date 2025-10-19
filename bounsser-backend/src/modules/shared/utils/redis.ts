import Redis from 'ioredis';

import { logger } from './logger';

import { config } from '@/core/config';

// Redis client configuration
const redisConfig = {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  db: config.redis.db,
  retryDelayOnFailover: 100,
  enableReadyCheck: true,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  family: 4,
  connectTimeout: 10000,
  commandTimeout: 5000,
};

// Create Redis client instances
const redisClient = new Redis(redisConfig);
const redisSubscriber = new Redis(redisConfig);
const redisPublisher = new Redis(redisConfig);

// Redis client for sessions (separate database)
const redisSessionClient = new Redis({
  ...redisConfig,
  db: 1, // Use database 1 for sessions
});

// Redis client for caching (separate database)
const redisCacheClient = new Redis({
  ...redisConfig,
  db: 2, // Use database 2 for caching
});

// Event handlers for main Redis client
redisClient.on('connect', () => {
  logger.info('Redis client connected');
});

redisClient.on('ready', () => {
  logger.info('Redis client ready');
});

redisClient.on('error', (error) => {
  logger.error('Redis client error:', error);
});

redisClient.on('close', () => {
  logger.info('Redis client connection closed');
});

redisClient.on('reconnecting', (delay) => {
  logger.info(`Redis client reconnecting in ${delay}ms`);
});

// Event handlers for subscriber
redisSubscriber.on('connect', () => {
  logger.info('Redis subscriber connected');
});

redisSubscriber.on('error', (error) => {
  logger.error('Redis subscriber error:', error);
});

// Event handlers for publisher
redisPublisher.on('connect', () => {
  logger.info('Redis publisher connected');
});

redisPublisher.on('error', (error) => {
  logger.error('Redis publisher error:', error);
});

// Event handlers for session client
redisSessionClient.on('connect', () => {
  logger.info('Redis session client connected');
});

redisSessionClient.on('error', (error) => {
  logger.error('Redis session client error:', error);
});

// Event handlers for cache client
redisCacheClient.on('connect', () => {
  logger.info('Redis cache client connected');
});

redisCacheClient.on('error', (error) => {
  logger.error('Redis cache client error:', error);
});

// Redis utility functions
export class RedisUtils {
  /**
   * Set a key with optional expiration
   */
  static async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const serializedValue = JSON.stringify(value);
    if (ttlSeconds) {
      await redisClient.setex(key, ttlSeconds, serializedValue);
    } else {
      await redisClient.set(key, serializedValue);
    }
  }

  /**
   * Get and parse a value
   */
  static async get<T = any>(key: string): Promise<T | null> {
    const value = await redisClient.get(key);
    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value);
    } catch (error) {
      logger.warn(`Failed to parse Redis value for key ${key}:`, error);
      return value as T;
    }
  }

  /**
   * Delete a key
   */
  static async del(key: string): Promise<number> {
    return redisClient.del(key);
  }

  /**
   * Check if key exists
   */
  static async exists(key: string): Promise<boolean> {
    const result = await redisClient.exists(key);
    return result === 1;
  }

  /**
   * Set expiration on existing key
   */
  static async expire(key: string, ttlSeconds: number): Promise<boolean> {
    const result = await redisClient.expire(key, ttlSeconds);
    return result === 1;
  }

  /**
   * Get TTL of a key
   */
  static async ttl(key: string): Promise<number> {
    return redisClient.ttl(key);
  }

  /**
   * Increment a counter
   */
  static async incr(key: string): Promise<number> {
    return redisClient.incr(key);
  }

  /**
   * Increment by a specific amount
   */
  static async incrby(key: string, increment: number): Promise<number> {
    return redisClient.incrby(key, increment);
  }

  /**
   * Decrement a counter
   */
  static async decr(key: string): Promise<number> {
    return redisClient.decr(key);
  }

  /**
   * Add to a set
   */
  static async sadd(key: string, ...members: string[]): Promise<number> {
    return redisClient.sadd(key, ...members);
  }

  /**
   * Get all members of a set
   */
  static async smembers(key: string): Promise<string[]> {
    return redisClient.smembers(key);
  }

  /**
   * Check if member exists in set
   */
  static async sismember(key: string, member: string): Promise<boolean> {
    const result = await redisClient.sismember(key, member);
    return result === 1;
  }

  /**
   * Remove from set
   */
  static async srem(key: string, ...members: string[]): Promise<number> {
    return redisClient.srem(key, ...members);
  }

  /**
   * Add to sorted set with score
   */
  static async zadd(key: string, score: number, member: string): Promise<number> {
    return redisClient.zadd(key, score, member);
  }

  /**
   * Get range from sorted set
   */
  static async zrange(
    key: string,
    start: number,
    stop: number,
    withScores = false
  ): Promise<string[]> {
    if (withScores) {
      return redisClient.zrange(key, start, stop, 'WITHSCORES');
    }
    return redisClient.zrange(key, start, stop);
  }

  /**
   * Remove from sorted set
   */
  static async zrem(key: string, ...members: string[]): Promise<number> {
    return redisClient.zrem(key, ...members);
  }

  /**
   * Get score of member in sorted set
   */
  static async zscore(key: string, member: string): Promise<string | null> {
    return redisClient.zscore(key, member);
  }

  /**
   * Push to list (left)
   */
  static async lpush(key: string, ...values: string[]): Promise<number> {
    return redisClient.lpush(key, ...values);
  }

  /**
   * Push to list (right)
   */
  static async rpush(key: string, ...values: string[]): Promise<number> {
    return redisClient.rpush(key, ...values);
  }

  /**
   * Pop from list (left)
   */
  static async lpop(key: string): Promise<string | null> {
    return redisClient.lpop(key);
  }

  /**
   * Pop from list (right)
   */
  static async rpop(key: string): Promise<string | null> {
    return redisClient.rpop(key);
  }

  /**
   * Get list range
   */
  static async lrange(key: string, start: number, stop: number): Promise<string[]> {
    return redisClient.lrange(key, start, stop);
  }

  /**
   * Get list length
   */
  static async llen(key: string): Promise<number> {
    return redisClient.llen(key);
  }

  /**
   * Set hash field
   */
  static async hset(key: string, field: string, value: any): Promise<number> {
    const serializedValue = JSON.stringify(value);
    return redisClient.hset(key, field, serializedValue);
  }

  /**
   * Get hash field
   */
  static async hget<T = any>(key: string, field: string): Promise<T | null> {
    const value = await redisClient.hget(key, field);
    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value);
    } catch (error) {
      logger.warn(`Failed to parse Redis hash value for key ${key}, field ${field}:`, error);
      return value as T;
    }
  }

  /**
   * Get all hash fields and values
   */
  static async hgetall<T = Record<string, any>>(key: string): Promise<T | null> {
    const hash = await redisClient.hgetall(key);
    if (!hash || Object.keys(hash).length === 0) {
      return null;
    }

    const result: Record<string, any> = {};
    for (const [field, value] of Object.entries(hash)) {
      try {
        result[field] = JSON.parse(value);
      } catch (error) {
        result[field] = value;
      }
    }

    return result as T;
  }

  /**
   * Delete hash field
   */
  static async hdel(key: string, ...fields: string[]): Promise<number> {
    return redisClient.hdel(key, ...fields);
  }

  /**
   * Check if hash field exists
   */
  static async hexists(key: string, field: string): Promise<boolean> {
    const result = await redisClient.hexists(key, field);
    return result === 1;
  }

  /**
   * Get all keys matching pattern
   */
  static async keys(pattern: string): Promise<string[]> {
    return redisClient.keys(pattern);
  }

  /**
   * Scan keys with cursor (better than KEYS for large datasets)
   */
  static async scan(
    cursor: string = '0',
    pattern?: string,
    count?: number
  ): Promise<[string, string[]]> {
    const args: (string | number)[] = [cursor];
    if (pattern) {
      args.push('MATCH', pattern);
    }
    if (count) {
      args.push('COUNT', count);
    }
    return redisClient.scan(cursor, 'MATCH', pattern || '*', 'COUNT', count || 10) as Promise<
      [string, string[]]
    >;
  }

  /**
   * Execute multiple commands in a pipeline
   */
  static async pipeline(commands: Array<[string, ...any[]]>): Promise<any[]> {
    const pipeline = redisClient.pipeline();
    commands.forEach(([command, ...args]) => {
      (pipeline as any)[command](...args);
    });
    const results = await pipeline.exec();
    return (
      results?.map(([error, result]) => {
        if (error) {
          throw error;
        }
        return result;
      }) || []
    );
  }

  /**
   * Execute commands in a transaction
   */
  static async multi(commands: Array<[string, ...any[]]>): Promise<any[]> {
    const multi = redisClient.multi();
    commands.forEach(([command, ...args]) => {
      (multi as any)[command](...args);
    });
    const results = await multi.exec();
    return (
      results?.map(([error, result]) => {
        if (error) {
          throw error;
        }
        return result;
      }) || []
    );
  }

  /**
   * Flush all data from current database
   */
  static async flushdb(): Promise<string> {
    return redisClient.flushdb();
  }

  /**
   * Get Redis info
   */
  static async info(section?: string): Promise<string> {
    return section ? redisClient.info(section) : redisClient.info();
  }

  /**
   * Ping Redis server
   */
  static async ping(): Promise<string> {
    return redisClient.ping();
  }
}

// Cache utility with namespacing
export class CacheUtils {
  private static prefix = 'bouncer:cache:';

  static createKey(...parts: string[]): string {
    return `${this.prefix}${parts.join(':')}`;
  }

  static async get<T = any>(key: string): Promise<T | null> {
    const fullKey = this.createKey(key);
    return RedisUtils.get<T>(fullKey);
  }

  static async set(key: string, value: any, ttlSeconds = 3600): Promise<void> {
    const fullKey = this.createKey(key);
    return RedisUtils.set(fullKey, value, ttlSeconds);
  }

  static async del(key: string): Promise<number> {
    const fullKey = this.createKey(key);
    return RedisUtils.del(fullKey);
  }

  static async exists(key: string): Promise<boolean> {
    const fullKey = this.createKey(key);
    return RedisUtils.exists(fullKey);
  }

  static async remember<T>(key: string, factory: () => Promise<T>, ttlSeconds = 3600): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, ttlSeconds);
    return value;
  }

  static async forget(key: string): Promise<number> {
    return this.del(key);
  }

  static async flush(): Promise<string[]> {
    const keys = await RedisUtils.keys(`${this.prefix}*`);
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
    return keys;
  }
}

// Rate limiting utility
export class RateLimitUtils {
  private static prefix = 'bouncer:ratelimit:';

  static createKey(identifier: string, window: string): string {
    return `${this.prefix}${identifier}:${window}`;
  }

  static async checkLimit(
    identifier: string,
    limit: number,
    windowSeconds: number
  ): Promise<{ allowed: boolean; remaining: number; resetTime: Date }> {
    const now = Date.now();
    const window = Math.floor(now / (windowSeconds * 1000));
    const key = this.createKey(identifier, window.toString());

    const current = await RedisUtils.incr(key);

    if (current === 1) {
      await RedisUtils.expire(key, windowSeconds);
    }

    const remaining = Math.max(0, limit - current);
    const resetTime = new Date((window + 1) * windowSeconds * 1000);

    return {
      allowed: current <= limit,
      remaining,
      resetTime,
    };
  }

  static async getRemainingRequests(
    identifier: string,
    limit: number,
    windowSeconds: number
  ): Promise<number> {
    const now = Date.now();
    const window = Math.floor(now / (windowSeconds * 1000));
    const key = this.createKey(identifier, window.toString());

    const current = await redisClient.get(key);
    const used = current ? parseInt(current, 10) : 0;

    return Math.max(0, limit - used);
  }
}

// Session utility
export class SessionUtils {
  private static prefix = 'bouncer:session:';

  static createKey(sessionId: string): string {
    return `${this.prefix}${sessionId}`;
  }

  static async get(sessionId: string): Promise<any> {
    const key = this.createKey(sessionId);
    const value = await redisSessionClient.get(key);
    return value ? JSON.parse(value) : null;
  }

  static async set(sessionId: string, data: any, ttlSeconds: number): Promise<void> {
    const key = this.createKey(sessionId);
    const value = JSON.stringify(data);
    await redisSessionClient.setex(key, ttlSeconds, value);
  }

  static async destroy(sessionId: string): Promise<number> {
    const key = this.createKey(sessionId);
    return redisSessionClient.del(key);
  }

  static async touch(sessionId: string, ttlSeconds: number): Promise<boolean> {
    const key = this.createKey(sessionId);
    const result = await redisSessionClient.expire(key, ttlSeconds);
    return result === 1;
  }
}

// Health check for Redis
export const redisHealthCheck = async (): Promise<{
  healthy: boolean;
  latency: number;
  error?: string;
}> => {
  const start = Date.now();

  try {
    await redisClient.ping();
    const latency = Date.now() - start;

    return {
      healthy: true,
      latency,
    };
  } catch (error) {
    const latency = Date.now() - start;

    return {
      healthy: false,
      latency,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

// Graceful shutdown
export const closeRedisConnections = async (): Promise<void> => {
  logger.info('Closing Redis connections...');

  const promises = [
    redisClient.quit(),
    redisSubscriber.quit(),
    redisPublisher.quit(),
    redisSessionClient.quit(),
    redisCacheClient.quit(),
  ];

  try {
    await Promise.all(promises);
    logger.info('All Redis connections closed successfully');
  } catch (error) {
    logger.error('Error closing Redis connections:', error);
  }
};

// Export everything
export {
  redisClient as default,
  redisClient,
  redisSubscriber,
  redisPublisher,
  redisSessionClient,
  redisCacheClient,
};
