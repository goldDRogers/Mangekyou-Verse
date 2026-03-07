"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Anime } from '../../types';

interface SpotlightProps {
    items: Anime[];
}

const SpotlightSlider: React.FC<SpotlightProps> = ({ items }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        if (paused || !items || items.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % items.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [paused, items]);

    const handleNext = () => setCurrentIndex((prev) => (prev + 1) % items.length);
    const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);

    if (!items || items.length === 0) return null;

    const currentItem = items[currentIndex];
    const bannerImage = currentItem.gallery?.[0] || currentItem.thumbnail;

    return (
        <div
            className="relative h-[550px] md:h-[700px] w-full overflow-hidden bg-black group"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <AnimatePresence mode='wait'>
                <motion.div
                    key={currentItem.id}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0"
                >
                    {/* Background Image with Cinematic Blur */}
                    <div className="absolute inset-0">
                        <img
                            src={bannerImage}
                            alt={currentItem.title}
                            className="w-full h-full object-cover opacity-50 blur-[2px] scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0f1011] via-[#0f1011]/70 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1011] via-transparent to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 h-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col justify-center">
                        <motion.div
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.6, staggerChildren: 0.1 }}
                            className="max-w-3xl space-y-6"
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-brand-primary font-black uppercase tracking-[0.3em] text-xs md:text-sm flex items-center gap-3"
                            >
                                <span className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-purple-500 font-extrabold italic">
                                    #{currentIndex + 1}
                                </span>
                                Spotlight
                            </motion.div>

                            <motion.h2
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                                className="text-3xl md:text-6xl font-black text-white leading-tight line-clamp-2 uppercase tracking-tighter drop-shadow-2xl"
                            >
                                {currentItem.title}
                            </motion.h2>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center gap-3 text-[10px] md:text-xs font-bold text-gray-300 uppercase tracking-widest"
                            >
                                <span className="bg-white/10 px-3 py-1.5 rounded-md border border-white/5 backdrop-blur-md">
                                    <i className="fa-solid fa-tv mr-2 text-brand-primary"></i>{currentItem.type || 'TV'}
                                </span>
                                <span className="bg-white/10 px-3 py-1.5 rounded-md border border-white/5 backdrop-blur-md">
                                    <i className="fa-solid fa-layer-group mr-2 text-brand-primary"></i>{currentItem.episodes ? `${currentItem.episodes} eps` : 'Unknown'}
                                </span>
                                <span className="bg-brand-primary/10 text-brand-primary px-3 py-1.5 rounded-md border border-brand-primary/20">
                                    <i className="fa-solid fa-star mr-1"></i> {currentItem.rating}
                                </span>
                            </motion.div>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-gray-400 text-xs md:text-sm leading-relaxed line-clamp-3 font-medium max-w-xl"
                            >
                                {currentItem.description}
                            </motion.p>

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="flex items-center gap-4 pt-6"
                            >
                                <Link
                                    href={`/watch/${currentItem.id}`}
                                    className="bg-gradient-to-r from-brand-primary to-fuchsia-500 text-[#0f1011] px-8 py-3 rounded-full font-black uppercase tracking-widest text-sm hover:scale-105 hover:shadow-[0_0_30px_rgba(183,148,244,0.5)] transition-all flex items-center gap-2 shadow-lg group"
                                >
                                    <i className="fa-solid fa-play group-hover:animate-pulse"></i> Watch Now
                                </Link>
                                <Link
                                    href={`/watch/${currentItem.id}`}
                                    className="bg-white/5 border border-white/10 text-white px-8 py-3 rounded-full font-black uppercase tracking-widest text-sm hover:bg-white hover:text-black hover:border-white transition-all flex items-center gap-2 backdrop-blur-md"
                                >
                                    Details <i className="fa-solid fa-chevron-right text-xs"></i>
                                </Link>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* NEW: Edge-Reveal Navigation Arrows */}
            <AnimatePresence>
                {paused && (
                    <>
                        <motion.button
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onClick={handlePrev}
                            className="absolute left-6 top-1/2 -translate-y-1/2 z-30 w-16 h-16 rounded-full bg-black/40 backdrop-blur-2xl border border-white/10 flex items-center justify-center text-white/50 hover:text-brand-primary hover:border-brand-primary transition-all shadow-2xl group/arrow"
                        >
                            <i className="fa-solid fa-chevron-left text-2xl group-hover/arrow:scale-110 transition-transform"></i>
                        </motion.button>
                        <motion.button
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onClick={handleNext}
                            className="absolute right-6 top-1/2 -translate-y-1/2 z-30 w-16 h-16 rounded-full bg-black/40 backdrop-blur-2xl border border-white/10 flex items-center justify-center text-white/50 hover:text-brand-primary hover:border-brand-primary transition-all shadow-2xl group/arrow"
                        >
                            <i className="fa-solid fa-chevron-right text-2xl group-hover/arrow:scale-110 transition-transform"></i>
                        </motion.button>
                    </>
                )}
            </AnimatePresence>

            {/* Global Spotlight Progress Bar */}
            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-white/5 flex gap-1 px-1">
                {items.map((_, idx) => (
                    <div key={idx} className="flex-1 h-full rounded-full overflow-hidden bg-white/5">
                        <motion.div
                            className="h-full bg-brand-primary shadow-[0_0_15px_rgba(183,148,244,0.5)]"
                            initial={{ width: 0 }}
                            animate={{ width: currentIndex === idx ? '100%' : currentIndex > idx ? '100%' : '0%' }}
                            transition={{ duration: currentIndex === idx ? 6 : 0.3, ease: 'linear' }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SpotlightSlider;
