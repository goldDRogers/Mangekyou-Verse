"use client";

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AnimeCard from '@/components/AnimeCard';
import { jikanService, ANIME_GENRES, SearchFilters } from '@/services/jikanService';
import { Anime } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimeCardSkeleton } from '@/components/ui/Skeleton';
import { Search, Filter, X, ChevronDown, ChevronUp, Star, Calendar, Tv, Film, Loader2 } from 'lucide-react';

const YEAR_OPTIONS = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);

const STATUS_OPTIONS = [
    { value: 'airing', label: 'Currently Airing' },
    { value: 'complete', label: 'Completed' },
    { value: 'upcoming', label: 'Upcoming' },
];

const TYPE_OPTIONS = [
    { value: 'tv', label: 'TV Series', icon: Tv },
    { value: 'movie', label: 'Movie', icon: Film },
    { value: 'ova', label: 'OVA' },
    { value: 'ona', label: 'ONA' },
    { value: 'special', label: 'Special' },
];

const SORT_OPTIONS = [
    { value: 'popularity', label: 'Most Popular' },
    { value: 'score', label: 'Highest Rated' },
    { value: 'start_date', label: 'Newest First' },
    { value: 'title', label: 'Alphabetical' },
    { value: 'episodes', label: 'Most Episodes' },
];

