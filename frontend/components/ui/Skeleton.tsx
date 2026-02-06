"use client";

import React from 'react';
import { clsx } from 'clsx';

interface SkeletonProps {
    className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => (
    <div className={clsx("animate-pulse bg-white/5 rounded-lg", className)} />
);

// Anime Card Skeleton
export const AnimeCardSkeleton: React.FC = () => (
    <div className="group block relative">
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-brand-card border border-white/5">
            <Skeleton className="w-full h-full rounded-xl" />
            {/* Badge placeholders */}
            <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                <Skeleton className="w-10 h-4 rounded" />
                <Skeleton className="w-12 h-4 rounded" />
            </div>
            {/* Rating placeholder */}
            <div className="absolute top-2 right-2 z-10">
                <Skeleton className="w-10 h-5 rounded" />
            </div>
        </div>
        <div className="mt-3 space-y-2">
            <Skeleton className="h-4 w-3/4 rounded" />
            <Skeleton className="h-3 w-1/2 rounded" />
        </div>
    </div>
);

// Spotlight Skeleton
export const SpotlightSkeleton: React.FC = () => (
    <div className="relative h-[550px] md:h-[700px] w-full overflow-hidden bg-black">
        <Skeleton className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f1011] via-[#0f1011]/70 to-transparent" />
        <div className="relative z-10 h-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col justify-center">
            <div className="max-w-3xl space-y-6">
                <Skeleton className="h-6 w-32 rounded" />
                <Skeleton className="h-16 w-full max-w-xl rounded" />
                <div className="flex gap-3">
                    <Skeleton className="h-8 w-20 rounded-md" />
                    <Skeleton className="h-8 w-24 rounded-md" />
                    <Skeleton className="h-8 w-16 rounded-md" />
                </div>
                <Skeleton className="h-16 w-full max-w-lg rounded" />
                <div className="flex gap-4 pt-4">
                    <Skeleton className="h-12 w-36 rounded-full" />
                    <Skeleton className="h-12 w-32 rounded-full" />
                </div>
            </div>
        </div>
    </div>
);

// Carousel Row Skeleton
export const CarouselSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48 rounded" />
            <Skeleton className="h-6 w-20 rounded" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <AnimeCardSkeleton key={i} />
            ))}
        </div>
    </div>
);

// Search Result Skeleton
export const SearchResultSkeleton: React.FC = () => (
    <div className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
        <Skeleton className="w-16 h-24 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4 rounded" />
            <Skeleton className="h-4 w-1/2 rounded" />
            <div className="flex gap-2 pt-1">
                <Skeleton className="h-5 w-12 rounded" />
                <Skeleton className="h-5 w-16 rounded" />
            </div>
        </div>
    </div>
);

// Episode List Skeleton
export const EpisodeListSkeleton: React.FC<{ count?: number }> = ({ count = 12 }) => (
    <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32 rounded" />
                    <Skeleton className="h-3 w-20 rounded" />
                </div>
                <Skeleton className="w-6 h-6 rounded" />
            </div>
        ))}
    </div>
);

export default Skeleton;
