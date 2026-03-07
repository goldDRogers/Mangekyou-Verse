"use client";

import React, { useEffect, useState } from 'react';
import { historyService } from '@/services/watchlistService';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import AnimeCarousel from '../ui/AnimeCarousel';

export default function ContinueWatching() {
    const { user } = useAuth();
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchHistory = async () => {
            try {
                const data = await historyService.getContinueWatching();
                setHistory(data.slice(0, 6)); // Show top 6 latest
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [user]);

    if (!user || (!loading && history.length === 0)) return null;

    return (
        <AnimeCarousel
            title="Continue Watching"
            icon={<span className="w-1 h-8 bg-brand-primary rounded-full"></span>}
            viewAllLink="/history"
        >
            {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="w-[200px] md:w-[300px] aspect-video bg-[#1c1d21] rounded-2xl animate-pulse"></div>
                ))
            ) : (
                history.map((item) => (
                    <div key={`${item.anime.id}-${item.episode}`} className="w-[200px] md:w-[320px]">
                        <Link
                            href={`/watch/${item.anime.id}?ep=${item.episode}`}
                            className="group relative block"
                        >
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="relative aspect-video rounded-2xl overflow-hidden bg-[#1c1d21] border border-white/5 group-hover:border-brand-primary/30 transition-all shadow-2xl"
                            >
                                {/* Poster with Blur Overlay */}
                                <img
                                    src={item.anime.thumbnail}
                                    alt={item.anime.title}
                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                />

                                {/* Progress Bar (HiAnime Style) */}
                                <div className="absolute bottom-0 left-0 w-full h-1.5 bg-black/40">
                                    <div
                                        className="h-full bg-brand-primary shadow-[0_0_10px_rgba(183,148,244,0.8)]"
                                        style={{ width: `${Math.min((item.progress / 1440) * 100, 95)}%` }} // Calculate progress based on 24min episode
                                    ></div>
                                </div>

                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center text-[#0f1011] shadow-2xl">
                                        <i className="fa-solid fa-play ml-1"></i>
                                    </div>
                                </div>
                            </motion.div>

                            <div className="mt-3 px-2">
                                <h4 className="text-[11px] font-black text-white uppercase tracking-widest line-clamp-1 group-hover:text-brand-primary transition-colors">
                                    {item.anime.title}
                                </h4>
                                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                                    Episode {item.episode}
                                </p>
                            </div>
                        </Link>
                    </div>
                ))
            )}
        </AnimeCarousel>
    );
}
