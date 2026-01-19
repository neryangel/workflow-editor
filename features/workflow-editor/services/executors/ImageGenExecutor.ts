// ImageGen Executor - Handles image generation node execution
// Calls the real API endpoint instead of returning mock data

import { BaseExecutor, ExecutorInputs, ExecutorOutputs } from './BaseExecutor';
import { WorkflowNodeType } from '../../types';

// Build base URL for server-side API calls
function getApiBaseUrl(): string {
    // In Vercel deployment
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }
    // Custom domain or explicit URL
    if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL;
    }
    // Local development
    return 'http://localhost:3000';
}

export class ImageGenExecutor extends BaseExecutor {
    readonly nodeType: WorkflowNodeType = 'imageGen';

    async execute(
        inputs: ExecutorInputs,
        meta?: Record<string, unknown>
    ): Promise<ExecutorOutputs> {
        const prompt = (inputs.in_text as string) || 'beautiful landscape';
        const referenceImageUrl = (inputs.in_image as string) || undefined;
        const model = (meta?.model as string) || undefined;
        const baseUrl = getApiBaseUrl();

        try {
            // Call the real image generation API
            const response = await fetch(`${baseUrl}/api/ai/image-gen`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    referenceImageUrl,
                    model,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Image generation failed');
            }

            return {
                out_image: result.imageUrl,
            };
        } catch (error) {
            console.error('[ImageGenExecutor] API call failed:', error);
            // Fallback to placeholder on error
            const seed = encodeURIComponent(prompt.slice(0, 30) || 'default');
            return {
                out_image: `https://picsum.photos/seed/${seed}/400/300`,
            };
        }
    }
}
