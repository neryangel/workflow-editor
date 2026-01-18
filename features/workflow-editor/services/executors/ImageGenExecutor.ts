// ImageGen Executor - Handles image generation node execution

import { BaseExecutor, ExecutorInputs, ExecutorOutputs } from "./BaseExecutor";
import { WorkflowNodeType } from "../../types";

export class ImageGenExecutor extends BaseExecutor {
  readonly nodeType: WorkflowNodeType = "imageGen";

  async execute(
    inputs: ExecutorInputs,
    _meta?: Record<string, unknown>,
  ): Promise<ExecutorOutputs> {
    await this.delay(500 + Math.random() * 500);

    const prompt = (inputs.in_text as string) || "";
    const seed = encodeURIComponent(prompt.slice(0, 30) || "default");
    const imageUrl = `https://picsum.photos/seed/${seed}/400/300`;

    return {
      out_image: imageUrl,
    };
  }
}
