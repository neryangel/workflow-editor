// Executor Unit Tests - Aligned with actual implementations
import { describe, it, expect } from "vitest";
import { InputExecutor } from "@features/workflow-editor/services/executors/InputExecutor";
import { LLMExecutor } from "@features/workflow-editor/services/executors/LLMExecutor";
import { ImageGenExecutor } from "@features/workflow-editor/services/executors/ImageGenExecutor";
import { VideoGenExecutor } from "@features/workflow-editor/services/executors/VideoGenExecutor";
import { ExtractFrameExecutor } from "@features/workflow-editor/services/executors/ExtractFrameExecutor";

describe("InputExecutor", () => {
  const executor = new InputExecutor();

  it("should return empty object (values are pre-set by user)", async () => {
    const inputs = { text: "Hello World" };
    const result = await executor.execute(inputs, {});
    // InputExecutor returns {} because values are already set in node outputs
    expect(result).toEqual({});
  });

  it("should handle empty inputs", async () => {
    const result = await executor.execute({}, {});
    expect(result).toEqual({});
  });

  it("should have correct nodeType", () => {
    expect(executor.nodeType).toBe("inputText");
  });
});

describe("LLMExecutor", () => {
  const executor = new LLMExecutor();

  it("should return out_text with processed content", async () => {
    const result = await executor.execute({ in_text: "Test" }, {});
    expect(result.out_text).toBeDefined();
    expect(typeof result.out_text).toBe("string");
  });

  it("should prefix with [Processed] when no system prompt", async () => {
    const result = await executor.execute({ in_text: "Hello" }, {});
    expect(result.out_text).toContain("[Processed]");
    expect(result.out_text).toContain("Hello");
  });

  it("should prefix with [Enhanced] when system prompt provided", async () => {
    const result = await executor.execute(
      {
        in_text: "Hello",
        in_system: "Be creative",
      },
      {},
    );
    expect(result.out_text).toContain("[Enhanced]");
  });

  it("should have correct nodeType", () => {
    expect(executor.nodeType).toBe("llm");
  });
});

describe("ImageGenExecutor", () => {
  const executor = new ImageGenExecutor();

  it("should return out_image with picsum URL", async () => {
    const result = await executor.execute({ in_text: "A sunset" }, {});
    expect(result.out_image).toBeDefined();
    expect(typeof result.out_image).toBe("string");
    expect(result.out_image).toContain("picsum.photos");
  });

  it("should have correct nodeType", () => {
    expect(executor.nodeType).toBe("imageGen");
  });
});

describe("VideoGenExecutor", () => {
  const executor = new VideoGenExecutor();

  it("should return out_video with mock URL", async () => {
    const result = await executor.execute({ in_text: "A video" }, {});
    expect(result.out_video).toBeDefined();
    expect(typeof result.out_video).toBe("string");
  });

  it("should have correct nodeType", () => {
    expect(executor.nodeType).toBe("videoGen");
  });
});

describe("ExtractFrameExecutor", () => {
  const executor = new ExtractFrameExecutor();

  it("should return out_image with picsum URL", async () => {
    const result = await executor.execute({ in_video: "mock-video-url" }, {});
    expect(result.out_image).toBeDefined();
    expect(typeof result.out_image).toBe("string");
    expect(result.out_image).toContain("picsum.photos");
  });

  it("should have correct nodeType", () => {
    expect(executor.nodeType).toBe("extractFrame");
  });
});
