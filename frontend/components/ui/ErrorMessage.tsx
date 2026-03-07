import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface ErrorMessageProps {
    message?: string;
    onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
    message = "Node data temporarily unavailable. Our indexers are working hard to restore the link.",
    onRetry
}) => {
    return (
        <div className="flex flex-col items-center justify-center p-12 bg-red-500/5 rounded-[2.5rem] border border-red-500/10 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center text-red-500">
                <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
                <h3 className="text-lg font-black text-white uppercase tracking-tighter">Connection Interrupted</h3>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest max-w-md mx-auto leading-relaxed">
                    {message}
                </p>
            </div>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="flex items-center gap-2 px-8 py-3 rounded-full bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary transition-all shadow-lg"
                >
                    <RefreshCcw className="w-4 h-4" />
                    Retry Connection
                </button>
            )}
        </div>
    );
};
