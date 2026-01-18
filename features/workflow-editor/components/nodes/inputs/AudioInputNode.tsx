"use client";

import { memo, useCallback, useRef } from "react";
import { NodeProps, useReactFlow } from "@xyflow/react";
import { BaseNode } from "../base/BaseNode";
import { HandleRow } from "../base/NodeHandle";
import { NodeData } from "../../../types";
import { PORT_COLORS } from "../../../constants";
import { Upload } from "lucide-react";

function AudioInputNodeComponent({ id, data, selected }: NodeProps) {
  const { setNodes } = useReactFlow();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nodeData = data as unknown as NodeData;
  const audioUrl = nodeData.outputs?.out_audio?.value as string | undefined;
  const audioColor = PORT_COLORS.audio;

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const url = URL.createObjectURL(file);
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            const currentData = node.data as unknown as NodeData;
            return {
              ...node,
              data: {
                ...currentData,
                outputs: {
                  ...currentData.outputs,
                  out_audio: {
                    ...currentData.outputs.out_audio,
                    value: url,
                  },
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
    >
      <div className="flex flex-col gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <div
          onClick={() => fileInputRef.current?.click()}
          className="rounded-lg border-2 border-dashed cursor-pointer p-4 transition-colors"
          style={{
            borderColor: audioUrl ? `${audioColor}50` : "#334155",
            backgroundColor: "#0f172a",
          }}
        >
          {audioUrl ? (
            <audio src={audioUrl} controls className="w-full" />
          ) : (
            <div className="text-center">
              <Upload className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p className="text-xs text-slate-500">Click to upload audio</p>
            </div>
          )}
        </div>
        <HandleRow
          outputs={[{ id: "out_audio", type: "audio", label: "audio" }]}
        />
      </div>
    </BaseNode>
  );
}

export const AudioInputNode = memo(AudioInputNodeComponent);
