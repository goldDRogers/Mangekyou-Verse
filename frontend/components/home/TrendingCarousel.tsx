"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { TrendingUp, Star } from 'lucide-react';
import AnimeCarousel from '../ui/AnimeCarousel';

interface TrendingProps {
    items: any[];
}

const TrendingCarousel: React.FC<TrendingProps> = ({ items }) => {
    if (items.length === 0) return null;

    return (
        <AnimeCarousel
            title="Trending Now"
            icon={<TrendingUp className="w-8 h-8" />}
            viewAllLink="/browse?sort=popularity"
        >
            {items.map((item, idx) => (
                <motion.div
                    key={item.id}
                    className="w-[220px] md:w-[280px]"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                >
                    <Link
                        href={`/watch/${item.id}`}
                        className="block relative aspect-[2/3] rounded-[2rem] overflow-hidden bg-brand-card border border-white/5 shadow-2xl group/card transition-all duration-500 hover:border-brand-primary/50"
                    >
                        {/* Rank Badge */}
                        <div className="absolute top-4 left-4 bg-brand-primary text-black font-black text-2xl px-5 py-2 rounded-2xl z-20 shadow-xl shadow-brand-primary/20 flex items-center justify-center">
                            {idx + 1}
                        </div>

                        <img
                            src={item.poster || item.thumbnail}
                            alt={item.title}
                            className="w-full h-full object-cover opacity-70 group-hover/card:opacity-100 group-hover/card:scale-110 transition-all duration-700"
                            loading="lazy"
                        />

                        {/* Bottom Overlay Info */}
                        <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent z-10 translate-y-2 group-hover/card:translate-y-0 transition-transform duration-500">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-lg border border-yellow-500/20">
                                    <Star className="w-3 h-3 fill-yellow-500" />
                                    <span className="text-[10px] font-black">{item.rating}</span>
                                </div>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{item.type}</span>
                            </div>
                            <h4 className="text-white font-black uppercase text-base leading-tight line-clamp-2 drop-shadow-md group-hover/card:text-brand-primary transition-colors">
                                {item.title}
                            </h4>
                        </div>

                        {/* Play Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-500">
                            <div className="w-16 h-16 rounded-full bg-brand-primary/20 backdrop-blur-xl border border-brand-primary flex items-center justify-center text-brand-primary scale-0 group-hover/card:scale-100 transition-transform duration-500">
                                <TrendingUp className="w-8 h-8" />
                            </div>
                        </div>
                    </Link>
                </motion.div>
            ))}
        </AnimeCarousel>
    );
};

export default TrendingCarousel;
