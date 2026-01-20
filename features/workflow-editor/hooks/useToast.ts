// useToast - Hook for displaying toast notifications

import { useState, useCallback } from 'react';

export interface Toast {
    id: string;
    message: string;
    type: 'info' | 'success' | 'error' | 'warning';
    duration?: number;
}

export interface UseToastReturn {
    toasts: Toast[];
    showToast: (message: string, type?: Toast['type'], duration?: number) => void;
    hideToast: (id: string) => void;
}

export function useToast(): UseToastReturn {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback(
        (message: string, type: Toast['type'] = 'info', duration: number = 3000) => {
            const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const newToast: Toast = { id, message, type, duration };

            setToasts((prev) => [...prev, newToast]);

            if (duration > 0) {
                setTimeout(() => {
                    setToasts((prev) => prev.filter((toast) => toast.id !== id));
                }, duration);
            }
        },
        []
    );

    const hideToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return {
        toasts,
        showToast,
        hideToast,
    };
}
