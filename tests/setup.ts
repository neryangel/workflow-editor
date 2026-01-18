// Test setup file for Vitest
import "@testing-library/jest-dom/vitest";
import { vi, beforeEach } from "vitest";

// Mock Next.js server components
vi.mock("next/server", () => ({
  NextRequest: class MockNextRequest {
    private body: unknown;
    constructor(url: string, init?: RequestInit) {
      this.body = init?.body;
    }
    async json() {
      return typeof this.body === "string" ? JSON.parse(this.body) : this.body;
    }
  },
  NextResponse: {
    json: (data: unknown, init?: ResponseInit) => ({
      json: async () => data,
      status: init?.status || 200,
    }),
  },
}));

// Mock fetch for API tests
global.fetch = vi.fn();

// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});
