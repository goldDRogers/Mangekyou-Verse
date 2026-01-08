import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchAnime } from '../services/animeService';
import { Anime } from '../types';
import AnimeCard from '../components/AnimeCard';
import { SkeletonGrid } from '../components/SkeletonLoader';
import ErrorHandler from '../components/ErrorHandler';

const Search: React.FC = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [results, setResults] = useState<Anime[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);

    const observer = useRef<IntersectionObserver | null>(null);
    const lastElementRef = useCallback((node: HTMLDivElement | null) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    const fetchData = async (isNewSearch: boolean) => {
        if (!query) return;
        setLoading(true);
        setError(null);
        try {
            const data = await searchAnime(query, isNewSearch ? 1 : page);
            if (isNewSearch) {
                setResults(data);
                setPage(1);
            } else {
                setResults(prev => [...prev, ...data]);
            }
            setHasMore(data.length > 0);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch results');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setResults([]);
        setPage(1);
        setHasMore(true);
        fetchData(true);
    }, [query]);

    useEffect(() => {
        if (page > 1) {
            fetchData(false);
        }
    }, [page]);

    return (
        <div className="min-h-screen bg-[#0f1011] py-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-12">
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">
                        Search Results for <span className="text-brand-primary">"{query}"</span>
                    </h1>
                    <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">
                        Found {results.length} nodes in the multiverse
                    </p>
                </div>

                {error && <ErrorHandler message={error} retry={() => fetchData(true)} />}

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-10">
                    {results.map((anime, index) => {
                        if (results.length === index + 1) {
                            return (
                                <div ref={lastElementRef} key={anime.id}>
                                    <AnimeCard anime={anime} />
                                </div>
                            );
                        } else {
                            return <AnimeCard key={anime.id} anime={anime} />;
                        }
                    })}
                </div>

                {loading && (
                    <div className="mt-12">
                        <SkeletonGrid count={6} />
                    </div>
                )}

                {!loading && !hasMore && results.length > 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-600 font-bold uppercase tracking-widest text-xs">End of the multiverse reached</p>
                    </div>
                )}

                {!loading && results.length === 0 && !error && (
                    <div className="text-center py-20">
                        <i className="fa-solid fa-ghost text-6xl text-gray-800 mb-6"></i>
                        <p className="text-gray-500 text-xl font-bold uppercase tracking-widest">No nodes found for "{query}"</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;
