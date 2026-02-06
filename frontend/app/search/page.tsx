"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Layout from '@/components/Layout';
import AnimeCard from '@/components/AnimeCard';
import { searchAnime } from '@/services/animeService';
import { Anime } from '@/types';
import { motion } from 'framer-motion';

const fuzzyScore = (query: string, text: string): number => {
    const q = query.trim().toLowerCase();
    const t = (text || '').trim().toLowerCase();
    if (!q) return Number.POSITIVE_INFINITY;
    if (!t) return Number.POSITIVE_INFINITY;
    if (t === q) return 0;
    if (t.startsWith(q)) return 1;
    const idx = t.indexOf(q);
    if (idx !== -1) return 2 + idx;

    let ti = 0;
    let gaps = 0;
    for (let qi = 0; qi < q.length; qi++) {
        const ch = q[qi];
        const found = t.indexOf(ch, ti);
        if (found === -1) return 9999;
        gaps += found - ti;
        ti = found + 1;
    }

    return 10 + gaps;
};

function SearchResults() {
    const searchParams = useSearchParams();
    const query = searchParams ? searchParams.get('q') || '' : '';
    const [results, setResults] = useState<Anime[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const data = await searchAnime(query);
                const ranked = [...data]
                    .map((a) => ({ a, score: fuzzyScore(query, a.title) }))
                    .sort((x, y) => x.score - y.score)
                    .map((x) => x.a);
                setResults(ranked);
            } catch (err) {
                console.error("Search failed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [query]);

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mb-12">
                <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">
                    Search Results <span className="text-brand-primary">For:</span>
                </h1>
                <p className="text-gray-400 text-lg">"{query}"</p>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="aspect-[2/3] bg-white/5 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            ) : results.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {results.map((anime, index) => (
                        <motion.div
                            key={anime.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <AnimeCard anime={anime} />
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/5">
                    <i className="fa-solid fa-face-frown text-6xl text-brand-primary/20 mb-6"></i>
                    <h2 className="text-2xl font-bold mb-2">No results found</h2>
                    <p className="text-gray-500">Try searching for something else or check your spelling.</p>
                </div>
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <SearchResults />
        </Suspense>
    );
}
