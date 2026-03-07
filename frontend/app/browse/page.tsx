"use client";

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AnimeBrowseView from '@/components/browse/AnimeBrowseView';

function BrowseContent() {
    const searchParams = useSearchParams();
    const query = searchParams?.get('q') || '';

    return <AnimeBrowseView initialQuery={query} title="Browse Library" />;
}

export default function BrowsePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0f1011] flex items-center justify-center">
                <div className="flex flex-col items-center gap-6">
                    <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-brand-primary font-black uppercase tracking-[0.5em] text-xs animate-pulse">
                        Waking up the database...
                    </p>
                </div>
            </div>
        }>
            <BrowseContent />
        </Suspense>
    );
}
