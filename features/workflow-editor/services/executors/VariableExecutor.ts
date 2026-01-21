// VariableExecutor - Handles variable node execution
// Variable nodes provide stored values to the workflow

import { BaseExecutor, ExecutorInputs, ExecutorOutputs } from './BaseExecutor';
import { WorkflowNodeType } from '../../types';

export class VariableExecutor extends BaseExecutor {
    readonly nodeType: WorkflowNodeType = 'variable';

    async execute(
        inputs: ExecutorInputs,
        meta?: Record<string, unknown>
    ): Promise<ExecutorOutputs> {
        // Variable nodes output their stored value
        // The value is typically stored in meta.value
        const value = meta?.value ?? '';

        return {
            out_value: value,
        };
    }
}
