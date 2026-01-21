import { WorkflowCanvas } from '@features/workflow-editor/components/canvas';
import { HelpPanel } from '@features/workflow-editor/components';
import { VariablesPanel } from '@features/workflow-editor/components/variables/VariablesPanel';
import { ExecutionHistoryPanel } from '@features/workflow-editor/components/history/ExecutionHistoryPanel';

export default function WorkflowNewPage() {
    return (
        <div className="h-screen w-screen overflow-hidden">
            <WorkflowCanvas />
            <HelpPanel />
            <VariablesPanel />
            <ExecutionHistoryPanel />
        </div>
    );
}
