'use client';

import { memo, useCallback } from 'react';
import { NodeProps, useReactFlow } from '@xyflow/react';
import { BaseNode } from '../base/BaseNode';
import { HandleRow } from '../base/NodeHandle';
import { NodeData } from '../../../types';

function SystemPromptNodeComponent({ id, data, selected }: NodeProps) {
    const { setNodes, setEdges } = useReactFlow();
    const nodeData = data as unknown as NodeData;
    const textValue = (nodeData.outputs?.out_text?.value as string) || '';

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const newValue = e.target.value;
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
                                    out_text: {
                                        ...currentData.outputs.out_text,
                                        value: newValue,
                                    },
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

    const handleLabelChange = useCallback(
        (newLabel: string) => {
            setNodes((nds) =>
                nds.map((node) => {
                    if (node.id === id) {
                        const currentData = node.data as unknown as NodeData;
                        return {
                            ...node,
                            data: {
                                ...currentData,
                                label: newLabel,
                            },
                        };
                    }
                    return node;
                })
            );
        },
        [id, setNodes]
    );

    const handleDuplicate = useCallback(() => {
        const newId = `${id}-copy-${Date.now()}`;
        setNodes((nds) => {
            const nodeToDuplicate = nds.find((n) => n.id === id);
            if (!nodeToDuplicate) return nds;

            const newNode = {
                ...nodeToDuplicate,
                id: newId,
                position: {
                    x: nodeToDuplicate.position.x + 50,
                    y: nodeToDuplicate.position.y + 50,
                },
                selected: false,
            };

            return [...nds, newNode];
        });
    }, [id, setNodes]);

    return (
        <BaseNode
            label={nodeData.label}
            status={nodeData.status}
            error={nodeData.error}
            selected={selected}
            onDelete={handleDelete}
            onLabelChange={handleLabelChange}
            onDuplicate={handleDuplicate}
        >
            <div className="flex flex-col gap-3">
                <textarea
                    value={textValue}
                    onChange={handleChange}
                    placeholder="You are a helpful assistant..."
                    className="w-full min-h-[80px] px-3 py-2 text-sm bg-slate-900 border border-amber-900/50 rounded-lg
                     text-slate-200 placeholder-slate-600 resize-none
                     focus:outline-none focus:border-amber-700 transition-colors"
                />
                <HandleRow outputs={[{ id: 'out_text', type: 'text', label: 'system' }]} />
            </div>
        </BaseNode>
    );
}

export const SystemPromptNode = memo(SystemPromptNodeComponent);
