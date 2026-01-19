import { z } from 'zod';

/**
 * API Request/Response Schemas
 * Type-safe validation for all API endpoints
 */

// LLM API
export const llmRequestSchema = z.object({
    prompt: z.string().min(1, 'Prompt is required').max(10000, 'Prompt too long'),
    systemPrompt: z.string().max(5000).optional(),
    imageUrl: z.string().url().optional(),
    imageBase64: z.string().optional(),
    videoUrl: z.string().url().optional(),
    model: z.string().optional(),
    personaId: z.string().optional(),
});

export const llmResponseSchema = z.object({
    success: z.boolean(),
    text: z.string().optional(),
    mock: z.boolean().optional(),
    error: z.string().optional(),
    usage: z.unknown().optional(),
});

// Run Workflow API
export const workflowNodeSchema = z.object({
    id: z.string().min(1),
    type: z.string().min(1),
    position: z
        .object({
            x: z.number(),
            y: z.number(),
        })
        .optional(),
    data: z.record(z.string(), z.unknown()),
});

export const workflowEdgeSchema = z.object({
    id: z.string().min(1),
    source: z.string().min(1),
    target: z.string().min(1),
    sourceHandle: z.string().optional(),
    targetHandle: z.string().optional(),
});

export const runWorkflowRequestSchema = z.object({
    nodes: z.array(workflowNodeSchema).min(0).max(100, 'Too many nodes'),
    edges: z.array(workflowEdgeSchema).min(0).max(500, 'Too many edges'),
});

export const runWorkflowResponseSchema = z.object({
    success: z.boolean(),
    nodes: z.array(workflowNodeSchema).optional(),
    error: z.string().optional(),
});

// Type exports
export type LLMRequest = z.infer<typeof llmRequestSchema>;
export type LLMResponse = z.infer<typeof llmResponseSchema>;
export type RunWorkflowRequest = z.infer<typeof runWorkflowRequestSchema>;
export type RunWorkflowResponse = z.infer<typeof runWorkflowResponseSchema>;
