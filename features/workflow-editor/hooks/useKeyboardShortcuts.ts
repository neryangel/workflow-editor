"use client";

import { useEffect, useCallback } from "react";

interface KeyboardShortcuts {
  onUndo?: () => void;
  onRedo?: () => void;
  onDelete?: () => void;
  onSelectAll?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onSave?: () => void;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcuts) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const ctrlKey = isMac ? event.metaKey : event.ctrlKey;

      // Ignore if typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Undo: Ctrl+Z
      if (ctrlKey && event.key === "z" && !event.shiftKey) {
        event.preventDefault();
        shortcuts.onUndo?.();
        return;
      }

      // Redo: Ctrl+Shift+Z or Ctrl+Y
      if (
        (ctrlKey && event.key === "z" && event.shiftKey) ||
        (ctrlKey && event.key === "y")
      ) {
        event.preventDefault();
        shortcuts.onRedo?.();
        return;
      }

      // Delete: Delete or Backspace
      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        shortcuts.onDelete?.();
        return;
      }

      // Select All: Ctrl+A
      if (ctrlKey && event.key === "a") {
        event.preventDefault();
        shortcuts.onSelectAll?.();
        return;
      }

      // Copy: Ctrl+C
      if (ctrlKey && event.key === "c") {
        event.preventDefault();
        shortcuts.onCopy?.();
        return;
      }

      // Paste: Ctrl+V
      if (ctrlKey && event.key === "v") {
        event.preventDefault();
        shortcuts.onPaste?.();
        return;
      }

      // Save: Ctrl+S
      if (ctrlKey && event.key === "s") {
        event.preventDefault();
        shortcuts.onSave?.();
        return;
      }
    },
    [shortcuts],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
