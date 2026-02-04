import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AnimeCard from '../components/AnimeCard';
import { searchAnime } from '../services/animeService';
import { Anime } from '../types';

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

const Search: React.FC = () => {
    const searchParams = useSearchParams();
    const query = searchParams?.get('q');
    const [results, setResults] = useState<Anime[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const performSearch = async () => {
            if (!query) return;
            
            setLoading(true);
            try {
                const searchResults = await searchAnime(query);
                const ranked = [...searchResults]
                    .map((a) => ({ a, score: fuzzyScore(query, a.title) }))
                    .sort((x, y) => x.score - y.score)
                    .map((x) => x.a);
                setResults(ranked);
            } catch (error) {
                console.error('Search failed:', error);
            } finally {
                setLoading(false);
            }
        };

        performSearch();
    }, [query]);

    return (
        <div className="min-h-screen bg-[#0f1011] pt-32 px-4 md:px-12 pb-24">
            <h1 className="text-3xl font-black text-white uppercase mb-8">Results for <span className="text-brand-primary">"{query}"</span></h1>
            {loading ? (
                <div className="text-white animate-pulse">Scanning the multiverse...</div>
            ) : results.length === 0 ? (
                <div className="text-gray-500">No results found in this timeline.</div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
                    {results.map((anime, idx) => <AnimeCard key={`${anime.id}-${idx}`} anime={anime} />)}
                </div>
            )}
        </div>
    );
};
export default Search;
