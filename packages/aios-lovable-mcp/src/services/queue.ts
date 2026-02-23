import { Queue, Worker, QueueEvents } from 'bullmq';
import { createClient } from 'redis';
import { nanoid } from 'nanoid';
import type { JobData, JobResult } from '../types/lovable.js';

// Create Redis clients for BullMQ
let redisClient: any = null;
try {
  redisClient = createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    socket: {
      reconnectStrategy: (retries: number) => Math.min(retries * 50, 500),
    },
  } as any);

  redisClient.on('error', (err: Error) => {
    console.error('[Queue] Redis connection error:', err.message);
  });

  redisClient.on('connect', () => {
    console.error('[Queue] ✅ Connected to Redis');
  });
} catch (err) {
  console.error('[Queue] ⚠️  Failed to create Redis client:', err instanceof Error ? err.message : String(err));
  console.error('[Queue] Running in degraded mode without queue persistence');
}

export let jobQueue: Queue<JobData, JobResult> | null = null;
export let queueEvents: QueueEvents | null = null;

if (redisClient) {
  try {
    jobQueue = new Queue<JobData, JobResult>('aios-jobs', {
      connection: redisClient as any,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: {
          age: 3600, // Keep completed jobs for 1 hour
        },
        removeOnFail: {
          age: 86400, // Keep failed jobs for 24 hours
        },
      },
    });

    queueEvents = new QueueEvents('aios-jobs', { connection: redisClient as any });
    console.error('[Queue] ✅ Job queue initialized');
  } catch (err) {
    console.error('[Queue] Failed to initialize job queue:', err instanceof Error ? err.message : String(err));
  }
} else {
  console.error('[Queue] ⚠️  Job queue disabled - Redis not available');
}

// Job status tracking
interface JobStatusInfo {
  status: string;
  progress: number;
  result?: JobResult;
  error?: string;
}

const jobStatus = new Map<string, JobStatusInfo>();

export async function createJob(data: JobData): Promise<string> {
  if (!jobQueue) {
    throw new Error('Job queue not available - Redis not configured');
  }

  const jobId = nanoid(12);
  const job = await jobQueue.add(`task-${data.tool}`, data, {
    jobId,
    priority: data.priority ? (data.priority as any) : 'normal',
  });

  jobStatus.set(jobId, { status: 'queued', progress: 0 });

  return jobId;
}

export async function getJobStatus(jobId: string) {
  const cached = jobStatus.get(jobId);
  if (!cached) {
    return null;
  }

  if (!jobQueue) {
    return cached;
  }

  const job = await jobQueue.getJob(jobId);
  if (!job) {
    return cached;
  }

  const state = await job.getState();
  let progressValue = 0;
  try {
    const progressData = (job as any).progress;
    if (typeof progressData === 'number') {
      progressValue = progressData;
    } else if (typeof progressData === 'object' && progressData && 'progress' in progressData) {
      progressValue = (progressData as any).progress;
    }
  } catch {
    progressValue = 0;
  }

  return {
    status: state,
    progress: progressValue || 0,
    result: (job.returnvalue as unknown) as JobResult | undefined,
    error: (job.failedReason as string | undefined) || undefined,
  };
}

export async function getJobResult(jobId: string): Promise<JobResult | null> {
  if (!jobQueue) {
    return null;
  }

  const job = await jobQueue.getJob(jobId);
  if (!job) {
    return null;
  }

  const state = await job.getState();
  if (state === 'completed') {
    return (job.returnvalue as unknown) as JobResult;
  }

  if (state === 'failed') {
    throw new Error(`Job failed: ${job.failedReason || 'Unknown error'}`);
  }

  return null;
}

export async function waitForJob(jobId: string, timeout = 300000): Promise<JobResult> {
  if (!jobQueue) {
    throw new Error('Job queue not available - Redis not configured');
  }

  const job = await jobQueue.getJob(jobId);
  if (!job) {
    throw new Error(`Job not found: ${jobId}`);
  }

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Job timeout after ${timeout}ms`));
    }, timeout);

    if (queueEvents) {
      queueEvents.on('completed', (event: any) => {
        if (event.jobId === jobId) {
          clearTimeout(timer);
          resolve((event.returnvalue as unknown) as JobResult);
        }
      });

      queueEvents.on('failed', (event: any) => {
        if (event.jobId === jobId) {
          clearTimeout(timer);
          reject(new Error(`Job failed: ${event.failedReason || 'Unknown error'}`));
        }
      });
    }

    // Check if already completed
    job.isCompleted().then((completed: boolean) => {
      if (completed) {
        clearTimeout(timer);
        resolve((job.returnvalue as unknown) as JobResult);
      }
    });
  });
}

// Register job processor
export function registerJobProcessor(
  handler: (job: any) => Promise<JobResult>
): void {
  if (!redisClient) {
    console.error('[Queue] Cannot register job processor - Redis not available');
    return;
  }

  new Worker('aios-jobs', async (job) => {
    const jobId = job.id as string;
    try {
      const status = jobStatus.get(jobId);
      if (status) {
        status.status = 'processing';
      }

      const result = await handler(job);

      if (status) {
        status.status = 'completed';
        status.result = result;
      }

      return result;
    } catch (error) {
      const status = jobStatus.get(jobId);
      if (status) {
        status.status = 'failed';
        status.error = error instanceof Error ? error.message : String(error);
      }
      throw error;
    }
  }, {
    connection: redisClient as any,
    concurrency: parseInt(process.env.QUEUE_CONCURRENCY || '5', 10),
  });
}

export async function cleanup() {
  await redisClient.quit();
}
