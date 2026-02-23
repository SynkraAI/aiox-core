import { Queue, QueueEvents } from 'bullmq';
import type { JobData, JobResult } from '../types/lovable.js';
export declare let jobQueue: Queue<JobData, JobResult> | null;
export declare let queueEvents: QueueEvents | null;
interface JobStatusInfo {
    status: string;
    progress: number;
    result?: JobResult;
    error?: string;
}
export declare function createJob(data: JobData): Promise<string>;
export declare function getJobStatus(jobId: string): Promise<JobStatusInfo | null>;
export declare function getJobResult(jobId: string): Promise<JobResult | null>;
export declare function waitForJob(jobId: string, timeout?: number): Promise<JobResult>;
export declare function registerJobProcessor(handler: (job: any) => Promise<JobResult>): void;
export declare function cleanup(): Promise<void>;
export {};
//# sourceMappingURL=queue.d.ts.map