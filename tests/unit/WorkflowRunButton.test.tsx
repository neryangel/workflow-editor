// WorkflowRunButton Component Unit Tests
// Tests for the run button with cancel support

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkflowRunButton } from '@features/workflow-editor/components/canvas/WorkflowRunButton';

describe('WorkflowRunButton', () => {
    const defaultProps = {
        isRunning: false,
        nodeCount: 1,
        onRun: vi.fn(),
        onCancel: vi.fn(),
    };

    describe('idle state', () => {
        it('should render Run button when not running', () => {
            render(<WorkflowRunButton {...defaultProps} />);
            expect(screen.getByText('Run all')).toBeDefined();
        });

        it('should call onRun when Run button is clicked', () => {
            const onRun = vi.fn();
            render(<WorkflowRunButton {...defaultProps} onRun={onRun} />);

            fireEvent.click(screen.getByText('Run all'));

            expect(onRun).toHaveBeenCalledTimes(1);
        });

        it('should disable Run button when nodeCount is 0', () => {
            render(<WorkflowRunButton {...defaultProps} nodeCount={0} />);

            const button = screen.getByText('Run all').closest('button');
            expect(button?.hasAttribute('disabled')).toBe(true);
        });

        it('should enable Run button when nodeCount > 0', () => {
            render(<WorkflowRunButton {...defaultProps} nodeCount={5} />);

            const button = screen.getByText('Run all').closest('button');
            expect(button?.hasAttribute('disabled')).toBe(false);
        });
    });

    describe('running state', () => {
        it('should show Running... text when isRunning is true', () => {
            render(<WorkflowRunButton {...defaultProps} isRunning={true} />);
            expect(screen.getByText('Running...')).toBeDefined();
        });

        it('should show Cancel button when isRunning is true', () => {
            render(<WorkflowRunButton {...defaultProps} isRunning={true} />);
            expect(screen.getByText('Cancel')).toBeDefined();
        });

        it('should call onCancel when Cancel button is clicked', () => {
            const onCancel = vi.fn();
            render(<WorkflowRunButton {...defaultProps} isRunning={true} onCancel={onCancel} />);

            fireEvent.click(screen.getByText('Cancel'));

            expect(onCancel).toHaveBeenCalledTimes(1);
        });

        it('should not show Run button when running', () => {
            render(<WorkflowRunButton {...defaultProps} isRunning={true} />);
            expect(screen.queryByText('Run all')).toBeNull();
        });
    });
});
