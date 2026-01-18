import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { llmRequestSchema } from "@/shared/lib/api-schemas";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate with Zod
    const parseResult = llmRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 },
      );
    }

    const { prompt, systemPrompt } = parseResult.data;

    if (!GEMINI_API_KEY) {
      // Fallback to mock response if no API key
      return NextResponse.json({
        success: true,
        text: `[Mock Response] ${prompt.substring(0, 50)}...`,
        mock: true,
      });
    }

    // Build the request for Gemini API
    const contents = [];

    if (systemPrompt) {
      contents.push({
        role: "user",
        parts: [{ text: `System: ${systemPrompt}` }],
      });
    }

    contents.push({
      role: "user",
      parts: [{ text: prompt }],
    });

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", errorText);
      return NextResponse.json(
        { error: "API request failed", details: errorText },
        { status: response.status },
      );
    }

    const data = await response.json();

    // Extract text from Gemini response
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return NextResponse.json({
      success: true,
      text,
      usage: data.usageMetadata,
    });
  } catch (error) {
    console.error("LLM API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.flatten() },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
