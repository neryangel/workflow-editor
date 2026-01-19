// API Route Tests - /api/ai/video-gen
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

describe('/api/ai/video-gen', () => {
    let POST: typeof import('@/app/api/ai/video-gen/route').POST;
    let MockNextRequest: typeof import('next/server').NextRequest;

    beforeEach(async () => {
        vi.resetModules();
        vi.stubEnv('GEMINI_API_KEY', '');
        mockFetch.mockReset();
        const routeModule = await import('@/app/api/ai/video-gen/route');
        POST = routeModule.POST;
        const serverModule = await import('next/server');
        MockNextRequest = serverModule.NextRequest;
    });

    describe('Validation', () => {
        it('should return 400 for missing prompt', async () => {
            const req = new MockNextRequest('http://localhost/api/ai/video-gen', {
                method: 'POST',
                body: JSON.stringify({}),
            });

            const response = await POST(req);
            expect(response.status).toBe(400);
        });

        it('should return 400 for empty prompt', async () => {
            const req = new MockNextRequest('http://localhost/api/ai/video-gen', {
                method: 'POST',
                body: JSON.stringify({ prompt: '' }),
            });

            const response = await POST(req);
            expect(response.status).toBe(400);
        });

        it('should return 400 for invalid imageUrl', async () => {
            const req = new MockNextRequest('http://localhost/api/ai/video-gen', {
                method: 'POST',
                body: JSON.stringify({
                    prompt: 'Test video',
                    imageUrl: 'not-a-valid-url',
                }),
            });

            const response = await POST(req);
            expect(response.status).toBe(400);
        });

        it('should validate aspectRatio enum', async () => {
            const req = new MockNextRequest('http://localhost/api/ai/video-gen', {
                method: 'POST',
                body: JSON.stringify({
                    prompt: 'Test video',
                    aspectRatio: 'invalid-ratio',
                }),
            });

            const response = await POST(req);
            expect(response.status).toBe(400);
        });
    });

    describe('Mock Mode (no API key)', () => {
        it('should return mock video when no API key', async () => {
            const req = new MockNextRequest('http://localhost/api/ai/video-gen', {
                method: 'POST',
                body: JSON.stringify({ prompt: 'A flying bird' }),
            });

            const response = await POST(req);
            const data = await response.json();

            expect(data.success).toBe(true);
            expect(data.mock).toBe(true);
            expect(data.videoUrl).toContain('sample-videos');
        });

        it('should handle model selection in mock mode', async () => {
            const req = new MockNextRequest('http://localhost/api/ai/video-gen', {
                method: 'POST',
                body: JSON.stringify({
                    prompt: 'Test video',
                    model: 'veo-2.0-generate-001',
                }),
            });

            const response = await POST(req);
            const data = await response.json();

            expect(data.success).toBe(true);
            expect(data.mock).toBe(true);
        });

        it('should accept valid aspectRatio', async () => {
            const req = new MockNextRequest('http://localhost/api/ai/video-gen', {
                method: 'POST',
                body: JSON.stringify({
                    prompt: 'Widescreen video',
                    aspectRatio: '16:9',
                }),
            });

            const response = await POST(req);
            const data = await response.json();

            expect(data.success).toBe(true);
        });

        it('should accept duration parameter', async () => {
            const req = new MockNextRequest('http://localhost/api/ai/video-gen', {
                method: 'POST',
                body: JSON.stringify({
                    prompt: 'Short clip',
                    duration: 5,
                }),
            });

            const response = await POST(req);
            const data = await response.json();

            expect(data.success).toBe(true);
        });
    });

    describe('Image Input', () => {
        it('should accept imageUrl for image-to-video', async () => {
            const req = new MockNextRequest('http://localhost/api/ai/video-gen', {
                method: 'POST',
                body: JSON.stringify({
                    prompt: 'Animate this image',
                    imageUrl: 'https://example.com/image.jpg',
                }),
            });

            const response = await POST(req);
            const data = await response.json();

            expect(data.success).toBe(true);
        });

        it('should accept imageBase64 for image-to-video', async () => {
            const req = new MockNextRequest('http://localhost/api/ai/video-gen', {
                method: 'POST',
                body: JSON.stringify({
                    prompt: 'Animate this',
                    imageBase64:
                        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
                }),
            });

            const response = await POST(req);
            const data = await response.json();

            expect(data.success).toBe(true);
        });
    });

    describe('API Integration', () => {
        beforeEach(() => {
            vi.stubEnv('GEMINI_API_KEY', 'test-api-key');
        });

        it('should call Veo API with correct model', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    candidates: [
                        {
                            content: {
                                parts: [
                                    {
                                        fileData: {
                                            mimeType: 'video/mp4',
                                            fileUri: 'https://storage.googleapis.com/video.mp4',
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                }),
            });

            vi.resetModules();
            const routeModule = await import('@/app/api/ai/video-gen/route');
            const serverModule = await import('next/server');

            const req = new serverModule.NextRequest('http://localhost/api/ai/video-gen', {
                method: 'POST',
                body: JSON.stringify({
                    prompt: 'Generate video',
                    model: 'veo-2.0-generate-001',
                }),
            });

            await routeModule.POST(req);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('veo'),
                expect.any(Object)
            );
        });

        it('should return fallback on API error', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                text: async () => 'API Error',
            });

            vi.resetModules();
            const routeModule = await import('@/app/api/ai/video-gen/route');
            const serverModule = await import('next/server');

            const req = new serverModule.NextRequest('http://localhost/api/ai/video-gen', {
                method: 'POST',
                body: JSON.stringify({ prompt: 'Test' }),
            });

            const response = await routeModule.POST(req);
            const data = await response.json();

            expect(data.success).toBe(true);
            expect(data.mock).toBe(true);
        });
    });

    describe('Error Handling', () => {
        it('should handle JSON parse errors gracefully', async () => {
            const req = {
                json: async () => {
                    throw new Error('Invalid JSON');
                },
            } as unknown as import('next/server').NextRequest;

            const response = await POST(req);
            expect(response.status).toBe(500);
        });
    });
});
