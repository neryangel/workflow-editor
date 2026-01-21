// OutputExecutor - Handles output node execution
// Output nodes are terminal nodes that display results

import { BaseExecutor, ExecutorInputs, ExecutorOutputs } from './BaseExecutor';
import { WorkflowNodeType } from '../../types';

export class OutputExecutor extends BaseExecutor {
    readonly nodeType: WorkflowNodeType = 'output';

    async execute(inputs: ExecutorInputs): Promise<ExecutorOutputs> {
        // Output nodes pass through their inputs as outputs
        // This allows them to be terminal nodes in the workflow
        return inputs;
    }
}
