// Input Executor - Handles all input nodes (text, image, video, audio)

import { BaseExecutor, ExecutorInputs, ExecutorOutputs } from "./BaseExecutor";
import { WorkflowNodeType } from "../../types";

export class InputExecutor extends BaseExecutor {
  readonly nodeType: WorkflowNodeType = "inputText"; // Generic for all inputs

  async execute(
    _inputs: ExecutorInputs,
    _meta?: Record<string, unknown>,
  ): Promise<ExecutorOutputs> {
    // Input nodes just pass through their pre-set values
    // The values are already set in outputs by user interaction
    return {};
  }
}
