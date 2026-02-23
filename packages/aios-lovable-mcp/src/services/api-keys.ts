/**
 * API Key Management & Rate Limiting Service
 *
 * Manages API keys for Lovable integration and enforces rate limits.
 * Keys are stored in environment variables or a configuration file.
 */

interface ApiKeyInfo {
  key: string;
  name: string;
  createdAt: Date;
  lastUsed?: Date;
  rateLimit: {
    requestsPerMinute: number;
    requestsPerDay: number;
  };
  quotaUsed: {
    today: number;
    thisMinute: number;
  };
}

export class ApiKeyManager {
  private keys = new Map<string, ApiKeyInfo>();
  private requestLog = new Map<string, number[]>(); // key -> timestamps

  constructor() {
    this.loadKeysFromEnvironment();
  }

  private loadKeysFromEnvironment(): void {
    // Load from AIOS_API_KEYS env var (comma-separated or JSON)
    const keysEnv = process.env.AIOS_API_KEYS || '';
    if (!keysEnv) {
      console.warn('[ApiKeyManager] No API keys configured. Running in demo mode.');
      return;
    }

    try {
      // Try parsing as JSON first
      const keysData = JSON.parse(keysEnv);
      Object.entries(keysData).forEach(([name, key]) => {
        this.addKey(key as string, name);
      });
    } catch {
      // Fall back to comma-separated format
      const keyPairs = keysEnv.split(',');
      keyPairs.forEach((pair) => {
        const [name, key] = pair.trim().split(':');
        if (name && key) {
          this.addKey(key.trim(), name.trim());
        }
      });
    }
  }

  private addKey(key: string, name: string): void {
    this.keys.set(key, {
      key,
      name,
      createdAt: new Date(),
      rateLimit: {
        requestsPerMinute: 60,
        requestsPerDay: 10000,
      },
      quotaUsed: {
        today: 0,
        thisMinute: 0,
      },
    });
  }

  validateKey(key: string): { valid: boolean; error?: string } {
    if (!key) {
      return { valid: false, error: 'API key required' };
    }

    const keyInfo = this.keys.get(key);
    if (!keyInfo) {
      return { valid: false, error: 'Invalid API key' };
    }

    return { valid: true };
  }

  checkRateLimit(key: string): { allowed: boolean; error?: string; remaining?: number } {
    const keyInfo = this.keys.get(key);
    if (!keyInfo) {
      return { allowed: false, error: 'Invalid API key' };
    }

    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const oneDayAgo = now - 86400000;

    // Clean old timestamps
    const timestamps = this.requestLog.get(key) || [];
    const recentTimestamps = timestamps.filter((ts) => ts > oneMinuteAgo);
    this.requestLog.set(key, recentTimestamps);

    // Check per-minute limit
    if (recentTimestamps.length >= keyInfo.rateLimit.requestsPerMinute) {
      return {
        allowed: false,
        error: `Rate limit exceeded: ${keyInfo.rateLimit.requestsPerMinute} requests per minute`,
      };
    }

    // Check per-day limit
    const todayTimestamps = timestamps.filter((ts) => ts > oneDayAgo);
    if (todayTimestamps.length >= keyInfo.rateLimit.requestsPerDay) {
      return {
        allowed: false,
        error: `Daily quota exceeded: ${keyInfo.rateLimit.requestsPerDay} requests per day`,
      };
    }

    // Record this request
    recentTimestamps.push(now);
    this.requestLog.set(key, recentTimestamps);

    // Update key info
    keyInfo.quotaUsed.thisMinute = recentTimestamps.length;
    keyInfo.quotaUsed.today = todayTimestamps.length + 1;
    keyInfo.lastUsed = new Date();

    const remaining = keyInfo.rateLimit.requestsPerMinute - recentTimestamps.length;
    return { allowed: true, remaining };
  }

  getKeyInfo(key: string): ApiKeyInfo | undefined {
    return this.keys.get(key);
  }

  generateKey(name: string, requestsPerMinute = 60): string {
    // Generate a new API key
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    const key = `aios_${timestamp}${random}`;

    this.keys.set(key, {
      key,
      name,
      createdAt: new Date(),
      rateLimit: {
        requestsPerMinute,
        requestsPerDay: requestsPerMinute * 100,
      },
      quotaUsed: {
        today: 0,
        thisMinute: 0,
      },
    });

    return key;
  }

  revokeKey(key: string): boolean {
    return this.keys.delete(key);
  }

  getAllKeys(): Array<{ name: string; key: string; createdAt: Date; lastUsed?: Date }> {
    return Array.from(this.keys.values()).map((info) => ({
      name: info.name,
      key: info.key,
      createdAt: info.createdAt,
      lastUsed: info.lastUsed,
    }));
  }
}

export const apiKeyManager = new ApiKeyManager();
