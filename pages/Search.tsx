import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AnimeCard from '../components/AnimeCard';
import { searchAnime } from '../services/animeService';
import { Anime } from '../types';

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
                setResults(searchResults);
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
