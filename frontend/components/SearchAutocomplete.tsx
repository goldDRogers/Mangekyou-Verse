"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { jikanService } from '../services/jikanService'; // Use real Jikan service
import { Anime } from '../types';
import { Star, ArrowUpRight } from 'lucide-react';

export default function SearchAutocomplete() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Anime[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const [activeIndex, setActiveIndex] = useState(-1);

    // Debounce for API calls
    const [debouncedQuery, setDebouncedQuery] = useState(query);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(query);
        }, 500); // 500ms debounce
        return () => clearTimeout(handler);
    }, [query]);

    useEffect(() => {
        const fetchResults = async () => {
            if (debouncedQuery.trim().length < 3) {
                setResults([]);
                setIsOpen(false);
                return;
            }
            setIsLoading(true);
            try {
                const data = await jikanService.searchAnime(debouncedQuery);
                setResults(data.slice(0, 10)); // Limit to 10 suggestions
                setIsOpen(true);
                setActiveIndex(-1);
            } catch (error) {
                console.error("Search failed", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchResults();
    }, [debouncedQuery]);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (activeIndex >= 0 && results[activeIndex]) {
            router.push(`/watch/${results[activeIndex].id}`);
            setIsOpen(false);
            setQuery('');
            return;
        }
        if (query.trim()) {
            setIsOpen(false);
            router.push(`/search?q=${query}`);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
            setQuery('');
            return;
        }

        if (!isOpen || results.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === 'Enter') {
            if (activeIndex >= 0 && results[activeIndex]) {
                e.preventDefault();
                router.push(`/watch/${results[activeIndex].id}`);
                setIsOpen(false);
                setQuery('');
            }
        }
    };

    return (
        <div ref={wrapperRef} className="relative w-full max-w-sm lg:max-w-md">
            <form onSubmit={handleSearchSubmit} className="relative group/search">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <i className="fa-solid fa-magnifying-glass text-gray-500 group-focus-within/search:text-brand-primary transition-colors text-sm"></i>
                </div>
                <input
                    type="text"
                    className="block w-full pl-12 pr-12 py-3 bg-[#16171a] border border-white/5 rounded-2xl text-[13px] font-bold text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 transition-all shadow-xl"
                    placeholder="Quick Search..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        if (e.target.value.length === 0) {
                            setIsOpen(false);
                            setResults([]);
                        }
                    }}
                    onFocus={() => {
                        if (results.length > 0) setIsOpen(true);
                    }}
                    onKeyDown={handleKeyDown}
                    suppressHydrationWarning
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center gap-2">
                    {isLoading && <i className="fa-solid fa-circle-notch fa-spin text-brand-primary text-xs"></i>}
                    {!isLoading && query && (
                        <button
                            type="button"
                            onClick={() => { setQuery(''); setIsOpen(false); }}
                            className="text-gray-500 hover:text-white transition-colors"
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    )}
                    <span className="hidden lg:block text-[10px] font-black bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-gray-600 uppercase tracking-tighter">/</span>
                </div>
            </form>

            <AnimatePresence>
                {isOpen && results.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        className="absolute mt-4 w-[120%] -left-[10%] bg-[#121315]/95 backdrop-blur-2xl border border-white/10 rounded-[24px] shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden z-50"
                    >
                        <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Global Suggestions</span>
                        </div>
                        <div className="max-h-[420px] overflow-y-auto custom-scrollbar p-2">
                            {results.map((anime, index) => (
                                <Link
                                    key={anime.id}
                                    href={`/watch/${anime.id}`}
                                    onClick={() => {
                                        setIsOpen(false);
                                        setQuery('');
                                    }}
                                    className={`flex items-center gap-4 p-3 rounded-xl transition-all group/item ${index === activeIndex ? 'bg-brand-primary/10 border-brand-primary/20 border' : 'hover:bg-white/5 border border-transparent'}`}
                                >
                                    <div className="w-12 h-16 bg-gray-900 rounded-lg overflow-hidden flex-shrink-0 shadow-lg group-hover/item:scale-105 transition-transform duration-500">
                                        <img src={anime.thumbnail} alt={anime.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`text-xs font-black truncate transition-colors ${index === activeIndex ? 'text-brand-primary' : 'text-gray-200 group-hover/item:text-brand-primary'}`}>
                                            {anime.title}
                                        </h4>
                                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                            <span className="text-[10px] font-black text-brand-primary/80 uppercase tracking-widest bg-brand-primary/10 px-1.5 py-0.5 rounded leading-none">{anime.type}</span>
                                            <span className="text-[10px] font-bold text-gray-500 uppercase">{anime.year}</span>
                                            <span className="text-[10px] font-bold text-gray-500 bg-white/5 px-1.5 py-0.5 rounded">{anime.status}</span>
                                        </div>
                                    </div>
                                    <div className={`flex flex-col items-end gap-1 ${index === activeIndex ? 'opacity-100' : 'opacity-40 group-hover/item:opacity-100'} transition-opacity`}>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-2.5 h-2.5 text-brand-primary fill-brand-primary" />
                                            <span className="text-[10px] font-black text-white">{anime.rating}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        <div className="p-3 bg-black/40 text-center border-t border-white/10">
                            <button
                                onClick={() => router.push(`/search?q=${query}`)}
                                className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] hover:text-white transition-colors flex items-center justify-center gap-2 w-full"
                            >
                                View full results for "{query}" <ArrowUpRight className="w-3 h-3" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
