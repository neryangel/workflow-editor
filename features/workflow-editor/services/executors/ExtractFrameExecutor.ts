// ExtractFrame Executor - Handles frame extraction from video

import { BaseExecutor, ExecutorInputs, ExecutorOutputs } from './BaseExecutor';
import { WorkflowNodeType } from '../../types';

export class ExtractFrameExecutor extends BaseExecutor {
    readonly nodeType: WorkflowNodeType = 'extractFrame';

    async execute(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        inputs: ExecutorInputs,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        meta?: Record<string, unknown>
    ): Promise<ExecutorOutputs> {
        await this.delay(300 + Math.random() * 300);

        // Mock frame extraction
        return {
            out_image: 'https://picsum.photos/seed/frame/400/300',
        };
    }
}
