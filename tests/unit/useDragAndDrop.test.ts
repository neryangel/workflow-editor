// useDragAndDrop Hook Unit Tests
// Tests for drag and drop functionality

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDragAndDrop } from '@features/workflow-editor/hooks/useDragAndDrop';

// Mock @xyflow/react
vi.mock('@xyflow/react', () => ({
    useReactFlow: vi.fn(() => ({
        screenToFlowPosition: vi.fn((pos) => pos),
    })),
}));

// Mock NODE_REGISTRY
vi.mock('@features/workflow-editor/constants', () => ({
    NODE_REGISTRY: [
        {
            type: 'inputText',
            label: 'Text Input',
            defaultData: { label: 'Text', status: 'idle', inputs: {}, outputs: {} },
        },
        {
            type: 'llm',
            label: 'LLM',
            defaultData: { label: 'LLM', status: 'idle', inputs: {}, outputs: {} },
        },
    ],
}));

describe('useDragAndDrop', () => {
    const mockOnNodeAdd = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('initialization', () => {
        it('should return onDragOver function', () => {
            const { result } = renderHook(() => useDragAndDrop({ onNodeAdd: mockOnNodeAdd }));
            expect(typeof result.current.onDragOver).toBe('function');
        });

        it('should return onDrop function', () => {
            const { result } = renderHook(() => useDragAndDrop({ onNodeAdd: mockOnNodeAdd }));
            expect(typeof result.current.onDrop).toBe('function');
        });
    });

    describe('onDragOver', () => {
        it('should prevent default and set dropEffect to move', () => {
            const { result } = renderHook(() => useDragAndDrop({ onNodeAdd: mockOnNodeAdd }));

            const mockEvent = {
                preventDefault: vi.fn(),
                dataTransfer: {
                    dropEffect: '',
                },
            } as unknown as React.DragEvent<HTMLDivElement>;

            result.current.onDragOver(mockEvent);

            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(mockEvent.dataTransfer.dropEffect).toBe('move');
        });
    });

    describe('onDrop', () => {
        it('should prevent default on drop', () => {
            const { result } = renderHook(() => useDragAndDrop({ onNodeAdd: mockOnNodeAdd }));

            const mockEvent = {
                preventDefault: vi.fn(),
                clientX: 100,
                clientY: 200,
                dataTransfer: {
                    getData: vi.fn().mockReturnValue('inputText'),
                },
            } as unknown as React.DragEvent<HTMLDivElement>;

            result.current.onDrop(mockEvent);

            expect(mockEvent.preventDefault).toHaveBeenCalled();
        });

        it('should call onNodeAdd with new node for valid type', () => {
            const { result } = renderHook(() => useDragAndDrop({ onNodeAdd: mockOnNodeAdd }));

            const mockEvent = {
                preventDefault: vi.fn(),
                clientX: 100,
                clientY: 200,
                dataTransfer: {
                    getData: vi.fn().mockReturnValue('inputText'),
                },
            } as unknown as React.DragEvent<HTMLDivElement>;

            result.current.onDrop(mockEvent);

            expect(mockOnNodeAdd).toHaveBeenCalledTimes(1);
            expect(mockOnNodeAdd).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'inputText',
                    position: { x: 100, y: 200 },
                })
            );
        });

        it('should not call onNodeAdd for empty type', () => {
            const { result } = renderHook(() => useDragAndDrop({ onNodeAdd: mockOnNodeAdd }));

            const mockEvent = {
                preventDefault: vi.fn(),
                clientX: 100,
                clientY: 200,
                dataTransfer: {
                    getData: vi.fn().mockReturnValue(''),
                },
            } as unknown as React.DragEvent<HTMLDivElement>;

            result.current.onDrop(mockEvent);

            expect(mockOnNodeAdd).not.toHaveBeenCalled();
        });

        it('should not call onNodeAdd for unknown node type', () => {
            const { result } = renderHook(() => useDragAndDrop({ onNodeAdd: mockOnNodeAdd }));

            const mockEvent = {
                preventDefault: vi.fn(),
                clientX: 100,
                clientY: 200,
                dataTransfer: {
                    getData: vi.fn().mockReturnValue('unknownNodeType'),
                },
            } as unknown as React.DragEvent<HTMLDivElement>;

            result.current.onDrop(mockEvent);

            expect(mockOnNodeAdd).not.toHaveBeenCalled();
        });
    });
});
