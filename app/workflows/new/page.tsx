import { WorkflowCanvas } from '@features/workflow-editor/components/canvas';
import { HelpPanel } from '@features/workflow-editor/components';

export default function WorkflowNewPage() {
    return (
        <div className="h-screen w-screen overflow-hidden">
            <WorkflowCanvas />
            <HelpPanel />
        </div>
    );
}
