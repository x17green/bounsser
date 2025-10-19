// Global teardown function that runs once after all tests
export default async function globalTeardown(): Promise<void> {
  console.log('🧹 Running global test teardown...');

  try {
    // Close any remaining database connections
    if ((global as any).__PRISMA__) {
      await (global as any).__PRISMA__.$disconnect();
      console.log('📦 Prisma client disconnected');
    }

    // Close Redis connections
    if ((global as any).__REDIS_CLIENT__) {
      await (global as any).__REDIS_CLIENT__.quit();
      console.log('🔴 Redis client disconnected');
    }

    if ((global as any).__REDIS_CACHE_CLIENT__) {
      await (global as any).__REDIS_CACHE_CLIENT__.quit();
      console.log('🔴 Redis cache client disconnected');
    }

    if ((global as any).__REDIS_SESSION_CLIENT__) {
      await (global as any).__REDIS_SESSION_CLIENT__.quit();
      console.log('🔴 Redis session client disconnected');
    }

    // Close any queue connections
    if ((global as any).__QUEUES__) {
      for (const [name, queue] of Object.entries((global as any).__QUEUES__)) {
        await (queue as any).close();
        console.log(`🔄 Queue ${name} closed`);
      }
    }

    // Close any worker connections
    if ((global as any).__WORKERS__) {
      for (const [name, worker] of Object.entries((global as any).__WORKERS__)) {
        await (worker as any).close();
        console.log(`👷 Worker ${name} closed`);
      }
    }

    // Close any HTTP servers
    if ((global as any).__SERVER__) {
      await new Promise<void>((resolve) => {
        (global as any).__SERVER__.close(() => {
          console.log('🌐 HTTP server closed');
          resolve();
        });
      });
    }

    // Close metrics server
    if ((global as any).__METRICS_SERVER__) {
      await new Promise<void>((resolve) => {
        (global as any).__METRICS_SERVER__.close(() => {
          console.log('📊 Metrics server closed');
          resolve();
        });
      });
    }

    // Clean up temporary files or test artifacts
    if ((global as any).__TEST_TEMP_FILES__) {
      const fs = await import('fs/promises');
      for (const filePath of (global as any).__TEST_TEMP_FILES__) {
        try {
          await fs.unlink(filePath);
          console.log(`🗑️ Cleaned up temp file: ${filePath}`);
        } catch (_error) {
          // Ignore errors when cleaning up temp files
        }
      }
    }

    // Force garbage collection if available
    if ((global as any).gc) {
      (global as any).gc();
      console.log('🗑️ Garbage collection triggered');
    }

    console.log('✅ Global test teardown completed');
  } catch (error) {
    console.error('❌ Error during global teardown:', error);
    throw error;
  }
}

// Extend global types for test cleanup tracking
declare global {
  // eslint-disable-next-line no-var
  var __PRISMA__: any;
  // eslint-disable-next-line no-var
  var __REDIS_CLIENT__: any;
  // eslint-disable-next-line no-var
  var __REDIS_CACHE_CLIENT__: any;
  // eslint-disable-next-line no-var
  var __REDIS_SESSION_CLIENT__: any;
  // eslint-disable-next-line no-var
  var __QUEUES__: Record<string, any>;
  // eslint-disable-next-line no-var
  var __WORKERS__: Record<string, any>;
  // eslint-disable-next-line no-var
  var __SERVER__: any;
  // eslint-disable-next-line no-var
  var __METRICS_SERVER__: any;
  // eslint-disable-next-line no-var
  var __TEST_TEMP_FILES__: string[];
}
