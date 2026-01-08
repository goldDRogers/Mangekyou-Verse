import React from 'react';
import Logo from './Logo';

interface LoaderProps {
    message?: string;
    fullScreen?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ message = "Initializing Node...", fullScreen = true }) => {
    const containerClass = fullScreen
        ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0f1011]"
        : "flex flex-col items-center justify-center min-h-[400px] w-full bg-transparent";

    return (
        <div className={containerClass}>
            <div className="relative w-32 h-32 mb-8">
                {/* Outer Glow */}
                <div className="absolute inset-0 rounded-full border-4 border-brand-primary/10 shadow-[0_0_50px_rgba(183,148,244,0.1)]"></div>

                {/* Spinning Rings */}
                <div className="absolute inset-0 rounded-full border-4 border-brand-primary border-t-transparent animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-2 border-brand-primary/50 border-b-transparent animate-spin-reverse"></div>

                {/* Center Logo */}
                <div className="absolute inset-4 flex items-center justify-center">
                    <Logo className="w-20 h-20 animate-pulse-glow" />
                </div>
            </div>

            {/* Text Animation */}
            <div className="flex flex-col items-center gap-2">
                <p className="text-brand-primary font-black uppercase tracking-[0.5em] text-xs animate-pulse">
                    {message}
                </p>
                <div className="flex gap-1 mt-2">
                    <span className="w-2 h-2 bg-brand-primary rounded-full animate-bounce delay-75"></span>
                    <span className="w-2 h-2 bg-brand-primary rounded-full animate-bounce delay-150"></span>
                    <span className="w-2 h-2 bg-brand-primary rounded-full animate-bounce delay-300"></span>
                </div>
            </div>
        </div>
    );
};

export default Loader;
