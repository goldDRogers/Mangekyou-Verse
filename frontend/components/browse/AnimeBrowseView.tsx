"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import AnimeCard from '@/components/AnimeCard';
import { jikanService, ANIME_GENRES, SearchFilters } from '@/services/jikanService';
import { Anime } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimeCardSkeleton } from '@/components/ui/Skeleton';
import { Search, Filter, X, ChevronDown, ChevronUp, Star, Calendar, Tv, Film, Loader2, ArrowUpRight } from 'lucide-react';
import Logo from '@/components/Logo';

const YEAR_OPTIONS = Array.from({ length: 40 }, (_, i) => new Date().getFullYear() - i);

const STATUS_OPTIONS = [
    { value: 'airing', label: 'Currently Airing' },
    { value: 'complete', label: 'Completed' },
    { value: 'upcoming', label: 'Upcoming' },
];

const TYPE_OPTIONS = [
    { value: 'tv', label: 'TV Series', icon: Tv },
    { value: 'movie', label: 'Movie', icon: Film },
    { value: 'ova', label: 'OVA' },
    { value: 'special', label: 'Special' },
];

const SORT_OPTIONS = [
    { value: 'popularity', label: 'Most Popular' },
    { value: 'score', label: 'Highest Rated' },
    { value: 'start_date', label: 'Newest First' },
    { value: 'title', label: 'Alphabetical' },
];

const SCORE_OPTIONS = [7, 8, 9];

interface AnimeBrowseViewProps {
    initialQuery?: string;
    title?: string;
}

