"use client";

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface TrendingProps {
    items: any[];
}

const TrendingCarousel: React.FC<TrendingProps> = ({ items }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = direction === 'left' ? -300 : 300;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if (items.length === 0) return null;

    return (
        <div className="relative group">
            <div className="flex items-center justify-between mb-8 px-4 md:px-8">
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
                    <span className="text-brand-primary">#</span> Trending Now
                </h3>
                <div className="flex gap-2">
                    <button onClick={() => scroll('left')} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-brand-primary hover:text-black transition-all">
                        <i className="fa-solid fa-chevron-left"></i>
                    </button>
                    <button onClick={() => scroll('right')} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-brand-primary hover:text-black transition-all">
                        <i className="fa-solid fa-chevron-right"></i>
                    </button>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto pb-8 px-4 md:px-8 scrollbar-hide snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {items.map((item, idx) => (
                    <motion.div
                        key={item.id}
                        className="flex-shrink-0 w-[200px] md:w-[240px] snap-start relative group/card"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Link href={`/watch/${item.id}`} className="block relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-900 border border-white/5 shadow-2xl">
                            {/* Rank Badge */}
                            <div className="absolute top-0 left-0 bg-brand-primary text-black font-black text-xl px-4 py-2 rounded-br-2xl z-10 shadow-lg">
                                #{item.rank}
                            </div>

                            <img src={item.poster} alt={item.title} className="w-full h-full object-cover opacity-80 group-hover/card:opacity-100 transition-opacity" />

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover/card:opacity-90 transition-opacity" />

                            <div className="absolute bottom-0 left-0 p-4 w-full">
                                <h4 className="text-white font-black uppercase text-sm leading-tight line-clamp-2 drop-shadow-md group-hover/card:text-brand-primary transition-colors">
                                    {item.title}
                                </h4>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default TrendingCarousel;
