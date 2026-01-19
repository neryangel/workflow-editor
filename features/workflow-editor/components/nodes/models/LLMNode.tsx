'use client';

import { memo, useCallback, useState } from 'react';
import { NodeProps, useReactFlow, useEdges } from '@xyflow/react';
import { BaseNode } from '../base/BaseNode';
import { HandleRow } from '../base/NodeHandle';
import { NodeData } from '../../../types';
import { Loader2, Play, Maximize2, X, Copy, Check } from 'lucide-react';

function LLMNodeComponent({ id, data, selected }: NodeProps) {
    const { getNodes, setNodes } = useReactFlow();
    const edges = useEdges();
    const [isRunning, setIsRunning] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const nodeData = data as unknown as NodeData;
    const outputValue = nodeData.outputs?.out_text?.value as string | undefined;

    const handleCopy = useCallback(() => {
        if (outputValue) {
            navigator.clipboard.writeText(outputValue);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    }, [outputValue]);

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
            const imageUrl1 = (inputs.in_image_1 as string) || undefined;
            const imageUrl2 = (inputs.in_image_2 as string) || undefined;
            const videoUrl = (inputs.in_video as string) || undefined;

            // Collect all connected images into array
            const imageUrls: string[] = [];
            if (imageUrl1) imageUrls.push(imageUrl1);
            if (imageUrl2) imageUrls.push(imageUrl2);

            if (!inputText) {
                throw new Error('No input text provided');
            }

            const response = await fetch('/api/ai/llm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: inputText,
                    systemPrompt: systemText || undefined,
                    imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
                    videoUrl,
                    model: (nodeData.meta?.model as string) || 'gemini-2.5-flash-preview-05-20',
                    personaId: (nodeData.meta?.personaId as string) || undefined,
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
    }, [id, setNodes, getInputsFromConnections, nodeData.meta?.model, nodeData.meta?.personaId]);

    return (
        <>
            {/* Expanded Modal */}
            {isExpanded && outputValue && (
                <div
                    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-8"
                    onClick={() => setIsExpanded(false)}
                >
                    <div
                        className="bg-slate-900 rounded-xl border border-slate-700 max-w-2xl w-full max-h-[80vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-4 border-b border-slate-700">
                            <span className="text-sm font-medium text-slate-200">Full Output</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleCopy}
                                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-slate-200"
                                >
                                    {isCopied ? (
                                        <Check className="w-4 h-4 text-green-400" />
                                    ) : (
                                        <Copy className="w-4 h-4" />
                                    )}
                                </button>
                                <button
                                    onClick={() => setIsExpanded(false)}
                                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-slate-200"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="p-4 overflow-auto flex-1">
                            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                                {outputValue}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <BaseNode
                label={nodeData.label}
                status={nodeData.status}
                error={nodeData.error}
                selected={selected}
            >
                <div className="flex flex-col gap-3">
                    <div className="relative">
                        <div
                            className="min-h-[60px] max-h-[120px] rounded-lg p-3 text-xs overflow-auto"
                            style={{ backgroundColor: '#0f172a' }}
                        >
                            {nodeData.status === 'running' || isRunning ? (
                                <div className="flex items-center gap-2 text-slate-500">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Processing...</span>
                                </div>
                            ) : outputValue ? (
                                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                                    {outputValue}
                                </p>
                            ) : (
                                <p className="text-slate-600">Output will appear here</p>
                            )}
                        </div>
                        {outputValue && !isRunning && (
                            <div className="absolute top-1 right-1 flex gap-1">
                                <button
                                    onClick={handleCopy}
                                    className="p-1.5 bg-slate-800/80 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-slate-200"
                                    title="Copy"
                                >
                                    {isCopied ? (
                                        <Check className="w-3 h-3 text-green-400" />
                                    ) : (
                                        <Copy className="w-3 h-3" />
                                    )}
                                </button>
                                <button
                                    onClick={() => setIsExpanded(true)}
                                    className="p-1.5 bg-slate-800/80 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-slate-200"
                                    title="Expand"
                                >
                                    <Maximize2 className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Persona Selector */}
                <select
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-300 outline-none focus:border-purple-500 mb-2"
                    value={(nodeData.meta?.personaId as string) || ''}
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
                                                  personaId: e.target.value || undefined,
                                              },
                                          },
                                      }
                                    : node
                            )
                        );
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    <option value="">🤖 Default AI</option>
                    <option value="director">🎬 Film Director</option>
                    <option value="sceneAnalyst">🔍 Scene Analyst</option>
                    <option value="promptEngineer">✨ Prompt Engineer</option>
                    <option value="scriptWriter">📝 Screenwriter</option>
                    <option value="editor">🎞️ Video Editor</option>
                </select>

                <div className="flex gap-2">
                    <select
                        className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 outline-none focus:border-blue-500"
                        value={(nodeData.meta?.model as string) || 'gemini-2.5-flash-preview-05-20'}
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
                        <option value="gemini-2.5-flash-preview-05-20">Gemini 2.5 Flash</option>
                        <option value="gemini-2.5-pro-preview-05-20">Gemini 2.5 Pro</option>
                        <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash</option>
                    </select>

                    <button
                        onClick={handleRunNode}
                        disabled={nodeData.status === 'running' || isRunning}
                        className={`px-3 py-1.5 rounded flex items-center gap-2 text-xs font-medium transition-colors ${
                            nodeData.status === 'running' || isRunning
                                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-600'
                        }`}
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        {nodeData.status === 'running' || isRunning ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                            <Play className="w-3 h-3" />
                        )}
                        Run
                    </button>
                </div>

                <HandleRow
                    inputs={[
                        { id: 'in_system', type: 'text', label: 'system' },
                        { id: 'in_text', type: 'text', label: 'text' },
                        { id: 'in_image_1', type: 'image', label: 'image 1' },
                        { id: 'in_image_2', type: 'image', label: 'image 2' },
                        { id: 'in_video', type: 'video', label: 'video' },
                    ]}
                    outputs={[{ id: 'out_text', type: 'text', label: 'text' }]}
                />
            </BaseNode>
        </>
    );
}

export const LLMNode = memo(LLMNodeComponent);
