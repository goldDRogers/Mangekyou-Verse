import React from 'react';

interface ErrorHandlerProps {
    message?: string;
    retry?: () => void;
}

const ErrorHandler: React.FC<ErrorHandlerProps> = ({ message = "Something went wrong.", retry }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 text-center px-4">
            <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <i className="fa-solid fa-triangle-exclamation text-4xl text-red-500"></i>
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-widest">System Failure</h2>
            <p className="text-gray-400 max-w-md">{message}</p>
            {retry && (
                <button
                    onClick={retry}
                    className="mt-4 px-8 py-3 bg-brand-primary hover:bg-[#cbb2f9] text-[#0f1011] rounded-xl font-black uppercase tracking-widest transition-all hover:scale-105"
                >
                    <i className="fa-solid fa-rotate-right mr-2"></i>
                    Retry Connection
                </button>
            )}
        </div>
    );
};

export default ErrorHandler;
