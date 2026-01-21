'use client';

import { memo, useCallback } from 'react';
import { NodeProps, useReactFlow } from '@xyflow/react';
import { NodeData } from '../../../types';
import { MessageSquare } from 'lucide-react';

function CommentNodeComponent({ id, data, selected }: NodeProps) {
    const { setNodes, setEdges } = useReactFlow();
    const nodeData = data as unknown as NodeData;
    const text = (nodeData.meta?.text as string) || '';
    const color = (nodeData.meta?.color as string) || '#fbbf24';

    const handleTextChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setNodes((nds) =>
                nds.map((node) => {
                    if (node.id === id) {
                        const currentData = node.data as unknown as NodeData;
                        return {
                            ...node,
                            data: {
                                ...currentData,
                                meta: {
                                    ...currentData.meta,
                                    text: e.target.value,
                                },
                            },
                        };
                    }
                    return node;
                })
            );
        },
        [id, setNodes]
    );

    const handleDelete = useCallback(() => {
        setNodes((nds) => nds.filter((node) => node.id !== id));
        setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
    }, [id, setNodes, setEdges]);

    return (
        <div
            className={`min-w-[200px] max-w-[300px] rounded-lg p-3 relative ${selected ? 'ring-2 ring-white/30' : ''}`}
            style={{
                backgroundColor: `${color}20`,
                borderLeft: `4px solid ${color}`,
            }}
        >
            <div className="flex items-center gap-2 mb-2 justify-between">
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" style={{ color }} />
                    <span className="text-xs font-medium" style={{ color }}>
                        Comment
                    </span>
                </div>
                <button
                    onClick={handleDelete}
                    className="opacity-0 hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded"
                    title="Delete"
                >
                    <span className="text-xs text-slate-400">×</span>
                </button>
            </div>
            <textarea
                value={text}
                onChange={handleTextChange}
                placeholder="Add a note..."
                className="w-full min-h-[60px] bg-transparent border-none resize-none
                    text-sm text-slate-300 placeholder:text-slate-500 focus:outline-none"
            />
        </div>
    );
}

export const CommentNode = memo(CommentNodeComponent);
