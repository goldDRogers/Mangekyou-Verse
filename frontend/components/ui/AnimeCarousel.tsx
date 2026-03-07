"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AnimeCarouselProps {
    children: React.ReactNode[];
    title?: string;
    icon?: React.ReactNode;
    viewAllLink?: string;
}

export default function AnimeCarousel({ children, title, icon, viewAllLink }: AnimeCarouselProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: 'start',
        containScroll: 'trimSnaps',
        dragFree: true,
        skipSnaps: false
    });

    const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
    const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [isHoverLeft, setIsHoverLeft] = useState(false);
    const [isHoverRight, setIsHoverRight] = useState(false);

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

    const onScroll = useCallback(() => {
        if (!emblaApi) return;
        const progress = Math.max(0, Math.min(1, emblaApi.scrollProgress()));
        setScrollProgress(progress * 100);
    }, [emblaApi]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setPrevBtnEnabled(emblaApi.canScrollPrev());
        setNextBtnEnabled(emblaApi.canScrollNext());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        onScroll();
        emblaApi.on('select', onSelect);
        emblaApi.on('scroll', onScroll);
        emblaApi.on('reInit', onSelect);
    }, [emblaApi, onSelect, onScroll]);

    return (
        <div className="group/carousel-root relative py-8">
            {/* Header Section */}
            {(title || icon) && (
                <div className="flex items-center justify-between mb-8 px-4 md:px-12">
                    <div className="flex items-center gap-4">
                        {icon && <div className="text-brand-primary">{icon}</div>}
                        {title && (
                            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">
                                {title}
                            </h2>
                        )}
                        <div className="h-0.5 w-12 bg-white/10 ml-2 hidden md:block" />
                    </div>
                    {viewAllLink && (
                        <a
                            href={viewAllLink}
                            className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-brand-primary transition-colors"
                        >
                            View All +
                        </a>
                    )}
                </div>
            )}

            {/* Main Carousel Wrapper */}
            <div className="relative isolate">
                {/* Edge Reveal Target Zones */}
                <div
                    className="absolute left-0 top-0 bottom-0 w-20 z-40 cursor-w-resize hidden md:block"
                    onMouseEnter={() => setIsHoverLeft(true)}
                    onMouseLeave={() => setIsHoverLeft(false)}
                />
                <div
                    className="absolute right-0 top-0 bottom-0 w-20 z-40 cursor-e-resize hidden md:block"
                    onMouseEnter={() => setIsHoverRight(true)}
                    onMouseLeave={() => setIsHoverRight(false)}
                />

                {/* Navigation Arrows - CURSOR AWARE REVEAL */}
                <AnimatePresence>
                    {isHoverLeft && prevBtnEnabled && (
                        <motion.button
                            initial={{ opacity: 0, x: -15 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -15 }}
                            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                            onClick={scrollPrev}
                            onMouseEnter={() => setIsHoverLeft(true)}
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-16 h-16 rounded-full bg-black/40 backdrop-blur-3xl border border-white/5 flex items-center justify-center text-gray-400 hover:text-brand-primary hover:border-brand-primary/50 transition-all shadow-2xl group/arrow"
                            aria-label="Previous slide"
                        >
                            <div className="absolute inset-0 rounded-full bg-brand-primary/0 group-hover/arrow:bg-brand-primary/10 transition-colors shadow-[inset_0_0_20px_rgba(183,148,244,0)] group-hover/arrow:shadow-[inset_0_0_20px_rgba(183,148,244,0.1)]" />
                            <ChevronLeft className="w-9 h-9 group-hover/arrow:scale-110 transition-transform duration-500" />
                        </motion.button>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {isHoverRight && nextBtnEnabled && (
                        <motion.button
                            initial={{ opacity: 0, x: 15 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 15 }}
                            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                            onClick={scrollNext}
                            onMouseEnter={() => setIsHoverRight(true)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-16 h-16 rounded-full bg-black/40 backdrop-blur-3xl border border-white/5 flex items-center justify-center text-gray-400 hover:text-brand-primary hover:border-brand-primary/50 transition-all shadow-2xl group/arrow"
                            aria-label="Next slide"
                        >
                            <div className="absolute inset-0 rounded-full bg-brand-primary/0 group-hover/arrow:bg-brand-primary/10 transition-colors shadow-[inset_0_0_20px_rgba(183,148,244,0)] group-hover/arrow:shadow-[inset_0_0_20px_rgba(183,148,244,0.1)]" />
                            <ChevronRight className="w-9 h-9 group-hover/arrow:scale-110 transition-transform duration-500" />
                        </motion.button>
                    )}
                </AnimatePresence>

                {/* Embla Viewport */}
                <div
                    className="overflow-hidden cursor-grab active:cursor-grabbing px-4 md:px-12"
                    ref={emblaRef}
                >
                    <div className="flex gap-4 md:gap-6 py-4">
                        {children.map((child, index) => (
                            <div key={index} className="flex-[0_0_auto] min-w-0">
                                {child}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Progress Indicator */}
                <div className="mt-8 px-4 md:px-12">
                    <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden relative">
                        <motion.div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-brand-primary to-purple-400 shadow-[0_0_10px_rgba(183,148,244,0.5)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${scrollProgress}%` }}
                            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
