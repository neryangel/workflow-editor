import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Request schema for video generation
const videoGenRequestSchema = z.object({
    prompt: z.string().min(1, 'Prompt is required').max(5000),
    imageUrl: z.string().url().optional(),
    imageBase64: z.string().optional(),
    model: z.string().optional(),
    aspectRatio: z.enum(['16:9', '9:16', '1:1']).optional(),
    duration: z.number().min(1).max(8).optional(),
});

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

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate with Zod
        const parseResult = videoGenRequestSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: parseResult.error.flatten() },
                { status: 400 }
            );
        }

        const { prompt, imageUrl, imageBase64, model, aspectRatio, duration } = parseResult.data;

        // Log chosen model
        console.log(
            `[VideoGen] Generating with model: ${model || 'default (veo-2.0-generate-001)'}`
        );

        if (!GEMINI_API_KEY) {
            // Fallback to mock response
            return NextResponse.json({
                success: true,
                videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
                mock: true,
            });
        }

        // Map UI models to official Veo API model IDs (Jan 2026)
        const modelMap: Record<string, string> = {
            'veo-3.1-fast': 'veo-3.1-fast-generate-preview',
            'veo-3.1': 'veo-3.1-generate-preview',
            'veo-3.0-full': 'veo-3.0-generate-preview',
            default: 'veo-3.1-fast-generate-preview',
        };

        const targetModel = modelMap[model || 'default'] || modelMap['default'];
        console.log(`[VideoGen] Mapping '${model}' -> '${targetModel}'`);

        // Build request for Veo API
        const requestBody: Record<string, unknown> = {
            prompt: prompt,
            config: {
                aspectRatio: aspectRatio || '16:9',
                numberOfVideos: 1,
                durationSeconds: duration || 5, // Use duration parameter
            },
        };

        // Add reference image if provided
        if (imageBase64) {
            requestBody.referenceImage = {
                inline_data: {
                    mime_type: 'image/jpeg',
                    data: imageBase64,
                },
            };
        } else if (imageUrl) {
            const base64 = await fetchImageAsBase64(imageUrl);
            if (base64) {
                requestBody.referenceImage = {
                    inline_data: {
                        mime_type: 'image/jpeg',
                        data: base64,
                    },
                };
            }
        }

        // Use Veo API endpoint
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateVideos`;

        const response = await fetch(`${apiUrl}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Veo API error:', errorText);

            // Fallback to mock on API error
            return NextResponse.json({
                success: true,
                videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
                mock: true,
                error: 'API unavailable, using placeholder',
            });
        }

        const data = await response.json();

        // Veo API returns an operation - we need to poll for completion
        // For now, return the operation name so client can poll
        if (data.name) {
            return NextResponse.json({
                success: true,
                operationName: data.name,
                status: 'processing',
                message: 'Video generation started. Poll for completion.',
            });
        }

        // If immediate result (unlikely but handle it)
        const videoUrl = data.generatedVideos?.[0]?.video?.uri;
        if (videoUrl) {
            return NextResponse.json({
                success: true,
                videoUrl,
            });
        }

        // Fallback
        return NextResponse.json({
            success: true,
            videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            mock: true,
            error: 'No video generated',
        });
    } catch (error) {
        console.error('Video Gen API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
