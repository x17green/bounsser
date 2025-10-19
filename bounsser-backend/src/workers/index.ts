import { Queue, Worker, Job, QueueEvents } from 'bullmq';

import { redisClient } from '@/modules/shared/utils/redis';
import { config } from '@/core/config';
import { logger, logQueue } from '@/modules/shared/utils/logger';
import { recordQueueJobMetric, updateQueueSizeMetric } from '@/core/middleware/metrics';

// Worker processors will be implemented in Phase 1
// import { processStreamJob } from './stream.worker';
// import { processWebhookJob } from './webhook.worker';
// import { processScoringJob } from './scoring.worker';
// import { processNotificationJob } from './notification.worker';

// Queue names
export const QUEUE_NAMES = {
  STREAM: 'stream-processing',
  WEBHOOK: 'webhook-processing',
  SCORING: 'scoring-engine',
  NOTIFICATION: 'notifications',
} as const;

// Job types
export const JOB_TYPES = {
  STREAM: {
    PROCESS_TWEET: 'process-tweet',
    PROCESS_USER_UPDATE: 'process-user-update',
    PROCESS_FOLLOW_EVENT: 'process-follow-event',
  },
  WEBHOOK: {
    PROCESS_MENTION: 'process-mention',
    PROCESS_REPLY: 'process-reply',
    PROCESS_DM: 'process-dm',
    PROCESS_FOLLOW: 'process-follow',
  },
  SCORING: {
    ANALYZE_ACCOUNT: 'analyze-account',
    EXTRACT_FEATURES: 'extract-features',
    CALCULATE_SCORE: 'calculate-score',
    UPDATE_SCORE: 'update-score',
  },
  NOTIFICATION: {
    SEND_EMAIL: 'send-email',
    SEND_SLACK: 'send-slack',
    SEND_DISCORD: 'send-discord',
    SEND_DM: 'send-dm',
    SEND_WEBHOOK: 'send-webhook',
  },
} as const;

// Queue configurations
const queueConfig = {
  connection: redisClient,
  defaultJobOptions: {
    removeOnComplete: 50,
    removeOnFail: 100,
    attempts: config.queues.retry.maxRetries,
    backoff: {
      type: 'exponential',
      delay: config.queues.retry.delay,
    },
  },
};

// Worker configurations
const workerConfig = {
  connection: redisClient,
  removeOnComplete: { count: 50 },
  removeOnFail: { count: 100 },
};

// Create queues
export const queues = {
  stream: new Queue(QUEUE_NAMES.STREAM, queueConfig),
  webhook: new Queue(QUEUE_NAMES.WEBHOOK, queueConfig),
  scoring: new Queue(QUEUE_NAMES.SCORING, queueConfig),
  notification: new Queue(QUEUE_NAMES.NOTIFICATION, queueConfig),
};

// Create workers
export const workers: Worker[] = [];

// Create queue events listeners
export const queueEvents: QueueEvents[] = [];

// Job processors mapping (placeholders for now)
const jobProcessors = {
  [QUEUE_NAMES.STREAM]: async (job: Job) => {
    logger.info(`Processing stream job: ${job.name}`, { jobId: job.id });
    // TODO: Implement processStreamJob in Phase 1
    return { status: 'placeholder', jobId: job.id };
  },
  [QUEUE_NAMES.WEBHOOK]: async (job: Job) => {
    logger.info(`Processing webhook job: ${job.name}`, { jobId: job.id });
    // TODO: Implement processWebhookJob in Phase 1
    return { status: 'placeholder', jobId: job.id };
  },
  [QUEUE_NAMES.SCORING]: async (job: Job) => {
    logger.info(`Processing scoring job: ${job.name}`, { jobId: job.id });
    // TODO: Implement processScoringJob in Phase 1
    return { status: 'placeholder', jobId: job.id };
  },
  [QUEUE_NAMES.NOTIFICATION]: async (job: Job) => {
    logger.info(`Processing notification job: ${job.name}`, { jobId: job.id });
    // TODO: Implement processNotificationJob in Phase 1
    return { status: 'placeholder', jobId: job.id };
  },
};

// Concurrency mapping
const concurrencyMap = {
  [QUEUE_NAMES.STREAM]: config.queues.concurrency.stream,
  [QUEUE_NAMES.WEBHOOK]: config.queues.concurrency.webhook,
  [QUEUE_NAMES.SCORING]: config.queues.concurrency.scoring,
  [QUEUE_NAMES.NOTIFICATION]: config.queues.concurrency.notification,
};

/**
 * Initialize all queues and workers
 */
