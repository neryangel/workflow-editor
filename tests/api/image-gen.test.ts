// API Route Tests - /api/ai/image-gen
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Next.js server
vi.mock('next/server', () => ({
    NextRequest: class MockNextRequest {
        private body: string;
        constructor(_url: string, init?: RequestInit) {
            this.body = (init?.body as string) || '{}';
        }
        async json() {
            return JSON.parse(this.body);
        }
    },
    NextResponse: {
        json: (data: unknown, init?: ResponseInit) => {
            return {
                data,
                status: init?.status || 200,
                async json() {
                    return data;
                },
            };
        },
    },
}));

// Mock fetch for external API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('/api/ai/image-gen', () => {
    let POST: typeof import('@/app/api/ai/image-gen/route').POST;
    let MockNextRequest: typeof import('next/server').NextRequest;

    beforeEach(async () => {
        vi.resetModules();
        vi.stubEnv('GEMINI_API_KEY', '');
        mockFetch.mockReset();
        const routeModule = await import('@/app/api/ai/image-gen/route');
        POST = routeModule.POST;
        const serverModule = await import('next/server');
        MockNextRequest = serverModule.NextRequest;
    });

    describe('Validation', () => {
        it('should return 400 for missing prompt', async () => {
            const req = new MockNextRequest('http://localhost/api/ai/image-gen', {
                method: 'POST',
                body: JSON.stringify({}),
            });

            const response = await POST(req);
            expect(response.status).toBe(400);
        });

        it('should return 400 for empty prompt', async () => {
            const req = new MockNextRequest('http://localhost/api/ai/image-gen', {
                method: 'POST',
                body: JSON.stringify({ prompt: '' }),
            });

            const response = await POST(req);
            expect(response.status).toBe(400);
        });

        it('should return 400 for invalid referenceImageUrl', async () => {
            const req = new MockNextRequest('http://localhost/api/ai/image-gen', {
                method: 'POST',
                body: JSON.stringify({
                    prompt: 'Test',
                    referenceImageUrl: 'not-a-url',
                }),
            });

            const response = await POST(req);
            expect(response.status).toBe(400);
        });
    });

    describe('Mock Mode (no API key)', () => {
        it('should return mock image when no API key', async () => {
            const req = new MockNextRequest('http://localhost/api/ai/image-gen', {
                method: 'POST',
                body: JSON.stringify({ prompt: 'A beautiful sunset' }),
            });

            const response = await POST(req);
            const data = await response.json();

            expect(data.success).toBe(true);
            expect(data.mock).toBe(true);
            expect(data.imageUrl).toContain('picsum.photos');
        });

        it('should generate consistent seed from prompt', async () => {
            const prompt = 'Consistent test prompt';
            const req1 = new MockNextRequest('http://localhost/api/ai/image-gen', {
                method: 'POST',
                body: JSON.stringify({ prompt }),
            });
            const req2 = new MockNextRequest('http://localhost/api/ai/image-gen', {
                method: 'POST',
                body: JSON.stringify({ prompt }),
            });

            const response1 = await POST(req1);
            const response2 = await POST(req2);
            const data1 = await response1.json();
            const data2 = await response2.json();

            expect(data1.imageUrl).toBe(data2.imageUrl);
        });

        it('should handle model selection in mock mode', async () => {
            const req = new MockNextRequest('http://localhost/api/ai/image-gen', {
                method: 'POST',
                body: JSON.stringify({
                    prompt: 'Test image',
                    model: 'nano-banana-pro',
                }),
            });

            const response = await POST(req);
            const data = await response.json();

            expect(data.success).toBe(true);
            expect(data.mock).toBe(true);
        });
    });

    describe('Reference Images', () => {
        it('should accept referenceImageUrls array', async () => {
            const req = new MockNextRequest('http://localhost/api/ai/image-gen', {
                method: 'POST',
                body: JSON.stringify({
                    prompt: 'Portrait with reference',
                    referenceImageUrls: [
                        'https://example.com/face1.jpg',
                        'https://example.com/face2.jpg',
                    ],
                }),
            });

            const response = await POST(req);
            const data = await response.json();

            expect(data.success).toBe(true);
        });

        it('should limit referenceImageUrls to 3 images', async () => {
            const req = new MockNextRequest('http://localhost/api/ai/image-gen', {
                method: 'POST',
                body: JSON.stringify({
                    prompt: 'Too many references',
                    referenceImageUrls: [
                        'https://example.com/1.jpg',
                        'https://example.com/2.jpg',
                        'https://example.com/3.jpg',
                        'https://example.com/4.jpg',
                    ],
                }),
            });

            const response = await POST(req);
            expect(response.status).toBe(400);
        });
    });

    describe('API Integration', () => {
        beforeEach(() => {
            vi.stubEnv('GEMINI_API_KEY', 'test-api-key');
        });

        it('should call Gemini API with correct model', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    candidates: [
                        {
                            content: {
                                parts: [
                                    {
                                        inline_data: {
                                            mime_type: 'image/png',
                                            data: 'base64imagedata',
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                }),
            });

            vi.resetModules();
            const routeModule = await import('@/app/api/ai/image-gen/route');
            const serverModule = await import('next/server');

            const req = new serverModule.NextRequest('http://localhost/api/ai/image-gen', {
                method: 'POST',
                body: JSON.stringify({
                    prompt: 'Test image generation',
                    model: 'nano-banana-pro',
                }),
            });

            await routeModule.POST(req);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('gemini-2.0-flash-exp-image-generation'),
                expect.any(Object)
            );
        });

        it('should return fallback on API error', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                text: async () => 'API Error',
            });

            vi.resetModules();
            const routeModule = await import('@/app/api/ai/image-gen/route');
            const serverModule = await import('next/server');

            const req = new serverModule.NextRequest('http://localhost/api/ai/image-gen', {
                method: 'POST',
                body: JSON.stringify({ prompt: 'Test' }),
            });

            const response = await routeModule.POST(req);
            const data = await response.json();

            expect(data.success).toBe(true);
            expect(data.mock).toBe(true);
        });

        it('should return base64 data URL on success', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    candidates: [
                        {
                            content: {
                                parts: [
                                    {
                                        inline_data: {
                                            mime_type: 'image/png',
                                            data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                    usageMetadata: { totalTokens: 100 },
                }),
            });

            vi.resetModules();
            const routeModule = await import('@/app/api/ai/image-gen/route');
            const serverModule = await import('next/server');

            const req = new serverModule.NextRequest('http://localhost/api/ai/image-gen', {
                method: 'POST',
                body: JSON.stringify({ prompt: 'Test' }),
            });

            const response = await routeModule.POST(req);
            const data = await response.json();

            expect(data.success).toBe(true);
            expect(data.imageUrl).toContain('data:image/png;base64');
        });
    });
});
