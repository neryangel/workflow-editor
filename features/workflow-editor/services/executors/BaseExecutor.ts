// Base Executor - Abstract class for node execution

import { WorkflowNodeType } from "../../types";

export interface ExecutorInputs {
  [key: string]: unknown;
}

export interface ExecutorOutputs {
  [key: string]: unknown;
}

export abstract class BaseExecutor {
  abstract readonly nodeType: WorkflowNodeType;

  abstract execute(
    inputs: ExecutorInputs,
    meta?: Record<string, unknown>,
  ): Promise<ExecutorOutputs>;

  protected delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
