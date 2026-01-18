// Performance Metrics Utility
// Track and report performance metrics

interface PerformanceMetric {
    name: string;
    duration: number;
    timestamp: number;
}

const metrics: PerformanceMetric[] = [];
const MAX_METRICS = 100;

export function measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();

    return fn()
        .then((result) => {
            recordMetric(name, performance.now() - start);
            return result;
        })
        .catch((error) => {
            recordMetric(`${name}:error`, performance.now() - start);
            throw error;
        });
}

export function measureSync<T>(name: string, fn: () => T): T {
    const start = performance.now();
    try {
        const result = fn();
        recordMetric(name, performance.now() - start);
        return result;
    } catch (error) {
        recordMetric(`${name}:error`, performance.now() - start);
        throw error;
    }
}

function recordMetric(name: string, duration: number): void {
    metrics.push({
        name,
        duration,
        timestamp: Date.now(),
    });

    // Keep only recent metrics
    if (metrics.length > MAX_METRICS) {
        metrics.shift();
    }
}

export function getMetrics(): PerformanceMetric[] {
    return [...metrics];
}

export function getAverageMetric(name: string): number | null {
    const matching = metrics.filter((m) => m.name === name);
    if (matching.length === 0) return null;
    return matching.reduce((sum, m) => sum + m.duration, 0) / matching.length;
}

export function clearMetrics(): void {
    metrics.length = 0;
}
