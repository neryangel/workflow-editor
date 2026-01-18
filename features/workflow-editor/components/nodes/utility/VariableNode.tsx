"use client";

import { memo, useCallback } from "react";
import { NodeProps, useReactFlow } from "@xyflow/react";
import { BaseNode } from "../base/BaseNode";
import { HandleRow } from "../base/NodeHandle";
import { NodeData } from "../../../types";
import { Database } from "lucide-react";

function VariableNodeComponent({ id, data, selected }: NodeProps) {
  const { setNodes } = useReactFlow();
  const nodeData = data as unknown as NodeData;
  const variableName = (nodeData.meta?.name as string) || "variable";
  const storedValue = nodeData.outputs?.out_value?.value as string | undefined;

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            const currentData = node.data as unknown as NodeData;
            return {
              ...node,
              data: {
                ...currentData,
                label: `Var: ${e.target.value}`,
                meta: {
                  ...currentData.meta,
                  name: e.target.value,
                },
              },
            };
          }
          return node;
        }),
      );
    },
    [id, setNodes],
  );

  return (
    <BaseNode
      label={nodeData.label}
      status={nodeData.status}
      error={nodeData.error}
      selected={selected}
      icon={<Database className="w-4 h-4" />}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Name:</label>
          <input
            type="text"
            value={variableName}
            onChange={handleNameChange}
            className="flex-1 px-2 py-1.5 text-sm bg-slate-900 border border-slate-800 rounded
                           text-slate-200 focus:outline-none focus:border-slate-700"
          />
        </div>

        <div
          className="min-h-[40px] rounded-lg p-2 text-xs"
          style={{ backgroundColor: "#0f172a" }}
        >
          {storedValue ? (
            <span className="text-slate-300">{storedValue}</span>
          ) : (
            <span className="text-slate-600">No value stored</span>
          )}
        </div>

        <HandleRow
          inputs={[{ id: "in_value", type: "any", label: "set" }]}
          outputs={[{ id: "out_value", type: "any", label: "get" }]}
        />
      </div>
    </BaseNode>
  );
}

export const VariableNode = memo(VariableNodeComponent);
