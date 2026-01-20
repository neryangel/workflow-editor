// API Route for running workflow - Uses new architecture with Zod validation
import { NextRequest, NextResponse } from "next/server";
import { getWorkflowEngine } from "@features/workflow-editor/services/engine";
import { RunWorkflowResponse } from "@features/workflow-editor/types";
import { runWorkflowRequestSchema } from "@/shared/lib/api-schemas";

export async function POST(
  request: NextRequest,
): Promise<NextResponse<RunWorkflowResponse>> {
  try {
    const body = await request.json();

    // Validate with Zod
    const parseResult = runWorkflowRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Validation failed: ${parseResult.error.message}`,
        },
        { status: 400 },
      );
    }

    const { nodes, edges, variables } = parseResult.data;

    // Validate node structure (additional business logic validation)
    for (const node of nodes) {
      if (!node.id || !node.type) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid node structure: ${JSON.stringify(node)}`,
          },
          { status: 400 },
        );
      }
    }

    // Execute workflow using new engine
    const engine = getWorkflowEngine();
    const result = await engine.execute(
      nodes as unknown as import("@features/workflow-editor/types").WorkflowNode[],
      edges as unknown as import("@features/workflow-editor/types").WorkflowEdge[],
      variables,
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Workflow execution error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}
