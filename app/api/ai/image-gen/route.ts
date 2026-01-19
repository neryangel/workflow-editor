import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Request schema for image generation
const imageGenRequestSchema = z.object({
    prompt: z.string().min(1, 'Prompt is required').max(5000),
    referenceImageUrl: z.string().url().optional(),
    referenceImageUrls: z.array(z.string().url()).max(3).optional(), // Multiple reference images
    referenceImageBase64: z.string().optional(),
    model: z.string().optional(),
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
        const parseResult = imageGenRequestSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: parseResult.error.flatten() },
                { status: 400 }
            );
        }

        const { prompt, referenceImageUrl, referenceImageUrls, referenceImageBase64, model } =
            parseResult.data;

        // Log chosen model
        console.log(`[ImageGen] Generating with model: ${model || 'default'}`);
        console.log(
            `[ImageGen] Reference images: ${(referenceImageUrls?.length || 0) + (referenceImageUrl ? 1 : 0)}`
        );

        if (!GEMINI_API_KEY) {
            // Fallback to mock response with placeholder image
            const seed = Math.abs(prompt.split('').reduce((a, b) => a + b.charCodeAt(0), 0));
            return NextResponse.json({
                success: true,
                imageUrl: `https://picsum.photos/seed/${seed}/512/512`,
                mock: true,
            });
        }

        // Build the request parts - images FIRST, then text (best practice for multimodal)
        const parts: Array<{ text?: string; inline_data?: { mime_type: string; data: string } }> =
            [];

        // Add reference images FIRST (before text prompt)
        if (referenceImageBase64) {
            parts.push({
                inline_data: {
                    mime_type: 'image/jpeg',
                    data: referenceImageBase64,
                },
            });
        }

        // Add single reference image URL (backward compat)
        if (referenceImageUrl) {
            const base64 = await fetchImageAsBase64(referenceImageUrl);
            if (base64) {
                parts.push({
                    inline_data: {
                        mime_type: 'image/jpeg',
                        data: base64,
                    },
                });
            }
        }

        // Add multiple reference images (for character consistency)
        if (referenceImageUrls && referenceImageUrls.length > 0) {
            for (const url of referenceImageUrls) {
                const base64 = await fetchImageAsBase64(url);
                if (base64) {
                    parts.push({
                        inline_data: {
                            mime_type: 'image/jpeg',
                            data: base64,
                        },
                    });
                }
            }
        }

        // Add text prompt AFTER images
        parts.push({ text: prompt });

        // Map UI models to Gemini 2.0 Flash for native multimodal image generation
        // Imagen 4 does NOT support reference images, so we use Gemini's native image gen
        const modelMap: Record<string, string> = {
            'imagen-4-fast': 'gemini-2.0-flash-exp-image-generation',
            'imagen-4-ultra': 'gemini-2.0-flash-exp-image-generation',
            'nano-banana-pro': 'gemini-2.0-flash-exp-image-generation',
            default: 'gemini-2.0-flash-exp-image-generation',
        };

        const targetModel = modelMap[model || 'default'] || modelMap['default'];
        console.log(`[ImageGen] Using model: ${targetModel}`);

        // Use Gemini API for multimodal image generation
        const dynamicApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent`;

        const response = await fetch(`${dynamicApiUrl}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: 'user',
                        parts,
                    },
                ],
                generationConfig: {
                    responseModalities: ['TEXT', 'IMAGE'],
                },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini Image API error:', errorText);

            // Fallback to mock on API error
            const seed = Math.abs(prompt.split('').reduce((a, b) => a + b.charCodeAt(0), 0));
            return NextResponse.json({
                success: true,
                imageUrl: `https://picsum.photos/seed/${seed}/512/512`,
                mock: true,
                error: 'API unavailable, using placeholder',
            });
        }

        const data = await response.json();

        // Extract image from Gemini response
        const candidates = data.candidates || [];
        const parts_response = candidates[0]?.content?.parts || [];

        // Find the image part
        const imagePart = parts_response.find(
            (p: { inline_data?: { data: string; mime_type: string } }) => p.inline_data
        );

        if (imagePart?.inline_data) {
            // Return as base64 data URL
            const { mime_type, data: imageData } = imagePart.inline_data;
            const dataUrl = `data:${mime_type};base64,${imageData}`;

            return NextResponse.json({
                success: true,
                imageUrl: dataUrl,
                usage: data.usageMetadata,
            });
        }

        // No image generated, return mock
        const seed = Math.abs(prompt.split('').reduce((a, b) => a + b.charCodeAt(0), 0));
        return NextResponse.json({
            success: true,
            imageUrl: `https://picsum.photos/seed/${seed}/512/512`,
            mock: true,
            error: 'No image generated',
        });
    } catch (error) {
        console.error('Image Gen API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
