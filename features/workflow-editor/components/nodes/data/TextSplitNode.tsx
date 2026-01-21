'use client';

import { memo, useCallback } from 'react';
import { NodeProps, useReactFlow } from '@xyflow/react';
import { BaseNode } from '../base/BaseNode';
import { HandleRow } from '../base/NodeHandle';
import { NodeData } from '../../../types';
import { Scissors } from 'lucide-react';

function TextSplitNodeComponent({ id, data, selected }: NodeProps) {
    const { setNodes, setEdges } = useReactFlow();
    const nodeData = data as unknown as NodeData;
    const separator = (nodeData.meta?.separator as string) || '\n';
    const inputText = nodeData.inputs?.in_text?.value as string | undefined;
    const outputArray = nodeData.outputs?.out_array?.value as string[] | undefined;

    const handleSeparatorChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const newSeparator = e.target.value;
            setNodes((nds) =>
                nds.map((node) => {
                    if (node.id === id) {
                        const currentData = node.data as unknown as NodeData;

                        // Process the split immediately
                        let resultArray: string[] = [];
                        if (inputText) {
                            resultArray = inputText.split(newSeparator || '\n');
                        }

                        return {
                            ...node,
                            data: {
                                ...currentData,
                                meta: {
                                    ...currentData.meta,
                                    separator: newSeparator,
                                },
                                outputs: {
                                    ...currentData.outputs,
                                    out_array: {
                                        ...currentData.outputs.out_array,
                                        value: resultArray,
                                    },
                                },
                            },
                        };
                    }
                    return node;
                })
            );
        },
        [id, setNodes, inputText]
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
            icon={<Scissors className="w-4 h-4" />}
            onDelete={handleDelete}
            onLabelChange={handleLabelChange}
            onDuplicate={handleDuplicate}
        >
            <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-2">
                    <label className="text-xs text-slate-400">Separator:</label>
                    <input
                        type="text"
                        value={separator}
                        onChange={handleSeparatorChange}
                        placeholder="\n"
                        className="w-full px-2 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded
                                 text-slate-200 placeholder-slate-600
                                 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>

                {outputArray && (
                    <div className="p-2 rounded text-xs bg-slate-950 border border-slate-800">
                        <span className="text-slate-400">
                            {outputArray.length} item{outputArray.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                )}

                <HandleRow
                    inputs={[{ id: 'in_text', type: 'text', label: 'text' }]}
                    outputs={[{ id: 'out_array', type: 'text', label: 'array' }]}
                />
            </div>
        </BaseNode>
    );
}

export const TextSplitNode = memo(TextSplitNodeComponent);
