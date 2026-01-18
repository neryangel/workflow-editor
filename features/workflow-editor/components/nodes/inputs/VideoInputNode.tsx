"use client";

import { memo, useCallback, useRef } from "react";
import { NodeProps, useReactFlow } from "@xyflow/react";
import { BaseNode } from "../base/BaseNode";
import { HandleRow } from "../base/NodeHandle";
import { NodeData } from "../../../types";
import { PORT_COLORS } from "../../../constants";
import { Upload } from "lucide-react";

function VideoInputNodeComponent({ id, data, selected }: NodeProps) {
  const { setNodes } = useReactFlow();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nodeData = data as unknown as NodeData;
  const videoUrl = nodeData.outputs?.out_video?.value as string | undefined;
  const videoColor = PORT_COLORS.video;

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
                  out_video: {
                    ...currentData.outputs.out_video,
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
          accept="video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <div
          onClick={() => fileInputRef.current?.click()}
          className="aspect-video rounded-lg border-2 border-dashed cursor-pointer
                     overflow-hidden flex items-center justify-center min-h-[100px] bg-black transition-colors"
          style={{ borderColor: videoUrl ? `${videoColor}50` : "#334155" }}
        >
          {videoUrl ? (
            <video
              src={videoUrl}
              controls
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-center p-4">
              <Upload className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p className="text-xs text-slate-500">Click to upload video</p>
            </div>
          )}
        </div>
        <HandleRow
          outputs={[{ id: "out_video", type: "video", label: "video" }]}
        />
      </div>
    </BaseNode>
  );
}

export const VideoInputNode = memo(VideoInputNodeComponent);
