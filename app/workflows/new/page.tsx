import { WorkflowCanvas } from "@features/workflow-editor/components/canvas";

export default function WorkflowNewPage() {
  return (
    <div className="h-screen w-screen overflow-hidden">
      <WorkflowCanvas />
    </div>
  );
}