function SearchResults() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const query = searchParams?.get('q') || '';

    const [results, setResults] = useState<Anime[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [totalResults, setTotalResults] = useState(0);

    // Filter states
    const [showFilters, setShowFilters] = useState(false);
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [selectedYear, setSelectedYear] = useState<number | undefined>();
    const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
    const [selectedType, setSelectedType] = useState<string | undefined>();
    const [selectedSort, setSelectedSort] = useState<string>('popularity');

    const buildFilters = useCallback((): SearchFilters => ({
        genres: selectedGenres.length > 0 ? selectedGenres : undefined,
        year: selectedYear,
        status: selectedStatus as SearchFilters['status'],
        type: selectedType as SearchFilters['type'],
        orderBy: selectedSort as SearchFilters['orderBy'],
        sort: 'desc',
    }), [selectedGenres, selectedYear, selectedStatus, selectedType, selectedSort]);

    const fetchResults = useCallback(async (pageNum: number, append: boolean = false) => {
        if (pageNum === 1) setLoading(true);
        else setLoadingMore(true);

        try {
            const response = await jikanService.searchWithFilters(query, buildFilters(), pageNum, 24);
            if (append) {
                setResults(prev => [...prev, ...response.data]);
            } else {
                setResults(response.data);
            }
            setHasNextPage(response.pagination.hasNextPage);
            setTotalResults(response.pagination.itemsTotal);
            setPage(pageNum);
        } catch (err) {
            console.error("Search failed", err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [query, buildFilters]);

    useEffect(() => {
        fetchResults(1, false);
    }, [query, selectedGenres, selectedYear, selectedStatus, selectedType, selectedSort]);

    const handleLoadMore = () => {
        fetchResults(page + 1, true);
    };

    const toggleGenre = (genreId: string) => {
        setSelectedGenres(prev =>
            prev.includes(genreId)
                ? prev.filter(g => g !== genreId)
                : [...prev, genreId]
        );
    };

    const clearFilters = () => {
        setSelectedGenres([]);
        setSelectedYear(undefined);
        setSelectedStatus(undefined);
        setSelectedType(undefined);
        setSelectedSort('popularity');
    };

    const hasActiveFilters = selectedGenres.length > 0 || selectedYear || selectedStatus || selectedType;

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900/20 to-slate-900">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-2">
                                Search Results
                            </h1>
                            {query && (
                                <p className="text-gray-400 text-lg flex items-center gap-2">
                                    <Search className="w-5 h-5 text-brand-primary" />
                                    "{query}"
                                    {totalResults > 0 && (
                                        <span className="text-sm bg-white/10 px-2 py-0.5 rounded-full">
                                            {totalResults.toLocaleString()} results
                                        </span>
                                    )}
                                </p>
                            )}
                        </div>

                        {/* Filter Toggle Button */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`
                                flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider
                                transition-all duration-300 border
                                ${showFilters || hasActiveFilters
                                    ? 'bg-brand-primary text-black border-brand-primary'
                                    : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
                                }
                            `}
                        >
                            <Filter className="w-4 h-4" />
                            Filters
                            {hasActiveFilters && (
                                <span className="bg-black/20 px-1.5 py-0.5 rounded text-xs">
                                    {[selectedGenres.length, selectedYear ? 1 : 0, selectedStatus ? 1 : 0, selectedType ? 1 : 0].reduce((a, b) => a + b, 0)}
                                </span>
                            )}
                            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                    </div>

                    {/* Filters Panel */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                            >
                                <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 mb-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {/* Genres */}
                                        <div className="lg:col-span-2">
                                            <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-3">
                                                Genres
                                            </label>
                                            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar">
                                                {ANIME_GENRES.map(genre => (
                                                    <button
                                                        key={genre.id}
                                                        onClick={() => toggleGenre(genre.id.toString())}
                                                        className={`
                                                            px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all
                                                            ${selectedGenres.includes(genre.id.toString())
                                                                ? 'bg-brand-primary text-black'
                                                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                                            }
                                                        `}
                                                    >
                                                        {genre.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Year */}
                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-3">
                                                <Calendar className="w-3 h-3 inline mr-1" /> Year
                                            </label>
                                            <select
                                                value={selectedYear || ''}
                                                onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : undefined)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-primary transition-colors"
                                            >
                                                <option value="">All Years</option>
                                                {YEAR_OPTIONS.map(year => (
                                                    <option key={year} value={year}>{year}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Status */}
                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-3">
                                                Status
                                            </label>
                                            <select
                                                value={selectedStatus || ''}
                                                onChange={(e) => setSelectedStatus(e.target.value || undefined)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-primary transition-colors"
                                            >
                                                <option value="">All Status</option>
                                                {STATUS_OPTIONS.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Type */}
                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-3">
                                                Type
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {TYPE_OPTIONS.map(opt => (
                                                    <button
                                                        key={opt.value}
                                                        onClick={() => setSelectedType(selectedType === opt.value ? undefined : opt.value)}
                                                        className={`
                                                            px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all
                                                            ${selectedType === opt.value
                                                                ? 'bg-brand-primary text-black'
                                                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                                            }
                                                        `}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Sort */}
                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-3">
                                                <Star className="w-3 h-3 inline mr-1" /> Sort By
                                            </label>
                                            <select
                                                value={selectedSort}
                                                onChange={(e) => setSelectedSort(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-primary transition-colors"
                                            >
                                                {SORT_OPTIONS.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Clear Filters */}
                                        <div className="flex items-end">
                                            <button
                                                onClick={clearFilters}
                                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors w-full justify-center"
                                            >
                                                <X className="w-4 h-4" />
                                                Clear All
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Results Grid */}
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {Array.from({ length: 24 }).map((_, i) => (
                            <AnimeCardSkeleton key={i} />
                        ))}
                    </div>
                ) : results.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                            {results.map((anime, index) => (
                                <motion.div
                                    key={`${anime.id}-${index}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: Math.min(index * 0.03, 0.5) }}
                                >
                                    <AnimeCard anime={anime} />
                                </motion.div>
                            ))}
                        </div>

                        {/* Pagination / Load More */}
                        {hasNextPage && (
                            <div className="flex justify-center mt-12">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={loadingMore}
                                    className="
                                        flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest
                                        bg-brand-primary text-black hover:bg-white transition-all
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                        shadow-[0_0_30px_rgba(183,148,244,0.3)] hover:shadow-[0_0_50px_rgba(183,148,244,0.5)]
                                    "
                                >
                                    {loadingMore ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Loading...
                                        </>
                                    ) : (
                                        <>
                                            Load More
                                            <span className="text-xs opacity-60">Page {page + 1}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-24 bg-white/5 rounded-3xl border border-white/5"
                    >
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-brand-primary/10 flex items-center justify-center">
                            <Search className="w-12 h-12 text-brand-primary/40" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">No results found</h2>
                        <p className="text-gray-500 mb-6">Try adjusting your filters or search for something else.</p>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider bg-brand-primary text-black hover:bg-white transition-colors"
                            >
                                Clear Filters
                            </button>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-brand-primary font-bold uppercase tracking-widest text-sm animate-pulse">
                        Searching...
                    </p>
                </div>
            </div>
        }>
            <SearchResults />
        </Suspense>
    );
}
