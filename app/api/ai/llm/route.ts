import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { llmRequestSchema } from '@/shared/lib/api-schemas';
import { composePrompt } from '@features/workflow-editor/prompts';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Helper to fetch image and convert to base64
async function fetchImageAsBase64(url: string): Promise<string | null> {
    try {
        const response = await fetch(url);
        if (!response.ok) return null;

        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        return base64;
    } catch (error) {
        console.error('Failed to fetch image:', error);
        return null;
    }
}

// Detect MIME type from URL or default to jpeg
function getMimeType(url: string): string {
    const ext = url.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        gif: 'image/gif',
        webp: 'image/webp',
        mp4: 'video/mp4',
        webm: 'video/webm',
    };
    return mimeTypes[ext || ''] || 'image/jpeg';
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate with Zod
        const parseResult = llmRequestSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: parseResult.error.flatten() },
                { status: 400 }
            );
        }

        const { prompt, systemPrompt, imageUrl, imageBase64, videoUrl, model, personaId } =
            parseResult.data;

        if (!GEMINI_API_KEY) {
            // Fallback to mock response if no API key
            return NextResponse.json({
                success: true,
                text: `[Mock Response] ${prompt.substring(0, 50)}...`,
                mock: true,
            });
        }

        // Use prompt composer to build enhanced system prompt
        const composed = composePrompt({
            userPrompt: prompt,
            userSystemPrompt: systemPrompt,
            personaId: personaId,
            nodeType: 'llm',
            usePersona: !!personaId, // Only use persona if explicitly selected
        });

        console.log('[LLM] Using persona:', personaId || 'none');
        console.log('[LLM] System prompt length:', composed.systemPrompt.length);

        // Build the request parts for Gemini API
        const parts: Array<{ text?: string; inline_data?: { mime_type: string; data: string } }> =
            [];

        // Add text prompt
        parts.push({ text: composed.userPrompt });

        // Add image if provided (base64 or URL)
        if (imageBase64) {
            parts.push({
                inline_data: {
                    mime_type: 'image/jpeg',
                    data: imageBase64,
                },
            });
        } else if (imageUrl) {
            const base64 = await fetchImageAsBase64(imageUrl);
            if (base64) {
                parts.push({
                    inline_data: {
                        mime_type: getMimeType(imageUrl),
                        data: base64,
                    },
                });
            }
        }

        // Add video if provided (fetch and convert)
        if (videoUrl) {
            const base64 = await fetchImageAsBase64(videoUrl);
            if (base64) {
                parts.push({
                    inline_data: {
                        mime_type: getMimeType(videoUrl),
                        data: base64,
                    },
                });
            }
        }

        // Build contents array with composed system prompt
        const contents = [];

        // Always add composed system prompt
        if (composed.systemPrompt) {
            contents.push({
                role: 'user',
                parts: [{ text: composed.systemPrompt }],
            });
            contents.push({
                role: 'model',
                parts: [{ text: 'Understood. I will follow these instructions.' }],
            });
        }

        contents.push({
            role: 'user',
            parts,
        });

        // Use selected model or default to Gemini 2.5 Flash
        const selectedModel = model || 'gemini-2.5-flash-preview-05-20';
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent`;

        const response = await fetch(`${apiUrl}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 4096,
                },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini API error:', errorText);
            return NextResponse.json(
                { error: 'API request failed', details: errorText },
                { status: response.status }
            );
        }

        const data = await response.json();

        // Extract text from Gemini response
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        return NextResponse.json({
            success: true,
            text,
            usage: data.usageMetadata,
            persona: personaId || null,
        });
    } catch (error) {
        console.error('LLM API error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.flatten() },
                { status: 400 }
            );
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