export default function AnimeBrowseView({ initialQuery = '', title = 'Browse Anime' }: AnimeBrowseViewProps) {
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
    const [selectedMinScore, setSelectedMinScore] = useState<number | undefined>();

    const loaderRef = useRef<HTMLDivElement>(null);

    const buildFilters = useCallback((): SearchFilters => ({
        genres: selectedGenres.length > 0 ? selectedGenres : undefined,
        year: selectedYear,
        status: selectedStatus as SearchFilters['status'],
        type: selectedType as SearchFilters['type'],
        orderBy: selectedSort as SearchFilters['orderBy'],
        sort: 'desc',
        minScore: selectedMinScore,
    }), [selectedGenres, selectedYear, selectedStatus, selectedType, selectedSort, selectedMinScore]);

    const fetchResults = useCallback(async (pageNum: number, append: boolean = false) => {
        if (pageNum === 1) setLoading(true);
        else setLoadingMore(true);

        try {
            const response = await jikanService.searchWithFilters(initialQuery, buildFilters(), pageNum, 24);
            if (append) {
                setResults(prev => [...prev, ...response.data]);
            } else {
                setResults(response.data);
            }
            setHasNextPage(response.pagination.hasNextPage);
            setTotalResults(response.pagination.itemsTotal);
            setPage(pageNum);
        } catch (err) {
            console.error("Fetch failed", err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [initialQuery, buildFilters]);

    // Initial fetch and filter reset
    useEffect(() => {
        fetchResults(1, false);
    }, [initialQuery, selectedGenres, selectedYear, selectedStatus, selectedType, selectedSort, selectedMinScore]);

    // Infinite Scroll Implementation
    useEffect(() => {
        const currentLoader = loaderRef.current;
        if (!currentLoader) return;

        const observer = new IntersectionObserver((entries) => {
            const first = entries[0];
            if (first.isIntersecting && hasNextPage && !loadingMore && !loading) {
                fetchResults(page + 1, true);
            }
        }, { threshold: 0.1 });

        observer.observe(currentLoader);
        return () => observer.unobserve(currentLoader);
    }, [hasNextPage, loadingMore, loading, page, fetchResults]);

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
        setSelectedMinScore(undefined);
    };

    const hasActiveFilters = selectedGenres.length > 0 || selectedYear || selectedStatus || selectedType || selectedMinScore;

    return (
        <div className="min-h-screen bg-[#0f1011]">
            <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
                {/* Header */}
                <div className="mb-10">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
                        <div>
                            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 text-white">
                                {title}
                            </h1>
                            <div className="flex items-center gap-4">
                                {initialQuery && (
                                    <div className="px-4 py-1.5 bg-brand-primary/10 border border-brand-primary/20 rounded-full flex items-center gap-2">
                                        <Search className="w-3.5 h-3.5 text-brand-primary" />
                                        <span className="text-xs font-bold text-brand-primary uppercase tracking-widest">
                                            "{initialQuery}"
                                        </span>
                                    </div>
                                )}
                                {totalResults > 0 && (
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                                        {totalResults.toLocaleString()} records indexed
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Filter Toggle Button */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`
                                flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest
                                transition-all duration-500 border
                                ${showFilters || hasActiveFilters
                                    ? 'bg-brand-primary text-black border-brand-primary shadow-[0_0_30px_rgba(183,148,244,0.3)]'
                                    : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
                                }
                            `}
                        >
                            <Filter className="w-4 h-4" />
                            Filters
                            {hasActiveFilters && (
                                <span className="bg-black/10 px-2 py-0.5 rounded-lg text-[10px]">
                                    Active
                                </span>
                            )}
                            {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
                        </button>
                    </div>

                    {/* Filters Panel */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ height: 0, opacity: 0, y: -20 }}
                                animate={{ height: 'auto', opacity: 1, y: 0 }}
                                exit={{ height: 0, opacity: 0, y: -20 }}
                                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                className="overflow-hidden"
                            >
                                <div className="bg-[#121315] border border-white/5 rounded-[32px] p-8 mb-12 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 blur-[100px] pointer-events-none"></div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 relative z-10">
                                        {/* Genres */}
                                        <div className="lg:col-span-2">
                                            <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-5 flex items-center gap-2">
                                                <span className="w-1 h-3 bg-brand-primary rounded-full"></span>
                                                Genres
                                            </label>
                                            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-4">
                                                {ANIME_GENRES.map(genre => (
                                                    <button
                                                        key={genre.id}
                                                        onClick={() => toggleGenre(genre.id.toString())}
                                                        className={`
                                                            px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300
                                                            ${selectedGenres.includes(genre.id.toString())
                                                                ? 'bg-brand-primary text-black scale-105'
                                                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
                                                            }
                                                        `}
                                                    >
                                                        {genre.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Row 2: Basic Filters */}
                                        <div className="space-y-8">
                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-4">Year</label>
                                                <select
                                                    value={selectedYear || ''}
                                                    onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : undefined)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white text-xs font-bold focus:outline-none focus:border-brand-primary transition-all appearance-none cursor-pointer"
                                                >
                                                    <option value="" className="bg-[#121315]">All Years</option>
                                                    {YEAR_OPTIONS.map(year => (
                                                        <option key={year} value={year} className="bg-[#121315]">{year}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-4">Min Score</label>
                                                <div className="flex gap-2">
                                                    {SCORE_OPTIONS.map(score => (
                                                        <button
                                                            key={score}
                                                            onClick={() => setSelectedMinScore(selectedMinScore === score ? undefined : score)}
                                                            className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all border ${selectedMinScore === score ? 'bg-brand-primary text-black border-brand-primary' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'}`}
                                                        >
                                                            {score}+
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-8">
                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-4">Format</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {TYPE_OPTIONS.map(opt => (
                                                        <button
                                                            key={opt.value}
                                                            onClick={() => setSelectedType(selectedType === opt.value ? undefined : opt.value)}
                                                            className={`
                                                                flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border
                                                                ${selectedType === opt.value
                                                                    ? 'bg-brand-primary text-black border-brand-primary'
                                                                    : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                                                                }
                                                            `}
                                                        >
                                                            <opt.icon className="w-3 h-3" />
                                                            {opt.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex items-end gap-3 pt-4">
                                                <button
                                                    onClick={clearFilters}
                                                    className="flex-1 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                                                >
                                                    Clear All
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sort Bar */}
                                    <div className="mt-10 pt-8 border-t border-white/5 flex flex-wrap items-center gap-6 relative z-10">
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Sort By:</span>
                                        {SORT_OPTIONS.map(opt => (
                                            <button
                                                key={opt.value}
                                                onClick={() => setSelectedSort(opt.value)}
                                                className={`text-[11px] font-black uppercase tracking-widest transition-all ${selectedSort === opt.value ? 'text-brand-primary' : 'text-gray-500 hover:text-white'}`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Results Grid */}
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-10">
                        {Array.from({ length: 18 }).map((_, i) => (
                            <AnimeCardSkeleton key={i} />
                        ))}
                    </div>
                ) : results.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-10">
                            {results.map((anime, index) => (
                                <motion.div
                                    key={`${anime.id}-${index}`}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        delay: Math.min(index * 0.03, 0.4),
                                        duration: 0.5,
                                        ease: [0.22, 1, 0.36, 1]
                                    }}
                                >
                                    <AnimeCard anime={anime} />
                                </motion.div>
                            ))}
                        </div>

                        {/* Infinite Scroll Trigger */}
                        {hasNextPage && (
                            <div ref={loaderRef} className="flex flex-col items-center justify-center py-24 gap-6">
                                <div className="relative w-16 h-16">
                                    <div className="absolute inset-0 rounded-full border-4 border-brand-primary/10"></div>
                                    <div className="absolute inset-0 rounded-full border-4 border-brand-primary border-t-transparent animate-spin"></div>
                                    <Logo className="absolute inset-2 w-12 h-12" variant="spinning" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-primary/50 animate-pulse">
                                    Synchronizing more nodes...
                                </p>
                            </div>
                        )}
                    </>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-32 bg-white/5 rounded-[40px] border border-white/5"
                    >
                        <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-brand-primary/10 flex items-center justify-center">
                            <X className="w-12 h-12 text-brand-primary/40" />
                        </div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-4">No results found</h2>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-10">Try adjusting your filters to find what you're looking for.</p>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-brand-primary text-black hover:bg-white transition-all shadow-xl shadow-brand-primary/20"
                            >
                                Reset Discovery Filters
                            </button>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
