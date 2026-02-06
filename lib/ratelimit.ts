import { RateLimitInfo } from './types';

interface RateLimitData {
    count: number;
    resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitData>();

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 5;
const CLEANUP_INTERVAL = 10 * 60 * 1000;

let cleanupInterval: NodeJS.Timeout | null = null;

function startCleanup() {
    if (cleanupInterval) return;

    cleanupInterval = setInterval(() => {
        const now = Date.now();
        for (const [ip, data] of rateLimitMap.entries()) {
            if (now > data.resetAt) {
                rateLimitMap.delete(ip);
            }
        }
    }, CLEANUP_INTERVAL);
}

export function checkRateLimit(ip: string): RateLimitInfo {
    startCleanup();

    const now = Date.now();
    const limitData = rateLimitMap.get(ip);

    if (!limitData) {
        const resetAt = now + WINDOW_MS;
        rateLimitMap.set(ip, { count: 1, resetAt });
        return { success: true, remaining: MAX_REQUESTS - 1, resetAt };
    }

    if (now > limitData.resetAt) {
        const resetAt = now + WINDOW_MS;
        rateLimitMap.set(ip, { count: 1, resetAt });
        return { success: true, remaining: MAX_REQUESTS - 1, resetAt };
    }

    if (limitData.count >= MAX_REQUESTS) {
        return { success: false, remaining: 0, resetAt: limitData.resetAt };
    }

    limitData.count += 1;
    return { success: true, remaining: MAX_REQUESTS - limitData.count, resetAt: limitData.resetAt };
}
