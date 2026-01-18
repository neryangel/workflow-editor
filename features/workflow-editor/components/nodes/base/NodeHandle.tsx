"use client";

import { Handle, Position } from "@xyflow/react";
import { PortType } from "../../../types";
import { PORT_COLORS } from "../../../constants";

interface CustomHandleProps {
  type: "source" | "target";
  position: Position;
  id: string;
  portType: PortType;
  label?: string;
}

export function CustomHandle({
  type,
  position,
  id,
  portType,
  label,
}: CustomHandleProps) {
  const isLeft = position === Position.Left;
  const color = PORT_COLORS[portType];

  return (
    <div
      className={`
        relative flex items-center gap-2
        ${isLeft ? "flex-row" : "flex-row-reverse"}
      `}
    >
      <Handle
        type={type}
        position={position}
        id={id}
        className="!w-2.5 !h-2.5 !border-0 !rounded-full transition-transform hover:!scale-125"
        style={{
          backgroundColor: color,
          position: "relative",
          transform: "none",
          top: "auto",
          left: "auto",
          right: "auto",
        }}
      />
      {label && (
        <span
          className="text-[10px] uppercase tracking-wide font-medium"
          style={{ color }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

interface HandleRowProps {
  inputs?: { id: string; type: PortType; label?: string }[];
  outputs?: { id: string; type: PortType; label?: string }[];
}

export function HandleRow({ inputs = [], outputs = [] }: HandleRowProps) {
  return (
    <div className="flex justify-between items-start -mx-3 px-1 pt-2">
      {/* Inputs (left side) */}
      <div className="flex flex-col gap-2.5">
        {inputs.map((input) => (
          <CustomHandle
            key={input.id}
            type="target"
            position={Position.Left}
            id={input.id}
            portType={input.type}
            label={input.label}
          />
        ))}
      </div>

      {/* Outputs (right side) */}
      <div className="flex flex-col gap-2.5 items-end">
        {outputs.map((output) => (
          <CustomHandle
            key={output.id}
            type="source"
            position={Position.Right}
            id={output.id}
            portType={output.type}
            label={output.label}
          />
        ))}
      </div>
    </div>
  );
}
