"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import ParticleGrid from '@/components/ParticleGrid';
import AnimeCard from '@/components/AnimeCard';
import SpotlightSlider from '@/components/home/SpotlightSlider';
import TrendingCarousel from '@/components/home/TrendingCarousel';
import Top10Sidebar from '@/components/home/Top10Sidebar';
import ContinueWatching from '@/components/home/ContinueWatching';
import { jikanService } from '@/services/jikanService';
import { Anime } from '@/types';
import Link from 'next/link';
import { motion } from 'framer-motion';
import AnimeCarousel from '@/components/ui/AnimeCarousel';
import { SpotlightSkeleton, CarouselSkeleton, AnimeCardSkeleton } from '@/components/ui/Skeleton';

export default function HomeClient() {
    const [topAiring, setTopAiring] = useState<Anime[]>([]);
    const [topPopular, setTopPopular] = useState<Anime[]>([]);
    const [topMovies, setTopMovies] = useState<Anime[]>([]);
    const [spotlight, setSpotlight] = useState<Anime[]>([]);
    const [trending, setTrending] = useState<Anime[]>([]);
    const [newSeason, setNewSeason] = useState<Anime[]>([]);
    const [upcoming, setUpcoming] = useState<Anime[]>([]);
    const [classics, setClassics] = useState<Anime[]>([]);
    const [recommended, setRecommended] = useState<Anime[]>([]);
    const [loading, setLoading] = useState({
        spotlight: true,
        trending: true,
        newSeason: true,
        upcoming: true,
        popular: true,
        movies: true,
        classics: true,
        recommended: true
    });
    const [loadingMore, setLoadingMore] = useState(false);
    const [latestPage, setLatestPage] = useState(1);
    const [popularPage, setPopularPage] = useState(1);
    const [moviesPage, setMoviesPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();
    const contentRef = useRef<HTMLDivElement>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Progressive Loading: Each section loads as it's ready
        const fetchSection = async (key: keyof typeof loading, fetcher: () => Promise<any>, setter: (data: any) => void) => {
            try {
                const data = await fetcher();
                setter(data);
            } catch (err) {
                console.error(`Failed to load ${key}`, err);
            } finally {
                setLoading(prev => ({ ...prev, [key]: false }));
            }
        };

        fetchSection('spotlight', () => jikanService.getSpotlight(), setSpotlight);
        fetchSection('trending', () => jikanService.getTrending(), (data) => {
            setTrending(data);
            // Chain recommended to trending
            if (data.length > 0) {
                fetchSection('recommended', () => jikanService.getRecommendations(data[0].id), setRecommended);
            } else {
                setLoading(prev => ({ ...prev, recommended: false }));
            }
        });
        fetchSection('newSeason', () => jikanService.getNewThisSeason(), (data) => {
            setNewSeason(data);
            setTopAiring(data);
        });
        fetchSection('upcoming', () => jikanService.getUpcoming(), setUpcoming);
        fetchSection('popular', () => jikanService.getTopAnime('bypopularity', 1), (data) => setTopPopular(data.data));
        fetchSection('movies', () => jikanService.getTopAnime('favorite', 1), (data) => setTopMovies(data.data));
        fetchSection('classics', () => jikanService.searchWithFilters('', { year: 1990, orderBy: 'popularity' }, 1, 12), (data) => setClassics(data.data));

    }, []);

    const loadMoreLatest = async () => {
        if (loadingMore) return;
        setLoadingMore(true);
        try {
            const nextP = latestPage + 1;
            const response = await jikanService.getTopAnime('airing', nextP);
            setTopAiring(prev => [...prev, ...response.data]);
            setLatestPage(nextP);
            setHasNextPage(response.pagination.hasNextPage);
        } catch (err) {
            console.error("Failed to load more episodes", err);
        } finally {
            setLoadingMore(false);
        }
    };

    const loadMorePopular = async () => {
        if (loadingMore) return;
        setLoadingMore(true);
        try {
            const nextP = popularPage + 1;
            const response = await jikanService.getTopAnime('bypopularity', nextP);
            setTopPopular(prev => [...prev, ...response.data]);
            setPopularPage(nextP);
        } catch (err) {
            console.error("Failed to load more popular", err);
        } finally {
            setLoadingMore(false);
        }
    };

    const loadMoreMovies = async () => {
        if (loadingMore) return;
        setLoadingMore(true);
        try {
            const nextP = moviesPage + 1;
            // Using jikan search with type=movie for better movie list
            const response = await jikanService.searchWithFilters('', { type: 'movie', orderBy: 'popularity' }, nextP, 24);
            setTopMovies(prev => [...prev, ...response.data]);
            setMoviesPage(nextP);
        } catch (err) {
            console.error("Failed to load more movies", err);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${searchQuery}`);
        }
    };

    return (
        <div className="bg-[#0f1011] relative min-h-screen overflow-x-hidden">
            {/* Search Landing Section */}
            <section className="relative min-h-[90vh] md:min-h-[95vh] flex items-center justify-center py-20">
                {/* Visual Background Elements */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <ParticleGrid />
                    <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[150px] animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-brand-secondary/10 rounded-full blur-[150px] animate-pulse"></div>
                </div>

                <div className="relative z-10 w-full max-w-4xl mx-auto px-6">
                    <div className="flex flex-col items-center gap-10 md:gap-14 animate-fade-in text-center">

                        {/* Branding Section */}
                        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 group cursor-default">
                            <div className="relative">
                                <div className="absolute inset-0 bg-brand-primary/20 blur-3xl rounded-full animate-pulse"></div>
                                <Logo className="w-20 h-20 md:w-32 md:h-32 transform transition-all duration-1000 group-hover:rotate-[360deg] animate-spin-slow relative z-10" />
                            </div>
                            <div className="flex flex-col items-center md:items-start">
                                <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase leading-none drop-shadow-2xl">
                                    MANGEKYOU<span className="text-brand-primary">VERSE</span>
                                </h1>
                                <p className="text-[10px] md:text-xs font-black text-brand-primary opacity-60 uppercase tracking-[0.6em] mt-2 md:mt-4 ml-1">
                                    The Ultimate Anime Node
                                </p>
                            </div>
                        </div>

                        {/* Premium Search Container */}
                        <div className="w-full max-w-2xl relative" ref={searchContainerRef}>
                            <form onSubmit={handleSearchSubmit} className="relative group">
                                <div className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-black/20 text-lg pointer-events-none group-focus-within:text-brand-primary transition-colors">
                                    <i className="fa-solid fa-user-ninja"></i>
                                </div>
                                <input
                                    type="text"
                                    placeholder="What are you looking for today?"
                                    className="w-full h-14 md:h-16 bg-white rounded-full pl-12 md:pl-14 pr-20 md:pr-24 text-base md:text-lg font-bold text-black border-none focus:outline-none focus:ring-8 md:focus:ring-12 focus:ring-brand-primary/10 transition-all shadow-[0_30px_80px_rgba(0,0,0,0.5)] placeholder:text-gray-400"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    suppressHydrationWarning
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-brand-primary rounded-full flex items-center justify-center text-black group/btn hover:scale-110 active:scale-95 transition-all shadow-lg shadow-brand-primary/30 group-hover:shadow-brand-primary/50"
                                    suppressHydrationWarning
                                >
                                    <i className="fa-solid fa-magnifying-glass text-base md:text-lg"></i>
                                </button>
                            </form>
                        </div>

                        {/* Quick Access Tags */}
                        <div className="flex flex-col items-center gap-6">
                            <div className="flex flex-wrap justify-center gap-3">
                                <span className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] mr-4 self-center px-4 border-r border-white/10">Trending Tags:</span>
                                {['One Piece', 'Solo Leveling', 'Jujutsu Kaisen', 'Naruto', 'Demon Slayer'].map((tag, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => router.push(`/search?q=${tag}`)}
                                        className="bg-white/5 hover:bg-brand-primary hover:text-black px-5 py-2 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-widest transition-all border border-white/5 hover:border-brand-primary/50"
                                        suppressHydrationWarning
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content Sections */}
            <div className="max-w-7xl mx-auto px-4 md:px-6">

                {/* 1. Spotlight Slider */}
                <section ref={contentRef} className="pt-0 bg-[#0f1011] rounded-3xl overflow-hidden shadow-2xl min-h-[400px]">
                    {loading.spotlight ? (
                        <SpotlightSkeleton />
                    ) : (
                        spotlight.length > 0 && <SpotlightSlider items={spotlight} />
                    )}
                </section>

                {/* 2. HiAnime-style Continue Watching (Logged-in only) */}
                <ContinueWatching />

                {/* 3. Trending Section */}
                <section className="bg-[#0f1011] pt-16 pb-8 relative z-10 min-h-[300px]">
                    <div className="max-w-[1920px] mx-auto">
                        {loading.trending ? <CarouselSkeleton /> : <TrendingCarousel items={trending} />}
                    </div>
                </section>

                {/* Recommended For You */}
                {(loading.recommended || recommended.length > 0) && (
                    <AnimeCarousel
                        title="Recommended For You"
                        icon={<span className="w-1 h-8 bg-brand-primary rounded-full shadow-[0_0_15px_rgba(183,148,244,0.5)]"></span>}
                        viewAllLink="/browse?sort=score"
                    >
                        {loading.recommended ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <div key={`rec-skel-${i}`} className="w-[180px] md:w-[220px]">
                                    <AnimeCardSkeleton />
                                </div>
                            ))
                        ) : (
                            recommended.map((anime, i) => (
                                <div key={`rec-${anime.id}-${i}`} className="w-[180px] md:w-[220px]">
                                    <AnimeCard anime={anime} />
                                </div>
                            ))
                        )}
                    </AnimeCarousel>
                )}

                {/* New This Season */}
                <AnimeCarousel
                    title="New This Season"
                    icon={<span className="w-1 h-8 bg-brand-secondary rounded-full"></span>}
                    viewAllLink="/browse?status=airing"
                >
                    {loading.newSeason ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={`new-skel-${i}`} className="w-[180px] md:w-[220px]">
                                <AnimeCardSkeleton />
                            </div>
                        ))
                    ) : (
                        newSeason.map((anime, i) => (
                            <div key={`new-${anime.id}-${i}`} className="w-[180px] md:w-[220px]">
                                <AnimeCard anime={anime} />
                            </div>
                        ))
                    )}
                </AnimeCarousel>

                {/* Upcoming Hype */}
                <AnimeCarousel
                    title="Upcoming Hype"
                    icon={<span className="w-1 h-8 bg-purple-500 rounded-full"></span>}
                    viewAllLink="/browse?status=upcoming"
                >
                    {loading.upcoming ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={`up-skel-${i}`} className="w-[180px] md:w-[220px]">
                                <AnimeCardSkeleton />
                            </div>
                        ))
                    ) : (
                        upcoming.map((anime, i) => (
                            <div key={`up-${anime.id}-${i}`} className="w-[180px] md:w-[220px]">
                                <AnimeCard anime={anime} />
                            </div>
                        ))
                    )}
                </AnimeCarousel>

                {/* NEW: Most Popular */}
                <section className="py-12 border-t border-white/5 min-h-[400px]">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                            <span className="w-1 h-8 bg-brand-primary rounded-full shadow-[0_0_15px_rgba(183,148,244,0.3)]"></span>
                            All Time Popular
                        </h2>
                        <button onClick={loadMorePopular} disabled={loadingMore} className="text-[10px] font-black uppercase tracking-widest text-brand-primary hover:text-white transition-colors" suppressHydrationWarning>
                            {loadingMore ? 'Loading...' : 'Load More +'}
                        </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-10">
                        {loading.popular ? (
                            Array.from({ length: 12 }).map((_, i) => <AnimeCardSkeleton key={`pop-skel-${i}`} />)
                        ) : (
                            topPopular.map((anime, i) => (
                                <AnimeCard key={`pop-${anime.id}-${i}`} anime={anime} />
                            ))
                        )}
                    </div>
                </section>

                {/* Cinema Highlights */}
                <AnimeCarousel
                    title="Cinema Highlights"
                    icon={<span className="w-1 h-8 bg-brand-secondary rounded-full shadow-[0_0_15px_rgba(90,46,152,0.3)]"></span>}
                    viewAllLink="/browse?type=movie"
                >
                    {loading.movies ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={`mov-skel-${i}`} className="w-[180px] md:w-[220px]">
                                <AnimeCardSkeleton />
                            </div>
                        ))
                    ) : (
                        topMovies.map((anime, i) => (
                            <div key={`mov-${anime.id}-${i}`} className="w-[180px] md:w-[220px]">
                                <AnimeCard anime={anime} />
                            </div>
                        ))
                    )}
                </AnimeCarousel>

                {/* 4. Latest & Sidebar */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 py-12 border-t border-white/5">
                    {/* LEFT COLUMN */}
                    <div className="lg:col-span-3 space-y-16">
                        <section>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                    <span className="w-1 h-8 bg-brand-primary rounded-full"></span>
                                    Latest Episodes
                                </h2>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-10">
                                {loading.newSeason ? (
                                    Array.from({ length: 12 }).map((_, i) => <AnimeCardSkeleton key={`latest-skel-${i}`} />)
                                ) : (
                                    topAiring.map((anime, i) => (
                                        <motion.div
                                            key={`top-${anime.id}-${i}`}
                                            initial={{ opacity: 0, y: 10 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                        >
                                            <AnimeCard anime={anime} />
                                        </motion.div>
                                    ))
                                )}
                            </div>

                            {hasNextPage && (
                                <div className="mt-12 flex justify-center">
                                    <button
                                        onClick={loadMoreLatest}
                                        disabled={loadingMore}
                                        className="bg-white/5 hover:bg-brand-primary hover:text-black px-12 py-4 rounded-full text-xs font-black uppercase tracking-[0.3em] transition-all border border-white/10 hover:border-brand-primary/50 shadow-xl disabled:opacity-50 flex items-center gap-3"
                                        suppressHydrationWarning
                                    >
                                        {loadingMore ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                                Loading Node...
                                            </>
                                        ) : (
                                            <>
                                                Initialize More Data <i className="fa-solid fa-chevron-down"></i>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="lg:col-span-1 space-y-12">
                        {loading.trending ? <div className="h-[600px] w-full bg-white/5 animate-pulse rounded-[32px]"></div> : (trending.length > 0 && <Top10Sidebar items={trending} />)}

                        <div className="bg-[#121315] p-8 rounded-[32px] border border-white/5 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 blur-3xl -z-10 group-hover:bg-brand-primary/10 transition-all"></div>
                            <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
                                <i className="fa-solid fa-fire-flame-curved text-brand-primary"></i>
                                Explore Genres
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Isekai', 'Sci-Fi', 'Seinen', 'Shounen'].map(genre => (
                                    <Link key={genre} href={`/search?q=${genre}`} className="text-[10px] font-bold text-gray-500 hover:text-brand-primary hover:bg-white/5 border border-white/5 hover:border-brand-primary/20 px-3 py-2 rounded-xl transition-all truncate text-center uppercase tracking-widest">
                                        {genre}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
