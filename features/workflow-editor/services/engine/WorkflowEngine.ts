// WorkflowEngine - Main execution engine for workflows

import { WorkflowNode, WorkflowNodeType, VariableContext } from '../../types';
import { WorkflowEdge, ExecutionResult } from '../../types';
import { DependencyGraph } from './DependencyGraph';
import { VariableSubstitution } from '../variables/VariableSubstitution';
import {
    BaseExecutor,
    LLMExecutor,
    ImageGenExecutor,
    VideoGenExecutor,
    InputExecutor,
    ExtractFrameExecutor,
    OutputExecutor,
    VariableExecutor,
    ExecutorInputs,
} from '../executors';

type ExecutorMap = Map<WorkflowNodeType, BaseExecutor>;

export class WorkflowEngine {
    private executors: ExecutorMap;
    private concurrencyLimit: number;

    constructor(concurrencyLimit = 3) {
        this.concurrencyLimit = concurrencyLimit;
        this.executors = new Map();
        this.registerDefaultExecutors();
    }

    private registerDefaultExecutors(): void {
        const inputExecutor = new InputExecutor();
        const llmExecutor = new LLMExecutor();
        const imageGenExecutor = new ImageGenExecutor();
        const videoGenExecutor = new VideoGenExecutor();
        const extractFrameExecutor = new ExtractFrameExecutor();
        const outputExecutor = new OutputExecutor();
        const variableExecutor = new VariableExecutor();

        // Input nodes
        this.executors.set('inputText', inputExecutor);
        this.executors.set('inputImage', inputExecutor);
        this.executors.set('inputVideo', inputExecutor);
        this.executors.set('inputAudio', inputExecutor);
        this.executors.set('systemPrompt', inputExecutor);

        // Model nodes
        this.executors.set('llm', llmExecutor);
        this.executors.set('imageGen', imageGenExecutor);
        this.executors.set('videoGen', videoGenExecutor);
        this.executors.set('extractFrame', extractFrameExecutor);
        this.executors.set('upscaler', imageGenExecutor); // Reuse for now
        this.executors.set('audioGen', inputExecutor); // Placeholder

        // Utility nodes
        this.executors.set('output', outputExecutor);
        this.executors.set('variable', variableExecutor);
        this.executors.set('comment', inputExecutor); // Comments don't execute, just pass through
    }

    registerExecutor(type: WorkflowNodeType, executor: BaseExecutor): void {
        this.executors.set(type, executor);
    }

