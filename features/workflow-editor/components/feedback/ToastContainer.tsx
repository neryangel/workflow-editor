'use client';

import { CheckCircle, Info, AlertCircle, XCircle, X } from 'lucide-react';
import { Toast } from '../../hooks/useToast';

export interface ToastContainerProps {
    toasts: Toast[];
    onDismiss: (id: string) => void;
}

const toastConfig = {
    info: {
        icon: Info,
        bgClass: 'bg-blue-500/20 border-blue-500/50',
        iconClass: 'text-blue-400',
    },
    success: {
        icon: CheckCircle,
        bgClass: 'bg-green-500/20 border-green-500/50',
        iconClass: 'text-green-400',
    },
    warning: {
        icon: AlertCircle,
        bgClass: 'bg-yellow-500/20 border-yellow-500/50',
        iconClass: 'text-yellow-400',
    },
    error: {
        icon: XCircle,
        bgClass: 'bg-red-500/20 border-red-500/50',
        iconClass: 'text-red-400',
    },
};

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
            {toasts.map((toast) => {
                const config = toastConfig[toast.type];
                const Icon = config.icon;

                return (
                    <div
                        key={toast.id}
                        className={`
                            flex items-center gap-3 px-4 py-3 rounded-lg border
                            backdrop-blur-sm shadow-xl pointer-events-auto
                            animate-in slide-in-from-right duration-200
                            ${config.bgClass}
                        `}
                    >
                        <Icon className={`w-5 h-5 ${config.iconClass} flex-shrink-0`} />
                        <span className="text-sm text-white font-medium">{toast.message}</span>
                        <button
                            onClick={() => onDismiss(toast.id)}
                            className="ml-2 p-0.5 hover:bg-white/10 rounded transition-colors"
                        >
                            <X className="w-4 h-4 text-slate-400" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