export async function initializeQueues(): Promise<void> {
  try {
    logger.info('Initializing BullMQ queues and workers...');

    // Initialize workers for each queue
    for (const [queueName, queue] of Object.entries(queues)) {
      const processor = jobProcessors[queueName as keyof typeof jobProcessors];
      const concurrency = concurrencyMap[queueName as keyof typeof concurrencyMap];

      if (!processor) {
        logger.warn(`No processor found for queue: ${queueName}`);
        continue;
      }

      // Create worker
      const worker = new Worker(
        queueName,
        async (job: Job) => {
          const startTime = Date.now();
          let success = false;

          try {
            logQueue.jobProcessing(queueName, job.name, job.id!, job.attemptsMade + 1);

            // Process the job
            const result = await processor(job);

            success = true;
            const duration = Date.now() - startTime;

            logQueue.jobCompleted(queueName, job.name, job.id!, duration);
            recordQueueJobMetric(queueName, job.name, duration, success);

            return result;
          } catch (error) {
            success = false;
            const duration = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : String(error);

            logQueue.jobFailed(queueName, job.name, job.id!, errorMessage, job.attemptsMade + 1);
            recordQueueJobMetric(queueName, job.name, duration, success);

            // Check if we should retry
            if (job.attemptsMade < (job.opts.attempts || 0) - 1) {
              const nextAttempt = new Date(Date.now() + (job.opts.delay || 0));
              logQueue.jobRetry(queueName, job.name, job.id!, nextAttempt);
            }

            throw error;
          }
        },
        {
          ...workerConfig,
          concurrency,
        }
      );

      // Worker event handlers
      worker.on('ready', () => {
        logger.info(`Worker ready for queue: ${queueName}`);
      });

      worker.on('error', (error) => {
        logger.error(`Worker error for queue ${queueName}:`, error);
      });

      worker.on('failed', (job, error) => {
        logger.error(`Job failed in queue ${queueName}:`, {
          jobId: job?.id,
          jobName: job?.name,
          error: error.message,
          attempts: job?.attemptsMade,
        });
      });

      worker.on('stalled', (jobId) => {
        logger.warn(`Job stalled in queue ${queueName}:`, { jobId });
      });

      workers.push(worker);

      // Create queue events listener
      const events = new QueueEvents(queueName, { connection: redisClient });

      events.on('waiting', ({ jobId }) => {
        logger.debug(`Job waiting in queue ${queueName}:`, { jobId });
      });

      events.on('active', ({ jobId }) => {
        logger.debug(`Job active in queue ${queueName}:`, { jobId });
      });

      events.on('completed', ({ jobId, returnvalue }) => {
        logger.debug(`Job completed in queue ${queueName}:`, { jobId, returnvalue });
      });

      events.on('failed', ({ jobId, failedReason }) => {
        logger.error(`Job failed in queue ${queueName}:`, { jobId, failedReason });
      });

      events.on('progress', ({ jobId, data }) => {
        logger.debug(`Job progress in queue ${queueName}:`, { jobId, progress: data });
      });

      queueEvents.push(events);

      logger.info(`Initialized worker for queue: ${queueName} with concurrency: ${concurrency}`);
    }

    // Set up queue size monitoring
    setupQueueMonitoring();

    logger.info('All BullMQ queues and workers initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize queues:', error);
    throw error;
  }
}

/**
 * Close all queues and workers
 */
export async function closeQueues(): Promise<void> {
  try {
    logger.info('Closing BullMQ queues and workers...');

    // Close all workers
    await Promise.all(workers.map((worker) => worker.close()));

    // Close all queue events
    await Promise.all(queueEvents.map((events) => events.close()));

    // Close all queues
    await Promise.all(Object.values(queues).map((queue) => queue.close()));

    logger.info('All BullMQ queues and workers closed successfully');
  } catch (error) {
    logger.error('Error closing queues:', error);
    throw error;
  }
}

/**
 * Add a job to a specific queue
 */
export async function addJob<T = any>(
  queueName: keyof typeof QUEUE_NAMES,
  jobType: string,
  data: T,
  options: {
    delay?: number;
    priority?: number;
    attempts?: number;
    removeOnComplete?: number | boolean;
    removeOnFail?: number | boolean;
  } = {}
): Promise<Job<T>> {
  const queue = queues[queueName.toLowerCase() as keyof typeof queues];

  if (!queue) {
    throw new Error(`Queue not found: ${queueName}`);
  }

  const job = await queue.add(jobType, data, {
    ...options,
    attempts: options.attempts ?? config.queues.retry.maxRetries,
  });

  logQueue.jobAdded(queue.name, jobType, job.id!, options.delay);

  return job;
}

