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
<<<<<<< HEAD:frontend/app/page.tsx
import { jikanService } from '@/services/jikanService';
=======
import { getSpotlight, getTrending, getRecentAnime } from '@/services/animeService';
>>>>>>> 0acef9b8aaf31e920f2b12e23c3bc94e41ec6fe5:app/page.tsx
import { Anime } from '@/types';
import Link from 'next/link';

export default function HomePage() {
    const [topAiring, setTopAiring] = useState<Anime[]>([]);
    const [spotlight, setSpotlight] = useState<Anime[]>([]);
    const [trending, setTrending] = useState<Anime[]>([]);
    const [newSeason, setNewSeason] = useState<Anime[]>([]);
    const [upcoming, setUpcoming] = useState<Anime[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();
    const contentRef = useRef<HTMLDivElement>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
<<<<<<< HEAD:frontend/app/page.tsx
                // Fetch real Jikan data
                const [spotlightData, trendingData, newData, upcomingData] = await Promise.all([
                    jikanService.getSpotlight(),
                    jikanService.getTrending(),
                    jikanService.getNewThisSeason(),
                    jikanService.getUpcoming()
=======
                const [spotlightData, trendingData, recentData] = await Promise.all([
                    getSpotlight(),
                    getTrending(),
                    getRecentAnime()
>>>>>>> 0acef9b8aaf31e920f2b12e23c3bc94e41ec6fe5:app/page.tsx
                ]);

                setSpotlight(spotlightData);
                setTrending(trendingData);
<<<<<<< HEAD:frontend/app/page.tsx
                setNewSeason(newData);
                setUpcoming(upcomingData);
                setTopAiring(newData); // Fallback "Latest" to new season for now
=======
                setTopAiring(recentData.slice(0, 12)); // Show 12 recent anime
>>>>>>> 0acef9b8aaf31e920f2b12e23c3bc94e41ec6fe5:app/page.tsx
            } catch (err) {
                console.error("Failed to load content", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${searchQuery}`);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8 bg-[#0f1011]">
                <div className="relative w-32 h-32">
                    <div className="absolute inset-0 rounded-full border-4 border-brand-primary/10 shadow-[0_0_50px_rgba(183,148,244,0.1)]"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-brand-primary border-t-transparent animate-spin"></div>
                    <Logo className="absolute inset-4 w-24 h-24 animate-pulse-glow" />
                </div>
                <p className="text-brand-primary font-black uppercase tracking-[0.5em] text-xs animate-pulse">Initializing Rinnegan Node...</p>
            </div>
        );
    }

    return (
        <div className="bg-[#0f1011] relative min-h-screen overflow-x-hidden">
            {/* Search Landing Section */}
            <section className="relative min-h-[90vh] md:min-h-[95vh] flex items-center justify-center py-20">
                {/* Visual Background Elements */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <ParticleGrid />
                    <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[150px] animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-brand-secondary/10 rounded-full blur-[150px] animate-pulse"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>
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
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-brand-primary rounded-full flex items-center justify-center text-black group/btn hover:scale-110 active:scale-95 transition-all shadow-lg shadow-brand-primary/30 group-hover:shadow-brand-primary/50"
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
                <section ref={contentRef} className="pt-0 bg-[#0f1011] rounded-3xl overflow-hidden shadow-2xl">
                    {spotlight.length > 0 && <SpotlightSlider items={spotlight} />}
                </section>

                {/* 2. HiAnime-style Continue Watching (Logged-in only) */}
                <ContinueWatching />

                {/* 3. Trending Section */}
                <section className="bg-[#0f1011] pt-16 pb-8 relative z-10">
                    <div className="max-w-[1920px] mx-auto">
                        <TrendingCarousel items={trending} />
                    </div>
                </section>

                {/* NEW: New This Season */}
                <section className="py-12 border-t border-white/5">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                            <span className="w-1 h-8 bg-brand-secondary rounded-full"></span>
                            New This Season
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-10">
                        {newSeason.map(anime => (
                            <AnimeCard key={anime.id} anime={anime} />
                        ))}
                    </div>
                </section>

                {/* NEW: Upcoming */}
                <section className="py-12 border-t border-white/5">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                            <span className="w-1 h-8 bg-purple-500 rounded-full"></span>
                            Upcoming Hype
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-10">
                        {upcoming.map(anime => (
                            <AnimeCard key={anime.id} anime={anime} />
                        ))}
                    </div>
                </section>

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
                                <button className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
                                    View All <i className="fa-solid fa-chevron-right ml-1 text-brand-primary"></i>
                                </button>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-10">
                                {topAiring.map(anime => (
                                    <AnimeCard key={anime.id} anime={anime} malId={anime.malId} />
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="lg:col-span-1 space-y-12">
                        {trending.length > 0 && <Top10Sidebar items={trending} />}

                        <div className="bg-[#121315] p-8 rounded-[32px] border border-white/5 shadow-2xl">
                            <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-6 border-b border-white/10 pb-4">Explore Genres</h3>
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
