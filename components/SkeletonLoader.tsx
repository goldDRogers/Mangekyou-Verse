import React from 'react';

const SkeletonCard: React.FC = () => {
    return (
        <div className="animate-pulse">
            {/* Poster skeleton */}
            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 mb-3 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/50 to-transparent animate-shimmer"></div>
            </div>

            {/* Title skeleton */}
            <div className="h-4 bg-gray-800 rounded-lg mb-2 w-3/4"></div>
            <div className="h-3 bg-gray-800 rounded-lg w-1/2"></div>
        </div>
    );
};

interface SkeletonGridProps {
    count?: number;
}

export const SkeletonGrid: React.FC<SkeletonGridProps> = ({ count = 12 }) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {Array.from({ length: count }).map((_, index) => (
                <SkeletonCard key={index} />
            ))}
        </div>
    );
};

export const SkeletonHero: React.FC = () => {
    return (
        <div className="relative h-[70vh] animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/50 to-transparent animate-shimmer"></div>
            </div>
            <div className="relative z-10 flex flex-col h-full justify-end p-8 md:p-16">
                <div className="h-12 bg-gray-800 rounded-xl mb-4 w-1/3"></div>
                <div className="h-6 bg-gray-800 rounded-lg mb-2 w-2/3"></div>
                <div className="h-6 bg-gray-800 rounded-lg w-1/2 mb-6"></div>
                <div className="flex gap-4">
                    <div className="h-12 bg-gray-800 rounded-xl w-32"></div>
                    <div className="h-12 bg-gray-800 rounded-xl w-32"></div>
                </div>
            </div>
        </div>
    );
};

export default SkeletonCard;
