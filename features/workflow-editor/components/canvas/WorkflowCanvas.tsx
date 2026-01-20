'use client';

import { useCallback, useRef, memo } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    addEdge,
    useNodesState,
    useEdgesState,
    type Connection,
    type Edge,
    type Node,
    type NodeTypes,
    ReactFlowProvider,
    useReactFlow,
    Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { NodePalette } from '../sidebar';
import { WorkflowToolbar } from '../toolbar';
import {
    InputTextNode,
    ImageInputNode,
    VideoInputNode,
    AudioInputNode,
    SystemPromptNode,
    LLMNode,
    ImageGenNode,
    VideoGenNode,
    ExtractFrameNode,
    UpscalerNode,
    CommentNode,
    VariableNode,
    OutputNode,
} from '../nodes';
import { arePortsCompatible, PORT_COLORS } from '../../constants';
import { useDragAndDrop, useWorkflowExecution, useKeyboardShortcuts } from '../../hooks';
import { NodeData, PortType } from '../../types';
import { WorkflowRunButton } from './WorkflowRunButton';

// Register custom node types - static, outside component
const nodeTypes: NodeTypes = {
    inputText: InputTextNode,
    inputImage: ImageInputNode,
    inputVideo: VideoInputNode,
    inputAudio: AudioInputNode,
    systemPrompt: SystemPromptNode,
    llm: LLMNode,
    imageGen: ImageGenNode,
    videoGen: VideoGenNode,
    extractFrame: ExtractFrameNode,
    upscaler: UpscalerNode,
    audioGen: ImageGenNode,
    comment: CommentNode,
    variable: VariableNode,
    output: OutputNode,
};

// Get port type from handle ID and node data
function getPortType(
    nodeId: string,
    handleId: string,
    handleType: 'source' | 'target',
    nodes: Node[]
): PortType | null {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node || !node.data) return null;

    const data = node.data as unknown as NodeData;
    if (handleType === 'source') {
        return data.outputs[handleId]?.type ?? null;
    } else {
        return data.inputs[handleId]?.type ?? null;
    }
}

// Get edge color based on port type
function getEdgeColor(portType: PortType | null): string {
    if (!portType) return '#64748b';
    return PORT_COLORS[portType] || '#64748b';
}

