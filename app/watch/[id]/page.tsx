"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { getAnimeDetailsFromBackend, getEpisodes } from '@/services/animeService';
import { historyService, watchlistService } from '@/services/watchlistService';
import { Anime } from '@/types';
import { motion } from 'framer-motion';
import { createWatchRedirectHandler, getExternalSiteInfo } from '@/lib/externalRedirect';

export default function WatchPage() {
    const params = useParams();
    const id = params ? params.id as string : '';
    const router = useRouter();
    const [anime, setAnime] = useState<Anime | null>(null);
    const [loading, setLoading] = useState(true);
    const [inWatchlist, setInWatchlist] = useState(false);
    const [currentEpisode, setCurrentEpisode] = useState(1);
    const [redirectLoading, setRedirectLoading] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [progress, setProgress] = useState(0);

    // Create external redirect handler with MAL ID and loading state
    const handleWatchExternal = async () => {
        if (!anime) return;
        
        setRedirectLoading(true);
        try {
            const handler = createWatchRedirectHandler(anime.title, anime.malId);
            await handler();
        } catch (error) {
            console.error('Failed to redirect:', error);
        } finally {
            setRedirectLoading(false);
        }
    };
    const externalSite = getExternalSiteInfo();

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // Get anime details from Jikan API via our service
                const data = await getAnimeDetailsFromBackend(id);

                if (!data) {
                    router.push('/');
                    return;
                }
                setAnime(data);

                const isSaved = await watchlistService.isInWatchlist(id);
                setInWatchlist(isSaved);

                // Try to get episodes from Jikan API
                const backendEpisodes = await getEpisodes(id);
                if (backendEpisodes && backendEpisodes.length > 0) {
                    // Update anime with real episodes if available
                    setAnime(prev => prev ? { ...prev, episodes: backendEpisodes.length } : null);
                }

                // Try to get existing progress
                const history = await historyService.getHistory();
                const current = history.find((h: any) => h.anime_id === id);
                if (current) {
                    setCurrentEpisode(parseInt(current.episode_id) || 1);
                    setProgress(current.progress_seconds || 0);
                }
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

    const handleEpisodeClick = (ep: number) => {
        setCurrentEpisode(ep);
        if (id) {
            historyService.updateProgress(id, ep.toString(), 0);
        }
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
                <span className="text-brand-primary">{anime.title}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Player Column */}
                <div className="lg:col-span-3 space-y-6">
                {/* External Redirect Section */}
                <div className="aspect-video bg-black rounded-2xl overflow-hidden relative shadow-2xl border border-white/5 group">
                    <img
                        src={anime.gallery ? anime.gallery[0] : anime.thumbnail}
                        className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                        alt="Anime Background"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                        <motion.button
                            onClick={handleWatchExternal}
                            disabled={redirectLoading}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            whileHover={{ scale: redirectLoading ? 1 : 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-brand-primary hover:bg-brand-primary/90 text-black rounded-full w-32 h-32 flex flex-col items-center justify-center cursor-pointer transition-all shadow-[0_0_50px_rgba(183,148,244,0.5)] hover:shadow-[0_0_80px_rgba(183,148,244,0.8)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {redirectLoading ? (
                                <>
                                    <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mb-2"></div>
                                    <span className="text-xs font-black uppercase tracking-wider">
                                        Loading...
                                    </span>
                                </>
                            ) : (
                                <>
                                    <i className={`${externalSite?.icon || 'fa-solid fa-external-link-alt'} text-3xl mb-2`}></i>
                                    <span className="text-xs font-black uppercase tracking-wider">
                                        Watch Now
                                    </span>
                                </>
                            )}
                        </motion.button>
                        
                        <div className="mt-8 text-center">
                            <p className="text-white/90 font-black uppercase tracking-[0.3em] text-[10px] bg-black/60 px-6 py-2 rounded-full backdrop-blur-md mb-3">
                                Stream on {externalSite?.name || 'external site'}
                            </p>
                            <p className="text-gray-400 text-xs max-w-md">
                                You will be redirected to a third-party streaming site. 
                                Mangekyou Verse is not responsible for external content.
                            </p>
                        </div>
                    </div>

                    {/* External Site Badge */}
                    <div className="absolute top-4 right-4">
                        <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-full px-3 py-1.5 flex items-center gap-2">
                            <i className={`${externalSite?.icon || 'fa-solid fa-external-link-alt'} text-xs text-brand-primary`}></i>
                            <span className="text-xs text-white font-medium">
                                {externalSite?.name || 'External'}
                            </span>
                        </div>
                    </div>
                </div>

                    {/* Info Section */}
                    <div className="bg-white/5 border border-white/5 rounded-3xl p-8 flex flex-col md:flex-row gap-8">
                        <div className="w-32 h-48 rounded-xl overflow-hidden shadow-2xl flex-shrink-0 order-2 md:order-1 self-center md:self-start">
                            <img src={anime.thumbnail} className="w-full h-full object-cover" alt={anime.title} />
                        </div>
                        <div className="flex-1 order-1 md:order-2">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <span className="bg-brand-primary/20 text-brand-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{anime.status}</span>
                                <span className="bg-white/5 text-gray-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{anime.type}</span>
                                <div className="flex items-center gap-1.5 text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full">
                                    <i className="fa-solid fa-star text-[10px]"></i>
                                    <span className="text-[10px] font-black">{anime.rating}</span>
                                </div>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-4 leading-tight">
                                {anime.title || 'Untitled Anime'}
                            </h1>
                            <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3 hover:line-clamp-none transition-all duration-500">
                                {anime.description || 'No description available for this verse.'}
                            </p>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleToggleWatchlist}
                                    className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${inWatchlist
                                        ? 'bg-white/10 text-white hover:bg-white/20'
                                        : 'bg-brand-primary text-[#0f1011] hover:bg-[#cbb2f9]'
                                        }`}
                                >
                                    <i className={`fa-solid ${inWatchlist ? 'fa-check' : 'fa-plus'}`}></i>
                                    {inWatchlist ? 'Watchlist' : 'Add to List'}
                                </button>
                                <button className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 text-white hover:text-brand-primary transition-colors border border-white/5">
                                    <i className="fa-solid fa-share-nodes"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">
                    {/* Episodes List */}
                    <div className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                                <i className="fa-solid fa-list-ul text-brand-primary"></i>
                                Episodes
                            </h2>
                            <span className="text-[10px] font-black text-gray-500">1-{anime.episodes}</span>
                        </div>
                        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-4 gap-2 p-6 max-h-[400px] overflow-y-auto custom-scrollbar">
                            {Array.from({ length: anime.episodes || 12 }).map((_, i) => {
                                const ep = i + 1;
                                const isActive = ep === currentEpisode;
                                return (
                                    <button
                                        key={ep}
                                        onClick={() => handleEpisodeClick(ep)}
                                        className={`aspect-square flex items-center justify-center rounded-lg text-xs font-bold transition-all ${isActive
                                            ? 'bg-brand-primary text-[#0f1011] shadow-lg shadow-brand-primary/20 scale-105'
                                            : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        {ep}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Framer Shots (Gallery) */}
                    <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
                        <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-3 mb-6">
                            <i className="fa-solid fa-camera-retro text-brand-primary"></i>
                            Framer Shots
                        </h2>
                        <div className="grid grid-cols-1 gap-4">
                            {(anime.gallery || []).slice(1).map((shot, i) => (
                                <div key={i} className="aspect-video rounded-xl overflow-hidden border border-white/5 group/shot">
                                    <img src={shot} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Shot" />
                                </div>
                            ))}
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
                                <span key={genre} className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-bold text-gray-400 hover:bg-brand-primary/10 hover:text-brand-primary transition-all cursor-pointer border border-white/5">
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
