// LLM Executor - Handles LLM node execution
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

export class LLMExecutor extends BaseExecutor {
    readonly nodeType: WorkflowNodeType = 'llm';

    async execute(
        inputs: ExecutorInputs,
        meta?: Record<string, unknown>
    ): Promise<ExecutorOutputs> {
        const systemText = (inputs.in_system as string) || '';
        const inputText = (inputs.in_text as string) || '';
        const imageUrl = (inputs.in_image as string) || undefined;
        const videoUrl = (inputs.in_video as string) || undefined;
        const model = (meta?.model as string) || 'gemini-2.0-flash';
        const personaId = (meta?.personaId as string) || undefined;
        const baseUrl = getApiBaseUrl();

        if (!inputText) {
            return {
                out_text: '[Error: No input text provided]',
            };
        }

        try {
            // Call the real LLM API
            const response = await fetch(`${baseUrl}/api/ai/llm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: inputText,
                    systemPrompt: systemText || undefined,
                    imageUrl,
                    videoUrl,
                    model,
                    personaId,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'LLM API request failed');
            }

            return {
                out_text: result.text || '[No response]',
            };
        } catch (error) {
            console.error('[LLMExecutor] API call failed:', error);
            // Return error message on failure
            return {
                out_text: `[Error: ${error instanceof Error ? error.message : 'API call failed'}]`,
            };
        }
    }
}
