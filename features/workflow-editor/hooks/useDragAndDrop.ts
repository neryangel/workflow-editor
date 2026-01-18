'use client';

import { useCallback, DragEvent } from 'react';
import { useReactFlow, Node } from '@xyflow/react';
import { NODE_REGISTRY } from '../constants';
import { WorkflowNodeType } from '../types';

export interface UseDragAndDropOptions {
    onNodeAdd: (node: Node) => void;
}

export interface UseDragAndDropReturn {
    onDragOver: (event: DragEvent<HTMLDivElement>) => void;
    onDrop: (event: DragEvent<HTMLDivElement>) => void;
}

/**
 * Hook for handling drag and drop of nodes onto the canvas
 */
export function useDragAndDrop(options: UseDragAndDropOptions): UseDragAndDropReturn {
    const { onNodeAdd } = options;
    const { screenToFlowPosition } = useReactFlow();

    const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: DragEvent<HTMLDivElement>) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow') as WorkflowNodeType;
            if (!type) return;

            const nodeDefinition = NODE_REGISTRY.find((n) => n.type === type);
            if (!nodeDefinition) return;

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode: Node = {
                id: `${type}-${Date.now()}`,
                type,
                position,
                data: { ...nodeDefinition.defaultData },
            };

            onNodeAdd(newNode);
        },
        [screenToFlowPosition, onNodeAdd]
    );

    return {
        onDragOver,
        onDrop,
    };
}
