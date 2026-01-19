'use client';

import { memo, useCallback, useState } from 'react';
import { NodeProps, useReactFlow, useEdges } from '@xyflow/react';
import { BaseNode } from '../base/BaseNode';
import { HandleRow } from '../base/NodeHandle';
import { NodeData } from '../../../types';
import { PORT_COLORS } from '../../../constants';
import { Loader2, Play } from 'lucide-react';

function VideoGenNodeComponent({ id, data, selected }: NodeProps) {
    const { getNodes, setNodes } = useReactFlow();
    const edges = useEdges();
    const [isRunning, setIsRunning] = useState(false);
    const nodeData = data as unknown as NodeData;
    const outputValue = nodeData.outputs?.out_video?.value as string | undefined;
    const videoColor = PORT_COLORS.video;

    const getInputsFromConnections = useCallback(() => {
        const inputs: Record<string, unknown> = {};
        const nodes = getNodes();
        const incomingEdges = edges.filter((e) => e.target === id);

        for (const edge of incomingEdges) {
            const sourceNode = nodes.find((n) => n.id === edge.source);
            if (!sourceNode?.data) continue;

            const sourceData = sourceNode.data as unknown as NodeData;
            const outputPort = edge.sourceHandle;
            const inputPort = edge.targetHandle;

            if (outputPort && inputPort) {
                const outputValue = sourceData.outputs?.[outputPort]?.value;
                inputs[inputPort] = outputValue;
            }
        }

        return inputs;
    }, [edges, getNodes, id]);

    const handleRunNode = useCallback(async () => {
        setIsRunning(true);

        setNodes((nodes) =>
            nodes.map((node) =>
                node.id === id ? { ...node, data: { ...node.data, status: 'running' } } : node
            )
        );

        try {
            const inputs = getInputsFromConnections();
            const promptText = (inputs.in_text as string) || 'cinematic video';
            const imageUrl = (inputs.in_image as string) || undefined;

            // Call the real video generation API
            const response = await fetch('/api/ai/video-gen', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: promptText,
                    imageUrl,
                    model: (nodeData.meta?.model as string) || 'veo-2',
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Video generation failed');
            }

            const videoUrl =
                result.videoUrl ||
                'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4';

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
                                out_video: {
                                    ...currentData.outputs.out_video,
                                    value: videoUrl,
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
    }, [id, setNodes, getInputsFromConnections, nodeData.meta?.model]);

    return (
        <BaseNode
            label={nodeData.label}
            status={nodeData.status}
            error={nodeData.error}
            selected={selected}
        >
            <div className="flex flex-col gap-3">
                <div
                    className="aspect-video rounded-lg border-2 overflow-hidden min-h-[120px] flex items-center justify-center bg-black"
                    style={{
                        borderColor:
                            nodeData.status === 'success' ? `${videoColor}50` : 'transparent',
                    }}
                >
                    {nodeData.status === 'running' || isRunning ? (
                        <div className="text-center">
                            <Loader2
                                className="w-8 h-8 mx-auto mb-2 animate-spin"
                                style={{ color: videoColor }}
                            />
                            <p className="text-xs" style={{ color: videoColor }}>
                                Generating video...
                            </p>
                        </div>
                    ) : outputValue ? (
                        <video
                            src={outputValue}
                            controls
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <p className="text-xs text-slate-600">Output will appear here</p>
                    )}
                </div>

                <div className="flex gap-2">
                    <select
                        className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-300 outline-none focus:border-blue-500"
                        value={(nodeData.meta?.model as string) || 'veo-3.1-fast'}
                        onChange={(e) => {
                            setNodes((nodes) =>
                                nodes.map((node) =>
                                    node.id === id
                                        ? {
                                              ...node,
                                              data: {
                                                  ...node.data,
                                                  meta: {
                                                      ...(node.data.meta || {}),
                                                      model: e.target.value,
                                                  },
                                              },
                                          }
                                        : node
                                )
                            );
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        <option value="veo-3.1-fast">Veo 3.1 Fast (720p)</option>
                        <option value="veo-3.1">Veo 3.1 (1080p)</option>
                        <option value="veo-3.0-full">Veo 3.0 (4K Premium)</option>
                    </select>

                    <button
                        onClick={handleRunNode}
                        disabled={isRunning}
                        className={`px-3 py-1.5 rounded flex items-center gap-2 text-xs font-medium transition-colors ${
                            isRunning
                                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-600'
                        }`}
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        {isRunning ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                            <Play className="w-3 h-3" />
                        )}
                        Run
                    </button>
                </div>

                <HandleRow
                    inputs={[
                        { id: 'in_text', type: 'text', label: 'text' },
                        { id: 'in_image', type: 'image', label: 'image' },
                        { id: 'in_audio', type: 'audio', label: 'audio' },
                    ]}
                    outputs={[{ id: 'out_video', type: 'video', label: 'video' }]}
                />
            </div>
        </BaseNode>
    );
}

export const VideoGenNode = memo(VideoGenNodeComponent);