/**
 * Get queue statistics
 */
export async function getQueueStats(queueName: keyof typeof queues) {
  const queue = queues[queueName];

  if (!queue) {
    throw new Error(`Queue not found: ${queueName}`);
  }

  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaiting(),
    queue.getActive(),
    queue.getCompleted(),
    queue.getFailed(),
    queue.getDelayed(),
  ]);

  return {
    waiting: waiting.length,
    active: active.length,
    completed: completed.length,
    failed: failed.length,
    delayed: delayed.length,
    total: waiting.length + active.length + delayed.length,
  };
}

/**
 * Get all queue statistics
 */
export async function getAllQueueStats() {
  const stats: Record<string, any> = {};

  for (const queueName of Object.keys(queues) as (keyof typeof queues)[]) {
    try {
      stats[queueName] = await getQueueStats(queueName);
    } catch (error) {
      logger.error(`Error getting stats for queue ${queueName}:`, error);
      stats[queueName] = { error: error instanceof Error ? error.message : String(error) };
    }
  }

  return stats;
}

/**
 * Pause a queue
 */
export async function pauseQueue(queueName: keyof typeof queues): Promise<void> {
  const queue = queues[queueName];

  if (!queue) {
    throw new Error(`Queue not found: ${queueName}`);
  }

  await queue.pause();
  logger.info(`Queue paused: ${queueName}`);
}

/**
 * Resume a queue
 */
export async function resumeQueue(queueName: keyof typeof queues): Promise<void> {
  const queue = queues[queueName];

  if (!queue) {
    throw new Error(`Queue not found: ${queueName}`);
  }

  await queue.resume();
  logger.info(`Queue resumed: ${queueName}`);
}

/**
 * Clean a queue (remove completed and failed jobs)
 */
export async function cleanQueue(
  queueName: keyof typeof queues,
  age: number = 24 * 60 * 60 * 1000, // 24 hours
  limit: number = 100
): Promise<void> {
  const queue = queues[queueName];

  if (!queue) {
    throw new Error(`Queue not found: ${queueName}`);
  }

  const [completedCount, failedCount] = await Promise.all([
    queue.clean(age, limit, 'completed'),
    queue.clean(age, limit, 'failed'),
  ]);

  logger.info(`Cleaned queue ${queueName}:`, {
    completed: completedCount,
    failed: failedCount,
  });
}

/**
 * Setup queue monitoring for metrics
 */
function setupQueueMonitoring(): void {
  // Update queue size metrics every 30 seconds
  setInterval(async () => {
    for (const [queueName, queue] of Object.entries(queues)) {
      try {
        const stats = await getQueueStats(queueName as keyof typeof queues);
        updateQueueSizeMetric(queueName, stats.total);
      } catch (error) {
        logger.error(`Error updating queue size metric for ${queueName}:`, error);
      }
    }
  }, 30000);
}

/**
 * Health check for queues
 */
export async function queueHealthCheck(): Promise<{
  healthy: boolean;
  queues: Record<string, { healthy: boolean; error?: string }>;
}> {
  const queueHealth: Record<string, { healthy: boolean; error?: string }> = {};
  let overallHealthy = true;

  for (const [queueName, queue] of Object.entries(queues)) {
    try {
      // Try to get queue status
      await queue.getWaiting(0, 0);
      queueHealth[queueName] = { healthy: true };
    } catch (error) {
      queueHealth[queueName] = {
        healthy: false,
        error: error instanceof Error ? error.message : String(error),
      };
      overallHealthy = false;
    }
  }

  return {
    healthy: overallHealthy,
    queues: queueHealth,
  };
}

// Convenience functions for adding specific job types
export const addStreamJob = (jobType: string, data: any, options?: any) =>
  addJob('STREAM', jobType, data, options);

export const addWebhookJob = (jobType: string, data: any, options?: any) =>
  addJob('WEBHOOK', jobType, data, options);

export const addScoringJob = (jobType: string, data: any, options?: any) =>
  addJob('SCORING', jobType, data, options);

export const addNotificationJob = (jobType: string, data: any, options?: any) =>
  addJob('NOTIFICATION', jobType, data, options);

// Export types
export type QueueName = keyof typeof QUEUE_NAMES;
export type StreamJobType = keyof typeof JOB_TYPES.STREAM;
export type WebhookJobType = keyof typeof JOB_TYPES.WEBHOOK;
export type ScoringJobType = keyof typeof JOB_TYPES.SCORING;
export type NotificationJobType = keyof typeof JOB_TYPES.NOTIFICATION;
