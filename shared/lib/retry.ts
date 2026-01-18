// Retry Utility with Exponential Backoff
// For resilient API calls

interface RetryOptions {
    maxRetries: number;
    baseDelayMs: number;
    maxDelayMs: number;
    shouldRetry?: (error: unknown) => boolean;
}

const DEFAULT_OPTIONS: RetryOptions = {
    maxRetries: 3,
    baseDelayMs: 100,
    maxDelayMs: 5000,
};

export async function withRetry<T>(
    fn: () => Promise<T>,
    options: Partial<RetryOptions> = {}
): Promise<T> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    let lastError: unknown;

    for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            // Check if we should retry
            if (opts.shouldRetry && !opts.shouldRetry(error)) {
                throw error;
            }

            // Don't wait after the last attempt
            if (attempt < opts.maxRetries) {
                const delay = Math.min(opts.baseDelayMs * Math.pow(2, attempt), opts.maxDelayMs);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError;
}

// Utility to check if error is retryable
export function isRetryableError(error: unknown): boolean {
    if (error instanceof Error) {
        const message = error.message.toLowerCase();
        return (
            message.includes('timeout') ||
            message.includes('network') ||
            message.includes('econnreset') ||
            message.includes('fetch failed')
        );
    }
    return false;
}
