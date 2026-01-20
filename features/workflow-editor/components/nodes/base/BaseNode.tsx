'use client';

import { ReactNode, useState, useRef, useEffect } from 'react';
import { NodeStatus } from '../../../types';
import { Loader2, CheckCircle2, XCircle, MoreHorizontal, Trash2, Copy, Edit2 } from 'lucide-react';

export interface BaseNodeProps {
    label: string;
    status: NodeStatus;
    error?: string;
    children: ReactNode;
    selected?: boolean;
    icon?: ReactNode;
    onDelete?: () => void;
    onDuplicate?: () => void;
    onLabelChange?: (newLabel: string) => void;
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
        borderClass: 'border-slate-800',
    },
    running: {
        icon: <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />,
        borderClass: 'border-blue-500/50',
    },
    success: {
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />,
        borderClass: 'border-green-500/50',
    },
    error: {
        icon: <XCircle className="w-3.5 h-3.5 text-red-400" />,
        borderClass: 'border-red-500/50',
    },
};

export function BaseNode({
    label,
    status,
    error,
    children,
    selected,
    icon,
    onDelete,
    onDuplicate,
    onLabelChange,
}: BaseNodeProps) {
    const [showMenu, setShowMenu] = useState(false);
    const [isEditingLabel, setIsEditingLabel] = useState(false);
    const [editLabel, setEditLabel] = useState(label);
    const labelInputRef = useRef<HTMLInputElement>(null);
    const { icon: statusIcon, borderClass } = statusConfig[status];
    const displayIcon = statusIcon || icon;

    // Focus input when editing starts
    useEffect(() => {
        if (isEditingLabel && labelInputRef.current) {
            labelInputRef.current.focus();
            labelInputRef.current.select();
        }
    }, [isEditingLabel]);

    const handleLabelDoubleClick = () => {
        if (onLabelChange) {
            setEditLabel(label);
            setIsEditingLabel(true);
        }
    };

    const handleLabelBlur = () => {
        if (editLabel.trim() && editLabel !== label && onLabelChange) {
            onLabelChange(editLabel.trim());
        }
        setIsEditingLabel(false);
    };

    const handleLabelKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleLabelBlur();
        } else if (e.key === 'Escape') {
            setEditLabel(label);
            setIsEditingLabel(false);
        }
    };

    return (
        <div
            className={`
        min-w-[260px] max-w-[300px] rounded-xl border 
        bg-slate-900
        transition-all duration-200
        ${borderClass}
        ${selected ? 'ring-2 ring-white/20' : ''}
      `}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-800">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    {displayIcon}
                    {isEditingLabel ? (
                        <input
                            ref={labelInputRef}
                            type="text"
                            value={editLabel}
                            onChange={(e) => setEditLabel(e.target.value)}
                            onBlur={handleLabelBlur}
                            onKeyDown={handleLabelKeyDown}
                            className="text-sm font-medium text-slate-200 bg-slate-800 px-2 py-0.5 rounded
                                     border border-blue-500 outline-none min-w-0 flex-1"
                            onClick={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <span
                            className={`text-sm font-medium text-slate-200 ${onLabelChange ? 'cursor-text hover:text-blue-400 transition-colors' : ''}`}
                            onDoubleClick={handleLabelDoubleClick}
                            title={onLabelChange ? 'Double-click to edit' : undefined}
                        >
                            {label}
                        </span>
                    )}
                </div>
                <div className="relative">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(!showMenu);
                        }}
                        className="p-1 hover:bg-slate-800 rounded transition-colors"
                    >
                        <MoreHorizontal className="w-4 h-4 text-slate-500" />
                    </button>

                    {/* Context Menu */}
                    {showMenu && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setShowMenu(false)}
                            />
                            <div className="absolute right-0 top-full mt-1 w-36 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
                                {onLabelChange && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditLabel(label);
                                            setIsEditingLabel(true);
                                            setShowMenu(false);
                                        }}
                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Edit Label
                                    </button>
                                )}
                                {onDuplicate && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDuplicate();
                                            setShowMenu(false);
                                        }}
                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
                                    >
                                        <Copy className="w-4 h-4" />
                                        Duplicate
                                    </button>
                                )}
                                {onDelete && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete();
                                            setShowMenu(false);
                                        }}
                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-slate-700 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
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
