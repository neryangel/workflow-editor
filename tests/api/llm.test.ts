// API Route Tests - /api/ai/llm
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch for external API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

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

describe('/api/ai/llm', () => {
    let POST: typeof import('@/app/api/ai/llm/route').POST;
    let MockNextRequest: typeof import('next/server').NextRequest;

    beforeEach(async () => {
        vi.resetModules();
        vi.stubEnv('GEMINI_API_KEY', '');
        mockFetch.mockReset();
        const routeModule = await import('@/app/api/ai/llm/route');
        POST = routeModule.POST;
        const serverModule = await import('next/server');
        MockNextRequest = serverModule.NextRequest;
    });

    describe('Validation', () => {
        it('should return 400 for missing prompt', async () => {
            const req = new MockNextRequest('http://localhost/api/ai/llm', {
                method: 'POST',
                body: JSON.stringify({}),
            });

            const response = await POST(req);
            expect(response.status).toBe(400);
        });

        it('should return 400 for empty prompt', async () => {
            const req = new MockNextRequest('http://localhost/api/ai/llm', {
                method: 'POST',
                body: JSON.stringify({ prompt: '' }),
            });

            const response = await POST(req);
            expect(response.status).toBe(400);
        });

        it('should return 400 for invalid imageUrl', async () => {
            const req = new MockNextRequest('http://localhost/api/ai/llm', {
                method: 'POST',
                body: JSON.stringify({
                    prompt: 'Test',
                    imageUrl: 'not-a-url',
                }),
            });

            const response = await POST(req);
            expect(response.status).toBe(400);
        });
    });

    describe('Mock Mode (no API key)', () => {
        it('should return mock response when no API key', async () => {
            const req = new MockNextRequest('http://localhost/api/ai/llm', {
                method: 'POST',
                body: JSON.stringify({ prompt: 'Test prompt' }),
            });

            const response = await POST(req);
            const data = await response.json();

            expect(data.success).toBe(true);
            expect(data.mock).toBe(true);
            expect(data.text).toContain('Mock Response');
        });

        it('should include prompt in mock response', async () => {
            const req = new MockNextRequest('http://localhost/api/ai/llm', {
                method: 'POST',
                body: JSON.stringify({ prompt: 'Hello World Test' }),
            });

            const response = await POST(req);
            const data = await response.json();

            expect(data.text).toContain('Hello World Test');
        });

        it('should handle system prompt in mock mode', async () => {
            const req = new MockNextRequest('http://localhost/api/ai/llm', {
                method: 'POST',
                body: JSON.stringify({
                    prompt: 'Test',
                    systemPrompt: 'Be helpful',
                }),
            });

            const response = await POST(req);
            const data = await response.json();

            expect(data.success).toBe(true);
        });

        it('should handle personaId in mock mode', async () => {
            const req = new MockNextRequest('http://localhost/api/ai/llm', {
                method: 'POST',
                body: JSON.stringify({
                    prompt: 'Test',
                    personaId: 'promptEngineer',
                }),
            });

            const response = await POST(req);
            const data = await response.json();

            expect(data.success).toBe(true);
        });
    });

    describe('Image Handling', () => {
        it('should accept imageUrls array', async () => {
            const req = new MockNextRequest('http://localhost/api/ai/llm', {
                method: 'POST',
                body: JSON.stringify({
                    prompt: 'Analyze these images',
                    imageUrls: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
                }),
            });

            const response = await POST(req);
            const data = await response.json();

            expect(data.success).toBe(true);
        });

        it('should accept imageBase64', async () => {
            const req = new MockNextRequest('http://localhost/api/ai/llm', {
                method: 'POST',
                body: JSON.stringify({
                    prompt: 'Analyze this image',
                    imageBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk',
                }),
            });

            const response = await POST(req);
            const data = await response.json();

            expect(data.success).toBe(true);
        });

        it('should accept videoUrl', async () => {
            const req = new MockNextRequest('http://localhost/api/ai/llm', {
                method: 'POST',
                body: JSON.stringify({
                    prompt: 'Analyze this video',
                    videoUrl: 'https://example.com/video.mp4',
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

        it('should call Gemini API with correct model', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    candidates: [
                        {
                            content: {
                                parts: [{ text: 'AI response' }],
                            },
                        },
                    ],
                    usageMetadata: { totalTokens: 100 },
                }),
            });

            vi.resetModules();
            const routeModule = await import('@/app/api/ai/llm/route');
            const serverModule = await import('next/server');

            const req = new serverModule.NextRequest('http://localhost/api/ai/llm', {
                method: 'POST',
                body: JSON.stringify({
                    prompt: 'Test prompt',
                    model: 'gemini-2.5-flash-preview-05-20',
                }),
            });

            await routeModule.POST(req);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('gemini-2.5-flash'),
                expect.any(Object)
            );
        });

        it('should return text response on success', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    candidates: [
                        {
                            content: {
                                parts: [{ text: 'Generated response text' }],
                            },
                        },
                    ],
                }),
            });

            vi.resetModules();
            const routeModule = await import('@/app/api/ai/llm/route');
            const serverModule = await import('next/server');

            const req = new serverModule.NextRequest('http://localhost/api/ai/llm', {
                method: 'POST',
                body: JSON.stringify({ prompt: 'Test' }),
            });

            const response = await routeModule.POST(req);
            const data = await response.json();

            expect(data.success).toBe(true);
            expect(data.text).toBe('Generated response text');
        });

        it('should handle API errors gracefully', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                text: async () => 'Internal Server Error',
            });

            vi.resetModules();
            const routeModule = await import('@/app/api/ai/llm/route');
            const serverModule = await import('next/server');

            const req = new serverModule.NextRequest('http://localhost/api/ai/llm', {
                method: 'POST',
                body: JSON.stringify({ prompt: 'Test' }),
            });

            const response = await routeModule.POST(req);
            expect(response.status).toBe(500);
        });

        it('should include persona in response when set', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    candidates: [
                        {
                            content: {
                                parts: [{ text: 'Response' }],
                            },
                        },
                    ],
                }),
            });

            vi.resetModules();
            const routeModule = await import('@/app/api/ai/llm/route');
            const serverModule = await import('next/server');

            const req = new serverModule.NextRequest('http://localhost/api/ai/llm', {
                method: 'POST',
                body: JSON.stringify({
                    prompt: 'Test',
                    personaId: 'director',
                }),
            });

            const response = await routeModule.POST(req);
            const data = await response.json();

            expect(data.persona).toBe('director');
        });

        it('should fetch and convert images to base64', async () => {
            // Mock image fetch
            mockFetch
                .mockResolvedValueOnce({
                    ok: true,
                    arrayBuffer: async () => new ArrayBuffer(8),
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        candidates: [
                            {
                                content: {
                                    parts: [{ text: 'Analyzed' }],
                                },
                            },
                        ],
                    }),
                });

            vi.resetModules();
            const routeModule = await import('@/app/api/ai/llm/route');
            const serverModule = await import('next/server');

            const req = new serverModule.NextRequest('http://localhost/api/ai/llm', {
                method: 'POST',
                body: JSON.stringify({
                    prompt: 'Analyze',
                    imageUrl: 'https://example.com/image.jpg',
                }),
            });

            const response = await routeModule.POST(req);
            const data = await response.json();

            expect(data.success).toBe(true);
        });
    });

    describe('Error Handling', () => {
        it('should handle JSON parse errors', async () => {
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