    async execute(
        nodes: WorkflowNode[],
        edges: WorkflowEdge[],
        variables?: VariableContext
    ): Promise<ExecutionResult> {
        if (nodes.length === 0) {
            return { success: false, error: 'No nodes to execute' };
        }

        const variableContext = variables || {};

        const graph = new DependencyGraph(
            nodes.map((n) => n.id),
            edges
        );

        const cycle = graph.detectCycle();
        if (cycle) {
            return {
                success: false,
                error: `Cycle detected: ${cycle.join(' → ')}`,
            };
        }

        const nodeMap = new Map<string, WorkflowNode>();
        for (const node of nodes) {
            nodeMap.set(node.id, {
                ...node,
                data: { ...node.data, status: 'idle', error: undefined },
            });
        }

        const completedOutputs = new Map<string, Map<string, unknown>>();
        const sortedIds = graph.topologicalSort();
        const inProgress = new Set<string>();
        const completed = new Set<string>();
        const pending = new Set<string>(sortedIds);

        const getReadyNodes = (): string[] => {
            const ready: string[] = [];
            for (const nodeId of pending) {
                const incomingEdges = graph.getIncomingEdges(nodeId);
                const deps = incomingEdges.map((e) => e.source);
                if (deps.every((d) => completed.has(d))) {
                    ready.push(nodeId);
                }
            }
            return ready;
        };

        while (pending.size > 0 || inProgress.size > 0) {
            const ready = getReadyNodes();
            const toExecute = ready.slice(0, this.concurrencyLimit - inProgress.size);

            if (toExecute.length === 0 && inProgress.size === 0) break;

            const promises = toExecute.map(async (nodeId) => {
                pending.delete(nodeId);
                inProgress.add(nodeId);

                const node = nodeMap.get(nodeId)!;
                nodeMap.set(nodeId, {
                    ...node,
                    data: { ...node.data, status: 'running' },
                });

                const inputs: ExecutorInputs = {};
                const incomingEdges = graph.getIncomingEdges(nodeId);

                for (const edge of incomingEdges) {
                    const sourceOutputs = completedOutputs.get(edge.source);
                    if (sourceOutputs && edge.sourceHandle && edge.targetHandle) {
                        const value = sourceOutputs.get(edge.sourceHandle);
                        inputs[edge.targetHandle] = value;
                    }
                }

                try {
                    const executor = this.executors.get(node.type as WorkflowNodeType);
                    const currentNode = nodeMap.get(nodeId)!;

                    if (executor) {
                        // Apply variable substitution to node meta
                        const substitutedMeta = currentNode.data.meta
                            ? VariableSubstitution.substituteInObject(
                                  currentNode.data.meta,
                                  variableContext
                              )
                            : currentNode.data.meta;

                        const outputs = await executor.execute(inputs, substitutedMeta);

                        // Update node outputs
                        const updatedOutputs = { ...currentNode.data.outputs };
                        for (const [key, value] of Object.entries(outputs)) {
                            if (updatedOutputs[key]) {
                                updatedOutputs[key] = { ...updatedOutputs[key], value };
                            }
                        }

                        nodeMap.set(nodeId, {
                            ...currentNode,
                            data: {
                                ...currentNode.data,
                                status: 'success',
                                outputs: updatedOutputs,
                            },
                        });

                        // Store outputs for downstream nodes
                        const outputMap = new Map<string, unknown>();
                        for (const [key, port] of Object.entries(updatedOutputs)) {
                            outputMap.set(key, port.value);
                        }
                        completedOutputs.set(nodeId, outputMap);
                    } else {
                        // Pass through existing outputs
                        const outputMap = new Map<string, unknown>();
                        for (const [key, port] of Object.entries(currentNode.data.outputs)) {
                            outputMap.set(key, port.value);
                        }
                        completedOutputs.set(nodeId, outputMap);

                        nodeMap.set(nodeId, {
                            ...currentNode,
                            data: { ...currentNode.data, status: 'success' },
                        });
                    }
                } catch (error) {
                    console.error(`[WorkflowEngine] Node ${nodeId} (${node.type}) failed:`, error);
                    console.error(`[WorkflowEngine] Error details:`, {
                        nodeId,
                        nodeType: node.type,
                        message: error instanceof Error ? error.message : 'Unknown error',
                        stack: error instanceof Error ? error.stack : undefined,
                        inputs,
                    });
                    const currentNode = nodeMap.get(nodeId)!;
                    nodeMap.set(nodeId, {
                        ...currentNode,
                        data: {
                            ...currentNode.data,
                            status: 'error',
                            error: error instanceof Error ? error.message : 'Execution failed',
                        },
                    });
                }

                inProgress.delete(nodeId);
                completed.add(nodeId);
            });

            if (inProgress.size >= this.concurrencyLimit || toExecute.length === 0) {
                await Promise.race(promises);
            } else if (promises.length > 0) {
                await Promise.all(promises);
            }
        }

        const resultNodes = Array.from(nodeMap.values());
        const hasError = resultNodes.some((n) => n.data.status === 'error');

        if (hasError) {
            const errorNode = resultNodes.find((n) => n.data.status === 'error');
            return {
                success: false,
                nodes: resultNodes,
                error: errorNode?.data.error || 'Workflow execution failed',
            };
        }

        return { success: true, nodes: resultNodes };
    }
}

// Singleton instance
let engineInstance: WorkflowEngine | null = null;

export function getWorkflowEngine(): WorkflowEngine {
    if (!engineInstance) {
        engineInstance = new WorkflowEngine();
    }
    return engineInstance;
}
