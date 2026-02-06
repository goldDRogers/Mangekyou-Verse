"use client";

import React, { useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, TrendingUp, Star } from 'lucide-react';

interface TrendingProps {
    items: any[];
}

const TrendingCarousel: React.FC<TrendingProps> = ({ items }) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: 'start',
        containScroll: 'trimSnaps',
        dragFree: true
    });

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    if (items.length === 0) return null;

    return (
        <div className="relative group/carousel">
            <div className="flex items-center justify-between mb-10 px-6 md:px-12">
                <div className="flex flex-col gap-1">
                    <h3 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
                        <TrendingUp className="w-8 h-8 text-brand-primary" />
                        Trending Now
                    </h3>
                    <div className="h-1 w-24 bg-brand-primary rounded-full shadow-[0_0_15px_rgba(183,148,244,0.5)]" />
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={scrollPrev}
                        className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-brand-primary hover:text-black hover:scale-110 transition-all backdrop-blur-md bg-white/5 group"
                    >
                        <ChevronLeft className="w-6 h-6 transition-transform group-active:scale-90" />
                    </button>
                    <button
                        onClick={scrollNext}
                        className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-brand-primary hover:text-black hover:scale-110 transition-all backdrop-blur-md bg-white/5 group"
                    >
                        <ChevronRight className="w-6 h-6 transition-transform group-active:scale-90" />
                    </button>
                </div>
            </div>

            <div className="relative">
                {/* Shadow Masks for Edge Fade */}
                <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#0f1011] to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#0f1011] to-transparent z-10 pointer-events-none" />

                <div className="overflow-hidden px-6 md:px-12" ref={emblaRef}>
                    <div className="flex gap-6 py-4">
                        {items.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                className="flex-[0_0_220px] md:flex-[0_0_280px] min-w-0"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrendingCarousel;
