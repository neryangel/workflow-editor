// API Route Tests - /api/run-workflow
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the workflow engine
vi.mock("@features/workflow-editor/services/engine", () => ({
  getWorkflowEngine: () => ({
    execute: vi.fn().mockResolvedValue({
      success: true,
      nodes: [],
    }),
  }),
}));

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

describe("/api/run-workflow", () => {
  let POST: typeof import("@/app/api/run-workflow/route").POST;
  let MockNextRequest: typeof import("next/server").NextRequest;

  beforeEach(async () => {
    vi.resetModules();
    const routeModule = await import("@/app/api/run-workflow/route");
    POST = routeModule.POST;
    const serverModule = await import("next/server");
    MockNextRequest = serverModule.NextRequest;
  });

  it("should return 400 for missing nodes", async () => {
    const req = new MockNextRequest("http://localhost/api/run-workflow", {
      method: "POST",
      body: JSON.stringify({ edges: [] }),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
  });

  it("should return 400 for missing edges", async () => {
    const req = new MockNextRequest("http://localhost/api/run-workflow", {
      method: "POST",
      body: JSON.stringify({ nodes: [] }),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
  });

  it("should return 400 for invalid node structure", async () => {
    const req = new MockNextRequest("http://localhost/api/run-workflow", {
      method: "POST",
      body: JSON.stringify({
        nodes: [{ invalid: true }],
        edges: [],
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
  });

  it("should execute valid workflow", async () => {
    const req = new MockNextRequest("http://localhost/api/run-workflow", {
      method: "POST",
      body: JSON.stringify({
        nodes: [
          {
            id: "n1",
            type: "inputText",
            data: { label: "Test" },
          },
        ],
        edges: [],
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
  });
});
