/**
 * Webhook Service for Real-time Job Updates
 *
 * Sends job status updates to configured webhook URLs.
 * Implements retry logic and exponential backoff.
 */

import type { JobResult } from '../types/lovable.js';

interface WebhookPayload {
  job_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  output?: unknown;
  error?: { code: string; message: string };
  timestamp: string;
}

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

export class WebhookService {
  async sendUpdate(
    webhookUrl: string,
    payload: WebhookPayload,
    retries = 0
  ): Promise<boolean> {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'aios-lovable-mcp/0.1.0',
          'X-AIOS-Signature': this.generateSignature(payload),
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log(`[Webhook] ✓ Delivered to ${webhookUrl}`);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[Webhook] ✗ Failed (attempt ${retries + 1}/${MAX_RETRIES}): ${message}`);

      if (retries < MAX_RETRIES) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, retries);
        console.log(`[Webhook] ⏳ Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.sendUpdate(webhookUrl, payload, retries + 1);
      }

      console.error(`[Webhook] 🚫 Max retries exceeded for ${webhookUrl}`);
      return false;
    }
  }

  async broadcastUpdate(
    webhookUrls: string[],
    payload: WebhookPayload
  ): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();

    const promises = webhookUrls.map(async (url) => {
      const success = await this.sendUpdate(url, payload);
      results.set(url, success);
    });

    await Promise.all(promises);
    return results;
  }

  private generateSignature(payload: WebhookPayload): string {
    // In production, this would use HMAC-SHA256 with a shared secret
    // For now, return a simple hash
    const json = JSON.stringify(payload);
    let hash = 0;
    for (let i = 0; i < json.length; i++) {
      const char = json.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return `sha256=${Math.abs(hash).toString(16)}`;
  }
}

export const webhookService = new WebhookService();
