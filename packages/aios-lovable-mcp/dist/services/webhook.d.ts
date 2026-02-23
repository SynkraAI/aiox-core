/**
 * Webhook Service for Real-time Job Updates
 *
 * Sends job status updates to configured webhook URLs.
 * Implements retry logic and exponential backoff.
 */
interface WebhookPayload {
    job_id: string;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    progress: number;
    output?: unknown;
    error?: {
        code: string;
        message: string;
    };
    timestamp: string;
}
export declare class WebhookService {
    sendUpdate(webhookUrl: string, payload: WebhookPayload, retries?: number): Promise<boolean>;
    broadcastUpdate(webhookUrls: string[], payload: WebhookPayload): Promise<Map<string, boolean>>;
    private generateSignature;
}
export declare const webhookService: WebhookService;
export {};
//# sourceMappingURL=webhook.d.ts.map