// LLM Executor - Handles LLM node execution

import { BaseExecutor, ExecutorInputs, ExecutorOutputs } from "./BaseExecutor";
import { WorkflowNodeType } from "../../types";

export class LLMExecutor extends BaseExecutor {
  readonly nodeType: WorkflowNodeType = "llm";

  async execute(
    inputs: ExecutorInputs,
    _meta?: Record<string, unknown>,
  ): Promise<ExecutorOutputs> {
    await this.delay(500 + Math.random() * 500);

    const systemText = (inputs.in_system as string) || "";
    const inputText = (inputs.in_text as string) || "";

    // Mock LLM response
    const outputText = systemText
      ? `[Enhanced] ${inputText}`
      : `[Processed] ${inputText}`;

    return {
      out_text: outputText,
    };
  }
}
