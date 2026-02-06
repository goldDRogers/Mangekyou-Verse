"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { jikanService } from '../services/jikanService'; // Use real Jikan service
import { Anime } from '../types';

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
        if (!isOpen || results.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    return (
        <div ref={wrapperRef} className="relative w-full max-w-md hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative group/search">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <i className="fa-solid fa-magnifying-glass text-gray-400 group-focus-within/search:text-brand-primary transition-colors"></i>
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-4 py-2.5 bg-[#1c1d21] border border-white/5 rounded-full text-xs font-medium text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/50 transition-all shadow-lg"
                    placeholder="Search anime..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        if (e.target.value.length === 0) setIsOpen(false);
                    }}
                    onFocus={() => {
                        if (results.length > 0) setIsOpen(true);
                    }}
                    onKeyDown={handleKeyDown}
                />
                {isLoading && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                        <i className="fa-solid fa-circle-notch fa-spin text-brand-primary text-xs"></i>
                    </div>
                )}
            </form>

            <AnimatePresence>
                {isOpen && results.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute mt-2 w-full bg-[#1c1d21] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl"
                    >
                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                            {results.map((anime, index) => (
                                <Link
                                    key={anime.id}
                                    href={`/watch/${anime.id}`}
                                    onClick={() => {
                                        setIsOpen(false);
                                        setQuery('');
                                    }}
                                    className={`flex items-center gap-3 p-3 transition-colors group/item border-b border-white/5 last:border-0 ${index === activeIndex ? 'bg-brand-primary/20 text-brand-primary' : 'hover:bg-white/5'}`}
                                >
                                    <div className="w-10 h-14 bg-gray-800 rounded-md overflow-hidden flex-shrink-0">
                                        <img src={anime.thumbnail} alt={anime.title} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`text-xs font-bold truncate transition-colors ${index === activeIndex ? 'text-brand-primary' : 'text-gray-200 group-hover/item:text-brand-primary'}`}>
                                            {anime.title}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] text-gray-500 uppercase tracking-wider">{anime.type}</span>
                                            <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                                            <span className="text-[10px] text-gray-500">{anime.status}</span>
                                        </div>
                                    </div>
                                    <div className={`text-[10px] font-bold transition-colors ${index === activeIndex ? 'text-white' : 'text-gray-500 group-hover/item:text-white'}`}>
                                        <i className="fa-solid fa-star text-brand-primary mr-1"></i>
                                        {anime.rating}
                                    </div>
                                </Link>
                            ))}
                        </div>
                        <div className="p-2 bg-black/20 text-center border-t border-white/5">
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                {activeIndex >= 0 ? 'Press Enter to select' : 'Arrow keys to navigate'}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
