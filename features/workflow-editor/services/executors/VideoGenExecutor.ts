// VideoGen Executor - Handles video generation node execution

import { BaseExecutor, ExecutorInputs, ExecutorOutputs } from "./BaseExecutor";
import { WorkflowNodeType } from "../../types";

export class VideoGenExecutor extends BaseExecutor {
  readonly nodeType: WorkflowNodeType = "videoGen";

  async execute(
    _inputs: ExecutorInputs,
    _meta?: Record<string, unknown>,
  ): Promise<ExecutorOutputs> {
    await this.delay(1000 + Math.random() * 1000);

    // Mock video URL
    return {
      out_video:
        "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
    };
  }
}