function WorkflowEditorInner() {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const { fitView } = useReactFlow();

    // Use extracted execution hook with AbortController support
    const { isRunning, executeWorkflow, cancelExecution } = useWorkflowExecution();

    // Use extracted drag and drop hook
    const { onDragOver, onDrop } = useDragAndDrop({
        onNodeAdd: useCallback(
            (newNode: Node) => {
                setNodes((nds) => [...nds, newNode]);
            },
            [setNodes]
        ),
    });

    // Keyboard shortcuts - Delete selected nodes, Undo/Redo
    useKeyboardShortcuts({
        onDelete: useCallback(() => {
            setNodes((nds) => nds.filter((node) => !node.selected));
            setEdges((eds) => eds.filter((edge) => !edge.selected));
        }, [setNodes, setEdges]),
        onSelectAll: useCallback(() => {
            setNodes((nds) => nds.map((node) => ({ ...node, selected: true })));
            setEdges((eds) => eds.map((edge) => ({ ...edge, selected: true })));
        }, [setNodes, setEdges]),
    });

    // Typed connection validation
    const isValidConnection = useCallback(
        (connection: Connection | Edge): boolean => {
            const { source, target, sourceHandle, targetHandle } = connection;
            if (!source || !target || !sourceHandle || !targetHandle) return false;
            if (source === target) return false;

            const sourceType = getPortType(source, sourceHandle, 'source', nodes);
            const targetType = getPortType(target, targetHandle, 'target', nodes);

            if (!sourceType || !targetType) return false;
            return arePortsCompatible(sourceType, targetType);
        },
        [nodes]
    );

    // Handle new connections with colored edges
    const onConnect = useCallback(
        (params: Connection) => {
            if (isValidConnection(params)) {
                const sourceType = getPortType(
                    params.source!,
                    params.sourceHandle!,
                    'source',
                    nodes
                );
                const edgeColor = getEdgeColor(sourceType);

                setEdges((eds) =>
                    addEdge(
                        {
                            ...params,
                            style: { strokeWidth: 2, stroke: edgeColor },
                            animated: false,
                        },
                        eds
                    )
                );
            }
        },
        [setEdges, isValidConnection, nodes]
    );

    // Load workflow handler
    const handleLoad = useCallback(
        (loadedNodes: Node[], loadedEdges: Edge[]) => {
            setNodes(loadedNodes);
            setEdges(loadedEdges);
            setTimeout(() => fitView(), 100);
        },
        [setNodes, setEdges, fitView]
    );

    // Clear workflow handler
    const handleClear = useCallback(() => {
        cancelExecution(); // Cancel any running execution
        setNodes([]);
        setEdges([]);
    }, [setNodes, setEdges, cancelExecution]);

    // Run workflow with proper error handling
    const handleRun = useCallback(async () => {
        // Reset all nodes to idle
        setNodes((nds) =>
            nds.map((node) => ({
                ...node,
                data: { ...node.data, status: 'idle', error: undefined },
            }))
        );

        try {
            const resultNodes = await executeWorkflow(nodes, edges);
            if (resultNodes) {
                setNodes((nds) =>
                    nds.map((node) => {
                        const resultNode = resultNodes.find(
                            (rn: { id: string }) => rn.id === node.id
                        );
                        if (resultNode) {
                            return { ...node, data: resultNode.data };
                        }
                        return node;
                    })
                );
            }
        } catch (error) {
            console.error('Workflow execution failed:', error);
            setNodes((nds) =>
                nds.map((node) => ({
                    ...node,
                    data: {
                        ...node.data,
                        status: 'error',
                        error: error instanceof Error ? error.message : 'Network error',
                    },
                }))
            );
        }
    }, [nodes, edges, setNodes, executeWorkflow]);

    return (
        <div className="flex flex-col h-full w-full">
            <WorkflowToolbar
                nodes={nodes}
                edges={edges}
                onLoad={handleLoad}
                onClear={handleClear}
            />

            <div className="flex flex-1 min-h-0">
                <NodePalette />

                <div ref={reactFlowWrapper} className="flex-1 h-full">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        nodeTypes={nodeTypes}
                        isValidConnection={isValidConnection}
                        fitView
                        snapToGrid
                        snapGrid={[16, 16]}
                        defaultEdgeOptions={{
                            style: { strokeWidth: 2, stroke: '#64748b' },
                        }}
                        connectionLineStyle={{ strokeWidth: 2, stroke: '#22c55e' }}
                        className="bg-slate-950"
                    >
                        <Background color="#1e293b" gap={16} size={1} />
                        <Controls className="!bg-slate-900 !border-slate-800 !rounded-lg [&>button]:!bg-slate-800 [&>button]:!border-slate-700 [&>button]:!text-slate-400 [&>button:hover]:!bg-slate-700" />
                        <MiniMap
                            className="!bg-slate-900 !border-slate-800"
                            nodeColor="#4ade80"
                            maskColor="rgba(15, 23, 42, 0.8)"
                        />

                        <Panel position="top-right">
                            <WorkflowRunButton
                                isRunning={isRunning}
                                nodeCount={nodes.length}
                                onRun={handleRun}
                                onCancel={cancelExecution}
                            />
                        </Panel>
                    </ReactFlow>
                </div>
            </div>
        </div>
    );
}

export const WorkflowCanvas = memo(function WorkflowCanvas() {
    return (
        <ReactFlowProvider>
            <WorkflowEditorInner />
        </ReactFlowProvider>
    );
});

// Re-export for backwards compatibility
export { WorkflowCanvas as WorkflowEditor };
