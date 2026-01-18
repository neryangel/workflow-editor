// API Route Tests - /api/ai/llm
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Next.js server
vi.mock("next/server", () => ({
  NextRequest: class MockNextRequest {
    private body: string;
    constructor(_url: string, init?: RequestInit) {
      this.body = (init?.body as string) || "{}";
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

describe("/api/ai/llm", () => {
  let POST: typeof import("@/app/api/ai/llm/route").POST;
  let MockNextRequest: typeof import("next/server").NextRequest;

  beforeEach(async () => {
    vi.resetModules();
    vi.stubEnv("GEMINI_API_KEY", "");
    const routeModule = await import("@/app/api/ai/llm/route");
    POST = routeModule.POST;
    const serverModule = await import("next/server");
    MockNextRequest = serverModule.NextRequest;
  });

  it("should return 400 for missing prompt", async () => {
    const req = new MockNextRequest("http://localhost/api/ai/llm", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
  });

  it("should return mock response when no API key", async () => {
    const req = new MockNextRequest("http://localhost/api/ai/llm", {
      method: "POST",
      body: JSON.stringify({ prompt: "Test prompt" }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.mock).toBe(true);
    expect(data.text).toContain("Mock Response");
  });

  it("should include prompt in mock response", async () => {
    const req = new MockNextRequest("http://localhost/api/ai/llm", {
      method: "POST",
      body: JSON.stringify({ prompt: "Hello World Test" }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(data.text).toContain("Hello World Test");
  });
});
