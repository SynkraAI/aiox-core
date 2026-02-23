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
export declare class ApiKeyManager {
    private keys;
    private requestLog;
    constructor();
    private loadKeysFromEnvironment;
    private addKey;
    validateKey(key: string): {
        valid: boolean;
        error?: string;
    };
    checkRateLimit(key: string): {
        allowed: boolean;
        error?: string;
        remaining?: number;
    };
    getKeyInfo(key: string): ApiKeyInfo | undefined;
    generateKey(name: string, requestsPerMinute?: number): string;
    revokeKey(key: string): boolean;
    getAllKeys(): Array<{
        name: string;
        key: string;
        createdAt: Date;
        lastUsed?: Date;
    }>;
}
export declare const apiKeyManager: ApiKeyManager;
export {};
//# sourceMappingURL=api-keys.d.ts.map