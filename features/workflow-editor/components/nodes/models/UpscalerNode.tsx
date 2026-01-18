'use client';

import { memo, useCallback, useState } from 'react';
import { NodeProps, useReactFlow, useEdges } from '@xyflow/react';
import { BaseNode } from '../base/BaseNode';
import { HandleRow } from '../base/NodeHandle';
import { NodeData } from '../../../types';
import { Loader2, ZoomIn } from 'lucide-react';

function UpscalerNodeComponent({ id, data, selected }: NodeProps) {
    const { getNodes, setNodes } = useReactFlow();
    const edges = useEdges();
    const [isRunning, setIsRunning] = useState(false);
    const nodeData = data as unknown as NodeData;
    const outputValue = nodeData.outputs?.out_image?.value as string | undefined;
    const scale = (nodeData.meta?.scale as number) || 2;

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
            const inputImage = inputs.in_image as string | undefined;

            if (!inputImage) {
                throw new Error('No input image provided');
            }

            // Simulate upscaling (in production this would call a real API)
            await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 500));

            // For demo, we'll just pass through the image with an upscale indicator
            const upscaledUrl = inputImage.includes('?')
                ? `${inputImage}&upscale=${scale}x`
                : `${inputImage}?upscale=${scale}x`;

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
                                    value: upscaledUrl,
                                },
                            },
                        },
                    };
                })
            );
        } catch (error) {
            console.error('Upscale failed:', error);
            setNodes((nodes) =>
                nodes.map((node) =>
                    node.id === id
                        ? {
                              ...node,
                              data: {
                                  ...node.data,
                                  status: 'error',
                                  error: 'Upscale failed',
                              },
                          }
                        : node
                )
            );
        } finally {
            setIsRunning(false);
        }
    }, [id, setNodes, getInputsFromConnections, scale]);

    return (
        <BaseNode
            label={nodeData.label}
            status={nodeData.status}
            error={nodeData.error}
            selected={selected}
        >
            <div className="flex flex-col gap-3">
                <div
                    className="aspect-video rounded-lg border-2 overflow-hidden min-h-[80px] flex items-center justify-center"
                    style={{
                        borderColor: nodeData.status === 'success' ? '#ec489950' : 'transparent',
                        backgroundColor: '#0f172a',
                    }}
                >
                    {nodeData.status === 'running' || isRunning ? (
                        <div className="text-center">
                            <Loader2 className="w-6 h-6 mx-auto mb-1 animate-spin text-slate-500" />
                            <p className="text-xs text-slate-500">Upscaling {scale}x...</p>
                        </div>
                    ) : outputValue ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                            src={outputValue}
                            alt="Upscaled"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <p className="text-xs text-slate-600">Upscaled image here</p>
                    )}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>Scale: {scale}x</span>
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
                            Upscaling...
                        </>
                    ) : (
                        <>
                            <ZoomIn className="w-3.5 h-3.5" />
                            Upscale
                        </>
                    )}
                </button>

                <HandleRow
                    inputs={[{ id: 'in_image', type: 'image', label: 'image' }]}
                    outputs={[{ id: 'out_image', type: 'image', label: 'image' }]}
                />
            </div>
        </BaseNode>
    );
}

export const UpscalerNode = memo(UpscalerNodeComponent);
