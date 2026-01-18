'use client';

import { memo } from 'react';
import { Play, Loader2, X } from 'lucide-react';

export interface WorkflowRunButtonProps {
    isRunning: boolean;
    nodeCount: number;
    onRun: () => void;
    onCancel: () => void;
}

/**
 * Run button component with cancel support
 * Memoized to prevent unnecessary re-renders
 */
export const WorkflowRunButton = memo(function WorkflowRunButton({
    isRunning,
    nodeCount,
    onRun,
    onCancel,
}: WorkflowRunButtonProps) {
    if (isRunning) {
        return (
            <div className="flex gap-2">
                <button
                    onClick={onCancel}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm
                     bg-red-600/20 text-red-400 border border-red-500/30
                     hover:bg-red-600/30 transition-all duration-200"
                >
                    <X className="w-4 h-4" />
                    Cancel
                </button>
                <div
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm
                     bg-slate-700 text-slate-300 cursor-wait"
                >
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Running...
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={onRun}
            disabled={nodeCount === 0}
            className={`
        flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm
        transition-all duration-200
        ${
            nodeCount === 0
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-white text-slate-900 hover:bg-slate-100'
        }
      `}
        >
            <Play className="w-4 h-4" />
            Run all
        </button>
    );
});
