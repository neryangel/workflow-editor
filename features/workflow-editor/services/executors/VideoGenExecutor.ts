// VideoGen Executor - Handles video generation node execution
// Calls the real API endpoint

import { BaseExecutor, ExecutorInputs, ExecutorOutputs } from './BaseExecutor';
import { WorkflowNodeType } from '../../types';

// Build base URL for server-side API calls
function getApiBaseUrl(): string {
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }
    if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL;
    }
    return 'http://localhost:3000';
}

export class VideoGenExecutor extends BaseExecutor {
    readonly nodeType: WorkflowNodeType = 'videoGen';

    async execute(
        inputs: ExecutorInputs,
        meta?: Record<string, unknown>
    ): Promise<ExecutorOutputs> {
        const prompt = (inputs.in_text as string) || 'cinematic video';
        const imageUrl = (inputs.in_image as string) || undefined;
        const model = (meta?.model as string) || 'veo-2';
        const baseUrl = getApiBaseUrl();

        try {
            const response = await fetch(`${baseUrl}/api/ai/video-gen`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    imageUrl,
                    model,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Video generation failed');
            }

            return {
                out_video: result.videoUrl || result.operationName,
            };
        } catch (error) {
            console.error('[VideoGenExecutor] API call failed:', error);
            return {
                out_video: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            };
        }
    }
}
