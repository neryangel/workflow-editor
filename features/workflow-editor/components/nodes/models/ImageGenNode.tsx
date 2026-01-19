'use client';

import { memo, useCallback, useState } from 'react';
import { NodeProps, useReactFlow, useEdges } from '@xyflow/react';
import { BaseNode } from '../base/BaseNode';
import { HandleRow } from '../base/NodeHandle';
import { NodeData } from '../../../types';
import { PORT_COLORS } from '../../../constants';
import { Loader2, Play } from 'lucide-react';

function ImageGenNodeComponent({ id, data, selected }: NodeProps) {
    const { getNodes, setNodes } = useReactFlow();
    const edges = useEdges();
    const [isRunning, setIsRunning] = useState(false);
    const nodeData = data as unknown as NodeData;
    const outputValue = nodeData.outputs?.out_image?.value as string | undefined;
    const imageColor = PORT_COLORS.image;

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
            const promptText = (inputs.in_text as string) || 'beautiful landscape';
            const referenceImageUrl = (inputs.in_image as string) || undefined;

            // Call the real image generation API
            const response = await fetch('/api/ai/image-gen', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: promptText,
                    referenceImageUrl,
                    model: (nodeData.meta?.model as string) || 'imagen-4.0-fast-generate-001',
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Image generation failed');
            }

            const imageUrl =
                result.imageUrl ||
                `https://picsum.photos/seed/${encodeURIComponent(promptText)}/400/300`;

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
                                    value: imageUrl,
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
    }, [id, setNodes, getInputsFromConnections]);

    return (
        <BaseNode
            label={nodeData.label}
            status={nodeData.status}
            error={nodeData.error}
            selected={selected}
        >
            <div className="flex flex-col gap-3">
                <div
                    className="aspect-video rounded-lg border-2 overflow-hidden min-h-[120px] flex items-center justify-center"
                    style={{
                        borderColor:
                            nodeData.status === 'success' ? `${imageColor}50` : 'transparent',
                        backgroundColor: '#0f172a',
                    }}
                >
                    {nodeData.status === 'running' || isRunning ? (
                        <div className="text-center">
                            <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-slate-500" />
                        </div>
                    ) : outputValue ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                            src={outputValue}
                            alt="Generated"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <p className="text-xs text-slate-600">Output will appear here</p>
                    )}
                </div>

                <div className="flex gap-2">
                    <select
                        className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-300 outline-none focus:border-pink-500"
                        value={(nodeData.meta?.model as string) || 'imagen-4.0-fast-generate-001'}
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
                        <option value="imagen-4.0-fast-generate-001">Imagen 4 Fast</option>
                        <option value="imagen-4.0-ultra-generate-001">Imagen 4 Ultra</option>
                        <option value="nano-banana-pro">Nano Banana Pro</option>
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
                    ]}
                    outputs={[{ id: 'out_image', type: 'image', label: 'image' }]}
                />
            </div>
        </BaseNode>
    );
}

export const ImageGenNode = memo(ImageGenNodeComponent);
