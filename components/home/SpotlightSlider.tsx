"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Anime } from '../../types';

interface SpotlightProps {
    items: any[];
}

const SpotlightSlider: React.FC<SpotlightProps> = ({ items }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        if (paused || items.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % items.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [paused, items.length]);

    const handleNext = () => setCurrentIndex((prev) => (prev + 1) % items.length);
    const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);

    if (items.length === 0) return null;

    const currentItem = items[currentIndex];

    return (
        <div
            className="relative h-[600px] w-full overflow-hidden bg-black group"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <AnimatePresence mode='wait'>
                <motion.div
                    key={currentItem.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7 }}
                    className="absolute inset-0"
                >
                    {/* Background Image */}
                    <div className="absolute inset-0">
                        <img src={currentItem.banner} alt={currentItem.title} className="w-full h-full object-cover opacity-60" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0f1011] via-[#0f1011]/60 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1011] via-transparent to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 h-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col justify-center">
                        <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="max-w-2xl space-y-6"
                        >
                            <div className="text-brand-primary font-black uppercase tracking-[0.3em] text-sm md:text-base flex items-center gap-3">
                                <span className="text-4xl text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-purple-500 font-extrabold italic">#{currentItem.rank}</span> Spotlight
                            </div>

                            <h2 className="text-4xl md:text-6xl font-black text-white leading-tight line-clamp-2 uppercase tracking-tighter drop-shadow-lg">
                                {currentItem.title}
                            </h2>

                            <div className="flex items-center gap-4 text-xs font-bold text-gray-300 uppercase tracking-widest">
                                <span className="bg-white/10 px-3 py-1 rounded-sm border border-white/10"><i className="fa-solid fa-tv mr-2"></i>{currentItem.type}</span>
                                <span className="bg-white/10 px-3 py-1 rounded-sm border border-white/10"><i className="fa-solid fa-clock mr-2"></i>{currentItem.duration}</span>
                                <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-sm border border-green-500/20">{currentItem.quality}</span>
                            </div>

                            <p className="text-gray-400 text-sm md:text-base leading-relaxed line-clamp-3 font-medium max-w-xl">
                                {currentItem.description}
                            </p>

                            <div className="flex items-center gap-4 pt-4">
                                <Link
                                    href={`/watch/${currentItem.id}`}
                                    className="bg-[#cbb2f9] hover:bg-[#d6c3ff] text-[#0f1011] px-8 py-3 rounded-full font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform flex items-center gap-3 shadow-lg shadow-[#cbb2f9]/20"
                                >
                                    <i className="fa-solid fa-play"></i> Watch Now
                                </Link>
                                <Link
                                    href={`/watch/${currentItem.id}`}
                                    className="bg-brand-primary/15 border border-brand-primary/40 text-brand-primary px-8 py-3 rounded-full font-black uppercase tracking-widest text-sm hover:bg-brand-primary/25 hover:border-brand-primary/60 transition-all flex items-center gap-3 backdrop-blur-md shadow-lg shadow-brand-primary/10"
                                >
                                    Details <i className="fa-solid fa-chevron-right text-xs"></i>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            <button
                onClick={handlePrev}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-16 md:h-16 rounded-full border border-white/10 bg-black/50 text-white flex items-center justify-center hover:bg-brand-primary hover:text-black hover:border-brand-primary transition-all opacity-0 group-hover:opacity-100 duration-300"
            >
                <i className="fa-solid fa-chevron-left text-xl"></i>
            </button>
            <button
                onClick={handleNext}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-16 md:h-16 rounded-full border border-white/10 bg-black/50 text-white flex items-center justify-center hover:bg-brand-primary hover:text-black hover:border-brand-primary transition-all opacity-0 group-hover:opacity-100 duration-300"
            >
                <i className="fa-solid fa-chevron-right text-xl"></i>
            </button>
        </div>
    );
};

export default SpotlightSlider;
