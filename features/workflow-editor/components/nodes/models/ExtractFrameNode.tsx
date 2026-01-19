'use client';

import { memo, useCallback, useState } from 'react';
import { NodeProps, useReactFlow } from '@xyflow/react';
import { BaseNode } from '../base/BaseNode';
import { HandleRow } from '../base/NodeHandle';
import { NodeData } from '../../../types';
import { PORT_COLORS } from '../../../constants';
import { Play, Loader2 } from 'lucide-react';

function ExtractFrameNodeComponent({ id, data, selected }: NodeProps) {
    const { setNodes } = useReactFlow();
    const [isRunning, setIsRunning] = useState(false);
    const nodeData = data as unknown as NodeData;
    const outputImage = nodeData.outputs?.out_image?.value as string | undefined;
    const timestamp = (nodeData.meta?.timestamp as number) ?? 0;
    const imageColor = PORT_COLORS.image;

    const handleTimestampChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const newTimestamp = parseFloat(e.target.value) || 0;
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
                                    timestamp: newTimestamp,
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

    const handleRunNode = useCallback(async () => {
        setIsRunning(true);

        setNodes((nodes) =>
            nodes.map((node) =>
                node.id === id ? { ...node, data: { ...node.data, status: 'running' } } : node
            )
        );

        try {
            // Simulate frame extraction delay
            await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 400));

            const frameUrl = `https://picsum.photos/seed/frame${Math.round(timestamp * 10)}/400/300`;

            setNodes((nodes) =>
                nodes.map((node) => {
                    if (node.id !== id) return node;
                    const currentData = node.data as unknown as NodeData;
                    return {
                        ...node,
                        data: {
                            ...currentData,
                            status: 'success',
                            outputs: {
                                ...currentData.outputs,
                                out_image: {
                                    ...currentData.outputs.out_image,
                                    value: frameUrl,
                                },
                            },
                        },
                    };
                })
            );
        } catch (error) {
            console.error('Node execution failed:', error);
            setNodes((nodes) =>
                nodes.map((node) =>
                    node.id === id
                        ? {
                              ...node,
                              data: {
                                  ...node.data,
                                  status: 'error',
                                  error: 'Execution failed',
                              },
                          }
                        : node
                )
            );
        } finally {
            setIsRunning(false);
        }
    }, [id, setNodes, timestamp]);

    return (
        <BaseNode
            label={nodeData.label}
            status={nodeData.status}
            error={nodeData.error}
            selected={selected}
        >
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-400">Frame at:</label>
                    <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={timestamp}
                        onChange={handleTimestampChange}
                        className="flex-1 px-2 py-1.5 text-sm bg-slate-900 border border-slate-800 rounded
                       text-slate-200 focus:outline-none focus:border-slate-700"
                    />
                    <span className="text-xs text-slate-500">sec</span>
                </div>

                <div
                    className="aspect-video rounded-lg border overflow-hidden flex items-center justify-center"
                    style={{
                        borderColor: outputImage ? `${imageColor}50` : 'transparent',
                        backgroundColor: '#0f172a',
                    }}
                >
                    {nodeData.status === 'running' || isRunning ? (
                        <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
                    ) : outputImage ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                            src={outputImage}
                            alt="Extracted frame"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <p className="text-xs text-slate-600">Frame will appear here</p>
                    )}
                </div>

                <button
                    onClick={handleRunNode}
                    disabled={isRunning}
                    className={`w-full py-2 px-3 text-sm font-medium rounded-lg border
                        flex items-center justify-center gap-2 transition-colors
                        ${
                            isRunning
                                ? 'bg-slate-700 border-slate-600 text-slate-400 cursor-wait'
                                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-slate-600'
                        }`}
                >
                    {isRunning ? (
                        <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Extracting...
                        </>
                    ) : (
                        <>
                            <Play className="w-3.5 h-3.5" />
                            Run
                        </>
                    )}
                </button>

                <HandleRow
                    inputs={[{ id: 'in_video', type: 'video', label: 'video' }]}
                    outputs={[{ id: 'out_image', type: 'image', label: 'image' }]}
                />
            </div>
        </BaseNode>
    );
}

export const ExtractFrameNode = memo(ExtractFrameNodeComponent);
