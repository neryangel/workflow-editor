"use client";

import { ReactNode } from "react";
import { NodeStatus } from "../../../types";
import { Loader2, CheckCircle2, XCircle, MoreHorizontal } from "lucide-react";

export interface BaseNodeProps {
  label: string;
  status: NodeStatus;
  error?: string;
  children: ReactNode;
  selected?: boolean;
  icon?: ReactNode;
}

const statusConfig: Record<
  NodeStatus,
  {
    icon: ReactNode;
    borderClass: string;
  }
> = {
  idle: {
    icon: null,
    borderClass: "border-slate-800",
  },
  running: {
    icon: <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />,
    borderClass: "border-blue-500/50",
  },
  success: {
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />,
    borderClass: "border-green-500/50",
  },
  error: {
    icon: <XCircle className="w-3.5 h-3.5 text-red-400" />,
    borderClass: "border-red-500/50",
  },
};

export function BaseNode({
  label,
  status,
  error,
  children,
  selected,
  icon,
}: BaseNodeProps) {
  const { icon: statusIcon, borderClass } = statusConfig[status];
  const displayIcon = statusIcon || icon;

  return (
    <div
      className={`
        min-w-[260px] max-w-[300px] rounded-xl border 
        bg-slate-900
        transition-all duration-200
        ${borderClass}
        ${selected ? "ring-2 ring-white/20" : ""}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          {displayIcon}
          <span className="text-sm font-medium text-slate-200">{label}</span>
        </div>
        <button className="p-1 hover:bg-slate-800 rounded transition-colors">
          <MoreHorizontal className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      {/* Content */}
      <div className="p-3">{children}</div>

      {/* Error message */}
      {error && (
        <div className="px-3 pb-3">
          <div className="px-2.5 py-1.5 bg-red-950/50 border border-red-500/30 rounded-lg">
            <p className="text-xs text-red-400 truncate">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
