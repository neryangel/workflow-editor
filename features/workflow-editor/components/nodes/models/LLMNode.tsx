'use client';

import { memo, useCallback, useState } from 'react';
import { NodeProps, useReactFlow, useEdges } from '@xyflow/react';
import { BaseNode } from '../base/BaseNode';
import { HandleRow } from '../base/NodeHandle';
import { NodeData } from '../../../types';
import { Loader2, Play } from 'lucide-react';

function LLMNodeComponent({ id, data, selected }: NodeProps) {
    const { getNodes, setNodes } = useReactFlow();
    const edges = useEdges();
    const [isRunning, setIsRunning] = useState(false);
    const nodeData = data as unknown as NodeData;
    const outputValue = nodeData.outputs?.out_text?.value as string | undefined;

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
            const systemText = (inputs.in_system as string) || '';
            const inputText = (inputs.in_text as string) || '';
            const imageUrl = (inputs.in_image as string) || undefined;
            const videoUrl = (inputs.in_video as string) || undefined;

            if (!inputText) {
                throw new Error('No input text provided');
            }

            const response = await fetch('/api/ai/llm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: inputText,
                    systemPrompt: systemText || undefined,
                    imageUrl,
                    videoUrl,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'API request failed');
            }

            const processedText = result.text || '[No response]';

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
                                out_text: {
                                    ...currentData.outputs.out_text,
                                    value: processedText,
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
                    className="min-h-[60px] rounded-lg p-3 text-xs overflow-hidden"
                    style={{ backgroundColor: '#0f172a' }}
                >
                    {nodeData.status === 'running' || isRunning ? (
                        <div className="flex items-center gap-2 text-slate-500">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Processing...</span>
                        </div>
                    ) : outputValue ? (
                        <p className="text-slate-300 leading-relaxed line-clamp-4">{outputValue}</p>
                    ) : (
                        <p className="text-slate-600">Output will appear here</p>
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
                            Processing...
                        </>
                    ) : (
                        <>
                            <Play className="w-3.5 h-3.5" />
                            Run
                        </>
                    )}
                </button>

                <HandleRow
                    inputs={[
                        { id: 'in_system', type: 'text', label: 'system' },
                        { id: 'in_text', type: 'text', label: 'text' },
                        { id: 'in_image', type: 'image', label: 'image' },
                        { id: 'in_video', type: 'video', label: 'video' },
                    ]}
                    outputs={[{ id: 'out_text', type: 'text', label: 'text' }]}
                />
            </div>
        </BaseNode>
    );
}

export const LLMNode = memo(LLMNodeComponent);
