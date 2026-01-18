// ExtractFrame Executor - Handles frame extraction from video

import { BaseExecutor, ExecutorInputs, ExecutorOutputs } from "./BaseExecutor";
import { WorkflowNodeType } from "../../types";

export class ExtractFrameExecutor extends BaseExecutor {
  readonly nodeType: WorkflowNodeType = "extractFrame";

  async execute(
    _inputs: ExecutorInputs,
    _meta?: Record<string, unknown>,
  ): Promise<ExecutorOutputs> {
    await this.delay(300 + Math.random() * 300);

    // Mock frame extraction
    return {
      out_image: "https://picsum.photos/seed/frame/400/300",
    };
  }
}
