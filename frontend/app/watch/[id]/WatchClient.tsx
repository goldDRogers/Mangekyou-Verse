"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { jikanService } from '@/services/jikanService';
import { anilistService, AniListData } from '@/services/anilistService';
import { kitsuService } from '@/services/kitsuService';
import { historyService, watchlistService } from '@/services/watchlistService';
import { Anime } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import AnimeCard from '@/components/AnimeCard';
import { Skeleton, EpisodeListSkeleton, AnimeCardSkeleton } from '@/components/ui/Skeleton';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Info, ExternalLink, List, Tags, Users, Building, Link as LinkIcon, Star, Play, ChevronRight, AlertCircle } from 'lucide-react';

interface WatchClientProps {
    id: string;
    initialData?: Anime | null;
}

export default function WatchClient({ id, initialData }: WatchClientProps) {
    const searchParams = useSearchParams();
    const initialEp = searchParams?.get('ep') ? parseInt(searchParams.get('ep')!) : 1;

    const router = useRouter();
    const [anime, setAnime] = useState<Anime | null>(initialData || null);
    const [aniListData, setAniListData] = useState<AniListData | null>(null);
    const [recommendations, setRecommendations] = useState<Anime[]>([]);
    const [loading, setLoading] = useState(!initialData);
    const [error, setError] = useState(false);
    const [inWatchlist, setInWatchlist] = useState(false);
    const [visibleEpisodes, setVisibleEpisodes] = useState(24);

    const fetchData = async () => {
        if (!id) return;
        setError(false);
        if (!initialData) setLoading(true);

        try {
            // Fetch real data from Jikan if not provided
            let data = initialData;
            if (!data) {
                data = await jikanService.getAnimeDetails(id);
            }

            if (!data) {
                router.push('/');
                return;
            }

            // Kitsu Fallback for description if missing
            if (!data.description || data.description === 'No description available.') {
                const kitsuData = await kitsuService.getAnimeByTitle(data.title);
                if (kitsuData?.description) {
                    data.description = kitsuData.description;
                }
            }

            setAnime(data);

            // Parallel fetch for AniList and Recommendations
            const [aniList, recs, genreRecs] = await Promise.all([
                data.malId ? anilistService.getAnimeByMALId(data.malId) : Promise.resolve(null),
                jikanService.getRecommendations(id),
                jikanService.getGenreBasedSimilarAnime(data.genres, id)
            ]);

            setAniListData(aniList);

            // Smart Ranking Algorithm
            const combinedRecs = [...recs, ...genreRecs];
            const uniqueRecsList = Array.from(new Map(combinedRecs.map(item => [item.id, item])).values());

            const currentGenres = new Set(data.genres);
            const rankedRecs = uniqueRecsList.map(rec => {
                let score = 0;
                // Shared genres weight
                rec.genres.forEach(g => {
                    if (currentGenres.has(g)) score += 10;
                });
                // Rating weight
                score += (rec.rating || 0) * 2;
                // Popularity weight (estimated from popularity vs rank)
                // Smaller rank means more popular
                if (rec.popularity) score += Math.max(0, 100 - (rec.popularity / 100));

                return { ...rec, discoveryScore: score };
            }).sort((a, b) => b.discoveryScore - a.discoveryScore);

            setRecommendations(rankedRecs);

            const isSaved = await watchlistService.isInWatchlist(id);
            setInWatchlist(isSaved);

            // Log history on visit
            await historyService.updateProgress(id, '1', 0);
        } catch (err) {
            console.error("Failed to fetch anime details", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id, initialData]);

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

    const [redirecting, setRedirecting] = useState<{ ep: number; url: string } | null>(null);
    const [countdown, setCountdown] = useState(3);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (redirecting && countdown > 0) {
            timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
        } else if (redirecting && countdown === 0) {
            window.open(redirecting.url, '_blank', 'noopener,noreferrer');
            setRedirecting(null);
            setCountdown(3);
        }
        return () => clearTimeout(timer);
    }, [redirecting, countdown]);

    const handleRedirect = (ep: number) => {
        if (!anime) return;
        const searchQuery = encodeURIComponent(`${anime.title} episode ${ep}`);
        const url = `https://hianime.to/search?keyword=${searchQuery}`;
        setRedirecting({ ep, url });
        setCountdown(3);
    };

    if (loading && !anime) {
        return (
            <div className="container mx-auto px-4 py-8 space-y-8">
                <div className="flex items-center gap-2 mb-6">
                    <Skeleton className="h-4 w-12" />
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                    <Skeleton className="h-4 w-24" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <Skeleton className="aspect-video w-full rounded-2xl" />
                        <div className="space-y-4">
                            <Skeleton className="h-10 w-3/4" />
                            <div className="flex gap-4">
                                <Skeleton className="h-6 w-20" />
                                <Skeleton className="h-6 w-20" />
                                <Skeleton className="h-6 w-20" />
                            </div>
                            <Skeleton className="h-32 w-full" />
                        </div>
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-10 w-full rounded-full" />
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-1/2" />
                            <div className="grid grid-cols-4 gap-2">
                                {[...Array(12)].map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-20">
                <ErrorMessage onRetry={fetchData} />
            </div>
        );
    }

    if (!anime) return null;

    return (
        <div className="min-h-screen bg-[#0f1011] pb-20">
            <AnimatePresence>
                {redirecting && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-6"
                    >
                        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setRedirecting(null)} />
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="relative bg-[#121315] border border-white/10 p-8 md:p-12 rounded-[2.5rem] max-w-lg w-full text-center shadow-2xl"
                        >
                            <div className="w-20 h-20 rounded-full bg-brand-primary/10 border-2 border-brand-primary flex items-center justify-center text-brand-primary mx-auto mb-8 relative">
                                <span className="text-3xl font-black">{countdown}</span>
                                <svg className="absolute inset-0 w-full h-full -rotate-90">
                                    <circle
                                        cx="40"
                                        cy="40"
                                        r="38"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="transparent"
                                        className="opacity-20"
                                    />
                                    <motion.circle
                                        cx="40"
                                        cy="40"
                                        r="38"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="transparent"
                                        strokeDasharray="239"
                                        animate={{ strokeDashoffset: [0, 239] }}
                                        transition={{ duration: 3, ease: "linear" }}
                                    />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Leaving Mangekyou Verse</h3>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest leading-relaxed mb-8">
                                You are being redirected to a third-party site to watch <span className="text-brand-primary">{anime.title}</span> Episode {redirecting.ep}.
                            </p>
                            <div className="p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10 mb-8">
                                <p className="text-[10px] text-brand-primary/60 font-black uppercase tracking-widest leading-loose">
                                    ⚠️ LEGAL DISCLAIMER: We do not host or control the content on external sites. Please ensure you are browsing safely.
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setRedirecting(null)}
                                    className="flex-1 px-8 py-4 rounded-full bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        window.open(redirecting.url, '_blank', 'noopener,noreferrer');
                                        setRedirecting(null);
                                    }}
                                    className="flex-1 px-8 py-4 rounded-full bg-brand-primary text-black text-xs font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-brand-primary/20"
                                >
                                    Proceed Now
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Backdrop Hero */}
            <div className="relative h-[40vh] md:h-[60vh] w-full overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src={aniListData?.trailer?.thumbnail || anime.gallery?.[0] || anime.thumbnail}
                        alt=""
                        className="w-full h-full object-cover opacity-30 blur-sm scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f1011] via-[#0f1011]/50 to-transparent" />
                </div>

                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-10">
                    <div className="max-w-7xl mx-auto">
                        <nav className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 mb-6">
                            <a href="/" className="hover:text-brand-primary transition-colors">Home</a>
                            <ChevronRight className="w-3 h-3" />
                            <span className="text-gray-600">{anime.title}</span>
                        </nav>
                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none mb-4"
                        >
                            {anime.title}
                        </motion.h1>
                        <div className="flex flex-wrap items-center gap-4 text-[11px] md:text-xs font-bold text-gray-300 uppercase tracking-widest">
                            <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-brand-primary fill-brand-primary" /> {anime.rating}</span>
                            <span className="w-1.5 h-1.5 bg-white/20 rounded-full" />
                            <span>{anime.type}</span>
                            <span className="w-1.5 h-1.5 bg-white/20 rounded-full" />
                            <span>{anime.status}</span>
                            <span className="w-1.5 h-1.5 bg-white/20 rounded-full" />
                            <span>{anime.episodes} EP</span>
                            <span className="w-1.5 h-1.5 bg-white/20 rounded-full" />
                            <span>{anime.year || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 md:px-12 -mt-12 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">

                    {/* Main Content Area */}
                    <div className="lg:col-span-3 space-y-12">

                        {/* Player / Watch Section */}
                        <section className="bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
                            <div className="aspect-video relative group">
                                <img
                                    src={anime.gallery?.[0] || anime.thumbnail}
                                    alt={anime.title}
                                    className="w-full h-full object-cover opacity-50"
                                />
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 p-8 text-center">
                                    <div className="w-20 h-20 rounded-full bg-brand-primary flex items-center justify-center text-black mb-6 shadow-[0_0_50px_rgba(183,148,244,0.4)] group-hover:scale-110 transition-transform cursor-pointer" onClick={() => handleRedirect(1)}>
                                        <Play className="w-8 h-8 fill-black ml-1" />
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter mb-2">Ready to watch?</h3>
                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6">We index content from external nodes for your convenience.</p>
                                    <button
                                        onClick={() => handleRedirect(1)}
                                        className="bg-gradient-to-r from-brand-primary via-purple-500 to-fuchsia-600 text-white px-10 py-4 rounded-full font-black uppercase tracking-[0.2em] text-sm hover:scale-105 hover:shadow-[0_0_50px_rgba(183,148,244,0.6)] transition-all flex items-center gap-3 shadow-2xl"
                                    >
                                        Watch Now <Play className="w-5 h-5 fill-white animate-pulse" />
                                    </button>
                                </div>
                            </div>

                            {/* Legal Disclaimer Box */}
                            <div className="p-6 bg-brand-primary/5 border-t border-white/5 flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-brand-primary/20 flex items-center justify-center flex-shrink-0 text-brand-primary">
                                    <Info className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-[11px] font-black text-brand-primary uppercase tracking-[0.2em] mb-1">Legal Compliance Notice</h4>
                                    <p className="text-[10px] text-gray-500 font-bold leading-relaxed uppercase tracking-wider">
                                        Mangekyou Verse does not host, stream, or embed any copyrighted video files. Clicking watch will securely redirect you to verified third-party platforms.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Synopsis & Metadata */}
                        <section className="space-y-8">
                            <div className="flex flex-wrap gap-4">
                                <button
                                    onClick={handleToggleWatchlist}
                                    className={`flex items-center gap-2 px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-xl ${inWatchlist
                                        ? 'bg-red-500 text-white shadow-red-500/20'
                                        : 'bg-gradient-to-r from-indigo-500 to-brand-primary text-white hover:scale-105'
                                        }`}
                                >
                                    <List className="w-4 h-4" />
                                    {inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                                </button>
                                <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-gray-400">
                                    <Users className="w-4 h-4 text-brand-primary" />
                                    {anime.rating || 'N/A'} ({anime.popularity || '0'} People)
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-6 bg-brand-primary rounded-full" />
                                    <h2 className="text-xl font-black text-white uppercase tracking-tighter">Synopsis</h2>
                                </div>
                                <p className="text-gray-400 text-sm md:text-base leading-relaxed font-medium">
                                    {anime.description}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-2">
                                {anime.genres.map(genre => (
                                    <span key={genre} className="px-4 py-2 rounded-xl bg-[#1c1d21] border border-white/5 text-[10px] font-black text-brand-primary uppercase tracking-widest hover:border-brand-primary/50 transition-colors cursor-default">
                                        {genre}
                                    </span>
                                ))}
                            </div>
                        </section>

                        {/* Episodes Grid */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-6 bg-brand-secondary rounded-full" />
                                    <h2 className="text-xl font-black text-white uppercase tracking-tighter">Episodes</h2>
                                </div>
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total: {anime.episodes} Episodes</span>
                            </div>

                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-3">
                                {[...Array(Math.min(visibleEpisodes, anime.episodes || 0))].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleRedirect(i + 1)}
                                        className="aspect-square flex items-center justify-center rounded-xl bg-[#1c1d21] border border-white/5 text-xs font-black text-gray-500 hover:bg-brand-primary hover:text-black hover:border-brand-primary transition-all group"
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>

                            {(anime.episodes || 0) > visibleEpisodes && (
                                <div className="flex justify-center pt-4">
                                    <button
                                        onClick={() => setVisibleEpisodes(prev => prev + 48)}
                                        className="px-8 py-3 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                                    >
                                        Load More Episodes <ChevronRight className="w-3 h-3 inline ml-1" />
                                    </button>
                                </div>
                            )}
                        </section>

                        {/* Relations Section (from AniList) */}
                        {aniListData && aniListData.relations && aniListData.relations.length > 0 && (
                            <section className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-6 bg-purple-500 rounded-full" />
                                    <h2 className="text-xl font-black text-white uppercase tracking-tighter">Related Content</h2>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {aniListData.relations.map((relation) => (
                                        <motion.div
                                            key={relation.id}
                                            whileHover={{ y: -5 }}
                                            className="relative group rounded-2xl overflow-hidden aspect-[16/9] border border-white/5"
                                        >
                                            <img src={relation.coverImage} alt={relation.title} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                                            <div className="absolute bottom-3 left-3 right-3">
                                                <span className="text-[8px] font-black text-brand-primary uppercase tracking-widest bg-black/60 px-2 py-0.5 rounded-md mb-1 inline-block">{relation.type}</span>
                                                <h4 className="text-[10px] font-bold text-white line-clamp-1 uppercase">{relation.title}</h4>
                                            </div>
                                            <a href={`/watch/${relation.id}`} className="absolute inset-0 z-10" />
                                        </motion.div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Recommendations */}
                        <section className="space-y-8 pt-12 border-t border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-1 h-6 bg-brand-primary rounded-full" />
                                <h2 className="text-xl font-black text-white uppercase tracking-tighter">You May Also Like</h2>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                                {recommendations.slice(0, 8).map(rec => (
                                    <AnimeCard key={rec.id} anime={rec} size="sm" />
                                ))}
                                {recommendations.length === 0 && <AnimeCardSkeleton count={4} />}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Area */}
                    <div className="lg:col-span-1 space-y-12">

                        {/* More Info Sidebar Box */}
                        <div className="bg-[#121315] p-8 rounded-[2.5rem] border border-white/5 space-y-8">
                            <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] pb-4 border-b border-white/10">Project Details</h3>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <Building className="w-4 h-4 text-brand-primary mt-1" />
                                    <div>
                                        <span className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Studios</span>
                                        <div className="flex flex-wrap gap-2">
                                            {aniListData?.studios?.map(s => (
                                                <span key={s.id} className="text-xs font-bold text-white">{s.name}</span>
                                            )) || <span className="text-xs font-bold text-white">N/A</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <Tags className="w-4 h-4 text-brand-primary mt-1" />
                                    <div>
                                        <span className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Genres</span>
                                        <p className="text-xs font-bold text-white">{anime.genres.join(', ')}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <Star className="w-4 h-4 text-brand-primary mt-1" />
                                    <div>
                                        <span className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Rating</span>
                                        <p className="text-xs font-bold text-white">{anime.rating} / 10</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Top Characters (AniList) */}
                        {aniListData && aniListData.characters && aniListData.characters.length > 0 && (
                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] pb-4 border-b border-white/10 flex items-center justify-between">
                                    Main Cast
                                    <LinkIcon className="w-3 h-3 text-gray-600" />
                                </h3>
                                <div className="space-y-4">
                                    {aniListData.characters.slice(0, 6).map((char) => (
                                        <div key={char.id} className="flex items-center gap-4 group cursor-default">
                                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/5 group-hover:border-brand-primary/50 transition-all">
                                                <img src={char.image} alt={char.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-[11px] font-black text-gray-200 uppercase truncate">{char.name}</h4>
                                                <p className="text-[10px] font-bold text-gray-500 uppercase truncate">{char.role} • {char.voiceActor?.name || 'Unknown'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Share / Social Buttons */}
                        <div className="flex gap-2">
                            <button className="flex-1 bg-white/5 hover:bg-brand-primary hover:text-black py-4 rounded-2xl transition-all border border-white/5 flex items-center justify-center">
                                <i className="fa-brands fa-discord"></i>
                            </button>
                            <button className="flex-1 bg-white/5 hover:bg-brand-primary hover:text-black py-4 rounded-2xl transition-all border border-white/5 flex items-center justify-center">
                                <i className="fa-brands fa-twitter"></i>
                            </button>
                            <button className="flex-1 bg-white/5 hover:bg-brand-primary hover:text-black py-4 rounded-2xl transition-all border border-white/5 flex items-center justify-center">
                                <i className="fa-solid fa-share-nodes"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
