"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { jikanService } from '@/services/jikanService';
import { historyService, watchlistService } from '@/services/watchlistService';
import { Anime } from '@/types';
import { motion } from 'framer-motion';

export default function WatchPage() {
    const params = useParams();
    const id = params ? params.id as string : '';
    const searchParams = useSearchParams();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const initialEp = searchParams?.get('ep') ? parseInt(searchParams.get('ep')!) : 1;

    const router = useRouter();
    const [anime, setAnime] = useState<Anime | null>(null);
    const [loading, setLoading] = useState(true);
    const [inWatchlist, setInWatchlist] = useState(false);

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch real data from Jikan
                const data = await jikanService.getAnimeDetails(id);

                if (!data) {
                    router.push('/');
                    return;
                }
                setAnime(data);
                const isSaved = await watchlistService.isInWatchlist(id);
                setInWatchlist(isSaved);

                // Log history on visit
                await historyService.updateProgress(id, '1', 0);
            } catch (err) {
                console.error("Failed to fetch anime details", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, router]);

    const handleToggleWatchlist = async () => {
        if (!id) return;
        try {
            const added = await watchlistService.toggleWatchlist(id);
            setInWatchlist(added);
        } catch (err) {
            console.error("Failed to toggle watchlist", err);
            router.push('/login');
        }
    };

    const handleRedirect = (ep: number) => {
        if (!anime) return;
        const searchQuery = encodeURIComponent(`${anime.title} episode ${ep}`);
        const url = `https://hianime.to/search?keyword=${searchQuery}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!anime) return null;

    return (
        <div className="container mx-auto px-4 py-8">
            {/* breadcrumbs */}
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-6 uppercase tracking-widest font-bold">
                <button onClick={() => router.push('/')} className="hover:text-brand-primary transition-colors">Home</button>
                <i className="fa-solid fa-chevron-right text-[8px]"></i>
                <span className="text-gray-400">{anime.type}</span>
                <i className="fa-solid fa-chevron-right text-[8px]"></i>
                <span className="text-brand-primary line-clamp-1">{anime.title}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Content Column */}
                <div className="lg:col-span-3 space-y-8">
                    {/* "Player" / Redirect Card */}
                    <div className="aspect-video bg-black rounded-2xl overflow-hidden relative shadow-2xl border border-white/5 group">
                        <img
                            src={anime.gallery ? anime.gallery[0] || anime.thumbnail : anime.thumbnail}
                            className="w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-700 blur-[2px]"
                            alt="Background"
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="mb-6"
                            >
                                <i className="fa-solid fa-shield-cat text-6xl text-brand-primary mb-4 opacity-80"></i>
                            </motion.div>
                            <h3 className="text-2xl font-black uppercase text-white mb-2 tracking-tight">
                                Stream Hosted Externally
                            </h3>
                            <p className="text-gray-400 text-sm max-w-md mb-8 leading-relaxed">
                                To ensure compliance with copyright regulations, Mangekyou Verse does not host video files. You will be redirected to a verified third-party provider.
                            </p>
                            <button
                                onClick={() => handleRedirect(1)}
                                className="bg-brand-primary text-[#0f1011] px-10 py-4 rounded-full font-black uppercase tracking-widest text-sm hover:scale-105 hover:bg-white transition-all shadow-lg shadow-brand-primary/20 flex items-center gap-3"
                            >
                                Continue to External Site <i className="fa-solid fa-arrow-up-right-from-square"></i>
                            </button>
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="bg-white/5 border border-white/5 rounded-3xl p-8 flex flex-col md:flex-row gap-8">
                        <div className="w-40 h-60 rounded-xl overflow-hidden shadow-2xl flex-shrink-0 mx-auto md:mx-0">
                            <img src={anime.thumbnail} className="w-full h-full object-cover" alt={anime.title} />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mb-4">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${anime.status === 'Ongoing' ? 'bg-green-500/20 text-green-400' : 'bg-brand-primary/20 text-brand-primary'}`}>
                                    {anime.status}
                                </span>
                                <span className="bg-white/5 text-gray-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{anime.type}</span>
                                <div className="flex items-center gap-1.5 text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full">
                                    <i className="fa-solid fa-star text-[10px]"></i>
                                    <span className="text-[10px] font-black">{anime.rating}</span>
                                </div>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-4 leading-tight">
                                {anime.title}
                            </h1>
                            <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                {anime.description}
                            </p>
                            <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
                                <button
                                    onClick={handleToggleWatchlist}
                                    className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all md:w-auto w-full ${inWatchlist
                                        ? 'bg-white/10 text-white hover:bg-white/20'
                                        : 'bg-brand-primary text-[#0f1011] hover:bg-[#cbb2f9]'
                                        }`}
                                >
                                    <i className={`fa-solid ${inWatchlist ? 'fa-check' : 'fa-plus'} mr-2`}></i>
                                    {inWatchlist ? 'Watchlist' : 'Add to List'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">
                    {/* Episodes List */}
                    <div className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden flex flex-col h-[500px]">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between flex-shrink-0">
                            <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                                <i className="fa-solid fa-list-ul text-brand-primary"></i>
                                Episodes ({anime.episodes || '?'})
                            </h2>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
                            {anime.episodes ? Array.from({ length: anime.episodes }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleRedirect(i + 1)}
                                    className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-brand-primary/10 hover:border-brand-primary/30 border border-transparent transition-all group/ep text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-gray-400 group-hover/ep:bg-brand-primary group-hover/ep:text-black transition-colors">
                                            {i + 1}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-gray-300 group-hover/ep:text-white">Episode {i + 1}</span>
                                            <span className="text-[10px] text-gray-600 uppercase tracking-widest group-hover/ep:text-brand-primary/70">Watch External</span>
                                        </div>
                                    </div>
                                    <i className="fa-solid fa-arrow-up-right-from-square text-xs text-gray-600 group-hover/ep:text-brand-primary"></i>
                                </button>
                            )) : (
                                <div className="p-6 text-center text-gray-500 text-xs font-bold uppercase tracking-widest">
                                    Episode count unknown
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Genres */}
                    <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
                        <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-3 mb-6">
                            <i className="fa-solid fa-tags text-brand-primary"></i>
                            Genres
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {anime.genres.map(genre => (
                                <span key={genre} className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-bold text-gray-400 border border-white/5">
                                    {genre}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
