// Executor Unit Tests - Updated for API-calling executors
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { InputExecutor } from '@features/workflow-editor/services/executors/InputExecutor';
import { LLMExecutor } from '@features/workflow-editor/services/executors/LLMExecutor';
import { ImageGenExecutor } from '@features/workflow-editor/services/executors/ImageGenExecutor';
import { VideoGenExecutor } from '@features/workflow-editor/services/executors/VideoGenExecutor';
import { ExtractFrameExecutor } from '@features/workflow-editor/services/executors/ExtractFrameExecutor';

// Mock global fetch for executors that call APIs
const mockFetch = vi.fn();

beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
});

afterEach(() => {
    vi.unstubAllGlobals();
    mockFetch.mockReset();
});

describe('InputExecutor', () => {
    const executor = new InputExecutor();

    it('should return empty object (values are pre-set by user)', async () => {
        const inputs = { text: 'Hello World' };
        const result = await executor.execute(inputs, {});
        // InputExecutor returns {} because values are already set in node outputs
        expect(result).toEqual({});
    });

    it('should handle empty inputs', async () => {
        const result = await executor.execute({}, {});
        expect(result).toEqual({});
    });

    it('should have correct nodeType', () => {
        expect(executor.nodeType).toBe('inputText');
    });
});

describe('LLMExecutor', () => {
    const executor = new LLMExecutor();

    it('should return out_text with API response', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ text: 'API response text' }),
        });

        const result = await executor.execute({ in_text: 'Test' }, {});
        expect(result.out_text).toBeDefined();
        expect(typeof result.out_text).toBe('string');
    });

    it('should return error message when no input text', async () => {
        const result = await executor.execute({ in_text: '' }, {});
        expect(result.out_text).toContain('[Error:');
    });

    it('should handle API errors gracefully', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'));

        const result = await executor.execute({ in_text: 'Hello' }, {});
        expect(result.out_text).toContain('[Error:');
    });

    it('should have correct nodeType', () => {
        expect(executor.nodeType).toBe('llm');
    });
});

describe('ImageGenExecutor', () => {
    const executor = new ImageGenExecutor();

    it('should return out_image from API or fallback', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ imageUrl: 'https://example.com/image.jpg' }),
        });

        const result = await executor.execute({ in_text: 'A sunset' }, {});
        expect(result.out_image).toBeDefined();
        expect(typeof result.out_image).toBe('string');
    });

    it('should fallback to picsum on API error', async () => {
        mockFetch.mockRejectedValueOnce(new Error('API error'));

        const result = await executor.execute({ in_text: 'A landscape' }, {});
        expect(result.out_image).toContain('picsum.photos');
    });

    it('should have correct nodeType', () => {
        expect(executor.nodeType).toBe('imageGen');
    });
});

describe('VideoGenExecutor', () => {
    const executor = new VideoGenExecutor();

    it('should return out_video from API or fallback', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ videoUrl: 'https://example.com/video.mp4' }),
        });

        const result = await executor.execute({ in_text: 'A video' }, {});
        expect(result.out_video).toBeDefined();
        expect(typeof result.out_video).toBe('string');
    });

    it('should fallback to sample video on API error', async () => {
        mockFetch.mockRejectedValueOnce(new Error('API error'));

        const result = await executor.execute({ in_text: 'A scene' }, {});
        expect(result.out_video).toContain('sample-videos.com');
    });

    it('should have correct nodeType', () => {
        expect(executor.nodeType).toBe('videoGen');
    });
});

describe('ExtractFrameExecutor', () => {
    const executor = new ExtractFrameExecutor();

    it('should return out_image with picsum URL', async () => {
        const result = await executor.execute({ in_video: 'mock-video-url' }, {});
        expect(result.out_image).toBeDefined();
        expect(typeof result.out_image).toBe('string');
        expect(result.out_image).toContain('picsum.photos');
    });

    it('should have correct nodeType', () => {
        expect(executor.nodeType).toBe('extractFrame');
    });
});
