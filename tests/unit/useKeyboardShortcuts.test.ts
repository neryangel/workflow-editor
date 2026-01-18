// useKeyboardShortcuts Hook Unit Tests
// Tests for keyboard shortcut handling

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from '@features/workflow-editor/hooks/useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
    let addEventListenerSpy: ReturnType<typeof vi.spyOn>;
    let removeEventListenerSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        addEventListenerSpy = vi.spyOn(window, 'addEventListener');
        removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    });

    afterEach(() => {
        addEventListenerSpy.mockRestore();
        removeEventListenerSpy.mockRestore();
    });

    describe('event listener lifecycle', () => {
        it('should add keydown listener on mount', () => {
            renderHook(() => useKeyboardShortcuts({}));
            expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
        });

        it('should remove keydown listener on unmount', () => {
            const { unmount } = renderHook(() => useKeyboardShortcuts({}));
            unmount();
            expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
        });
    });

    describe('Undo shortcut (Ctrl+Z)', () => {
        it('should call onUndo when Ctrl+Z is pressed', () => {
            const onUndo = vi.fn();
            renderHook(() => useKeyboardShortcuts({ onUndo }));

            const event = new KeyboardEvent('keydown', {
                key: 'z',
                ctrlKey: true,
                shiftKey: false,
            });
            Object.defineProperty(event, 'target', { value: document.body });
            window.dispatchEvent(event);

            expect(onUndo).toHaveBeenCalledTimes(1);
        });

        it('should not call onUndo when typing in input', () => {
            const onUndo = vi.fn();
            renderHook(() => useKeyboardShortcuts({ onUndo }));

            const input = document.createElement('input');
            const event = new KeyboardEvent('keydown', {
                key: 'z',
                ctrlKey: true,
            });
            Object.defineProperty(event, 'target', { value: input });
            window.dispatchEvent(event);

            expect(onUndo).not.toHaveBeenCalled();
        });
    });

    describe('Redo shortcut (Ctrl+Shift+Z or Ctrl+Y)', () => {
        it('should call onRedo when Ctrl+Shift+Z is pressed', () => {
            const onRedo = vi.fn();
            renderHook(() => useKeyboardShortcuts({ onRedo }));

            const event = new KeyboardEvent('keydown', {
                key: 'z',
                ctrlKey: true,
                shiftKey: true,
            });
            Object.defineProperty(event, 'target', { value: document.body });
            window.dispatchEvent(event);

            expect(onRedo).toHaveBeenCalledTimes(1);
        });

        it('should call onRedo when Ctrl+Y is pressed', () => {
            const onRedo = vi.fn();
            renderHook(() => useKeyboardShortcuts({ onRedo }));

            const event = new KeyboardEvent('keydown', {
                key: 'y',
                ctrlKey: true,
            });
            Object.defineProperty(event, 'target', { value: document.body });
            window.dispatchEvent(event);

            expect(onRedo).toHaveBeenCalledTimes(1);
        });
    });

    describe('Delete shortcut', () => {
        it('should call onDelete when Delete key is pressed', () => {
            const onDelete = vi.fn();
            renderHook(() => useKeyboardShortcuts({ onDelete }));

            const event = new KeyboardEvent('keydown', { key: 'Delete' });
            Object.defineProperty(event, 'target', { value: document.body });
            window.dispatchEvent(event);

            expect(onDelete).toHaveBeenCalledTimes(1);
        });

        it('should call onDelete when Backspace key is pressed', () => {
            const onDelete = vi.fn();
            renderHook(() => useKeyboardShortcuts({ onDelete }));

            const event = new KeyboardEvent('keydown', { key: 'Backspace' });
            Object.defineProperty(event, 'target', { value: document.body });
            window.dispatchEvent(event);

            expect(onDelete).toHaveBeenCalledTimes(1);
        });
    });

    describe('Select All shortcut (Ctrl+A)', () => {
        it('should call onSelectAll when Ctrl+A is pressed', () => {
            const onSelectAll = vi.fn();
            renderHook(() => useKeyboardShortcuts({ onSelectAll }));

            const event = new KeyboardEvent('keydown', {
                key: 'a',
                ctrlKey: true,
            });
            Object.defineProperty(event, 'target', { value: document.body });
            window.dispatchEvent(event);

            expect(onSelectAll).toHaveBeenCalledTimes(1);
        });
    });

    describe('Copy shortcut (Ctrl+C)', () => {
        it('should call onCopy when Ctrl+C is pressed', () => {
            const onCopy = vi.fn();
            renderHook(() => useKeyboardShortcuts({ onCopy }));

            const event = new KeyboardEvent('keydown', {
                key: 'c',
                ctrlKey: true,
            });
            Object.defineProperty(event, 'target', { value: document.body });
            window.dispatchEvent(event);

            expect(onCopy).toHaveBeenCalledTimes(1);
        });
    });

    describe('Paste shortcut (Ctrl+V)', () => {
        it('should call onPaste when Ctrl+V is pressed', () => {
            const onPaste = vi.fn();
            renderHook(() => useKeyboardShortcuts({ onPaste }));

            const event = new KeyboardEvent('keydown', {
                key: 'v',
                ctrlKey: true,
            });
            Object.defineProperty(event, 'target', { value: document.body });
            window.dispatchEvent(event);

            expect(onPaste).toHaveBeenCalledTimes(1);
        });
    });

    describe('Save shortcut (Ctrl+S)', () => {
        it('should call onSave when Ctrl+S is pressed', () => {
            const onSave = vi.fn();
            renderHook(() => useKeyboardShortcuts({ onSave }));

            const event = new KeyboardEvent('keydown', {
                key: 's',
                ctrlKey: true,
            });
            Object.defineProperty(event, 'target', { value: document.body });
            window.dispatchEvent(event);

            expect(onSave).toHaveBeenCalledTimes(1);
        });
    });

    describe('Edge cases', () => {
        it('should handle undefined callbacks gracefully', () => {
            renderHook(() => useKeyboardShortcuts({}));

            // Should not throw when callbacks are undefined
            expect(() => {
                const event = new KeyboardEvent('keydown', {
                    key: 'z',
                    ctrlKey: true,
                });
                Object.defineProperty(event, 'target', { value: document.body });
                window.dispatchEvent(event);
            }).not.toThrow();
        });

        it('should not trigger shortcuts in textarea', () => {
            const onSave = vi.fn();
            renderHook(() => useKeyboardShortcuts({ onSave }));

            const textarea = document.createElement('textarea');
            const event = new KeyboardEvent('keydown', {
                key: 's',
                ctrlKey: true,
            });
            Object.defineProperty(event, 'target', { value: textarea });
            window.dispatchEvent(event);

            expect(onSave).not.toHaveBeenCalled();
        });
    });
});
