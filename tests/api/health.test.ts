// API Test - Health Check
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Health Check API', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it('should return healthy status', async () => {
        const { GET } = await import('@/app/api/health/route');
        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.status).toBe('healthy');
        expect(data.timestamp).toBeDefined();
        expect(data.checks.api).toBe(true);
    });

    it('should include version', async () => {
        const { GET } = await import('@/app/api/health/route');
        const response = await GET();
        const data = await response.json();

        expect(data.version).toBeDefined();
    });

    it('should include environment check', async () => {
        const { GET } = await import('@/app/api/health/route');
        const response = await GET();
        const data = await response.json();

        expect(data.checks.environment).toBe(true);
    });
});
