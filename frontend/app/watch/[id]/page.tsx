"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { jikanService } from '@/services/jikanService';
import { anilistService, AniListData } from '@/services/anilistService';
import { kitsuService } from '@/services/kitsuService';
import { historyService, watchlistService } from '@/services/watchlistService';
import { Anime } from '@/types';
import { motion } from 'framer-motion';
import AnimeCard from '@/components/AnimeCard';
import { Skeleton, EpisodeListSkeleton, AnimeCardSkeleton } from '@/components/ui/Skeleton';
import { Info, ExternalLink, List, Tags, Users, Building, Link as LinkIcon, Star, Play, ChevronRight } from 'lucide-react';

export default function WatchPage() {
    const params = useParams();
    const id = params ? params.id as string : '';
    const searchParams = useSearchParams();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const initialEp = searchParams?.get('ep') ? parseInt(searchParams.get('ep')!) : 1;

    const router = useRouter();
    const [anime, setAnime] = useState<Anime | null>(null);
    const [aniListData, setAniListData] = useState<AniListData | null>(null);
    const [recommendations, setRecommendations] = useState<Anime[]>([]);
    const [loading, setLoading] = useState(true);
    const [inWatchlist, setInWatchlist] = useState(false);
    const [visibleEpisodes, setVisibleEpisodes] = useState(24);

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch real data from Jikan
                const data = await jikanService.getAnimeDetails(id);

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
                const [aniList, recs] = await Promise.all([
                    data.malId ? anilistService.getAnimeByMALId(data.malId) : Promise.resolve(null),
                    jikanService.getRecommendations(id)
                ]);

                setAniListData(aniList);
                setRecommendations(recs);

                const isSaved = await watchlistService.isInWatchlist(id);
                setInWatchlist(isSaved);

                // Log history on visit
                await historyService.updateProgress(id, '1', 0);
            } catch (err) {
                console.error("Failed to fetch anime details", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, router]);

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

    const handleRedirect = (ep: number) => {
        if (!anime) return;
        const searchQuery = encodeURIComponent(`${anime.title} episode ${ep}`);
        const url = `https://hianime.to/search?keyword=${searchQuery}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 space-y-8">
                <div className="flex items-center gap-2 mb-6">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-3 w-4" />
                    <Skeleton className="h-4 w-10" />
                    <Skeleton className="h-3 w-4" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-3 space-y-8">
                        <Skeleton className="aspect-video w-full rounded-2xl" />
                        <div className="bg-white/5 border border-white/5 rounded-3xl p-8 flex flex-col md:flex-row gap-8">
                            <Skeleton className="w-40 h-60 rounded-xl flex-shrink-0" />
                            <div className="flex-1 space-y-4">
                                <div className="flex gap-2">
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                    <Skeleton className="h-6 w-12 rounded-full" />
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                </div>
                                <Skeleton className="h-10 w-3/4 rounded-lg" />
                                <Skeleton className="h-24 w-full rounded-lg" />
                                <Skeleton className="h-12 w-40 rounded-full" />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-8">
                        <div className="bg-white/5 border border-white/5 rounded-3xl h-[600px] p-6">
                            <Skeleton className="h-6 w-1/2 mb-6 rounded" />
                            <EpisodeListSkeleton count={8} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!anime) return null;

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-6 uppercase tracking-widest font-black">
                <button onClick={() => router.push('/')} className="hover:text-brand-primary transition-colors flex items-center gap-1.5 group">
                    <Play className="w-2.5 h-2.5 group-hover:fill-brand-primary transition-all" /> Home
                </button>
                <ChevronRight className="w-2 h-2 opacity-50" />
                <span className="text-gray-400">{anime.type}</span>
                <ChevronRight className="w-2 h-2 opacity-50" />
                <span className="text-brand-primary line-clamp-1">{anime.title}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Content Column */}
                <div className="lg:col-span-3 space-y-8">
                    {/* "Player" / Redirect Card */}
                    <div className="aspect-video bg-black rounded-3xl overflow-hidden relative shadow-2xl border border-white/10 group">
                        <img
                            src={anime.gallery ? anime.gallery[0] || anime.thumbnail : anime.thumbnail}
                            className="w-full h-full object-cover opacity-20 group-hover:scale-110 transition-transform duration-[2s] blur-[2px]"
                            alt="Background"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                className="mb-8"
                            >
                                <div className="w-24 h-24 rounded-full bg-brand-primary/10 flex items-center justify-center mb-6 ring-1 ring-brand-primary/30 backdrop-blur-md">
                                    <ExternalLink className="w-10 h-10 text-brand-primary animate-pulse" />
                                </div>
                                <h3 className="text-3xl md:text-4xl font-black uppercase text-white mb-3 tracking-tight">
                                    Continue Watching
                                </h3>
                                <div className="h-1 w-20 bg-brand-primary mx-auto mb-4 rounded-full" />
                            </motion.div>

                            <p className="text-gray-300 text-sm md:text-base max-w-lg mb-10 leading-relaxed font-medium bg-black/40 backdrop-blur-sm p-4 rounded-2xl border border-white/5">
                                <Info className="w-4 h-4 inline-block mr-2 text-brand-primary" />
                                <strong>Legal Compliance Notice:</strong> Mangekyou Verse does not host or store any video files on its servers. You will be redirected to a verified third-party provider for streaming.
                            </p>

                            <button
                                onClick={() => handleRedirect(1)}
                                className="group relative bg-brand-primary text-[#0f1011] px-12 py-5 rounded-full font-black uppercase tracking-[0.2em] text-sm hover:bg-white transition-all shadow-[0_0_50px_rgba(183,148,244,0.3)] hover:shadow-[0_0_70px_rgba(183,148,244,0.5)] flex items-center gap-4 overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center gap-3">
                                    Watch on External Site <ExternalLink className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </span>
                                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            </button>
                        </div>
                    </div>

                    {/* Rich Info Section */}
                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 blur-[100px] -z-10 rounded-full" />

                        <div className="flex flex-col md:flex-row gap-8 md:gap-12 relative z-10">
                            <div className="w-48 h-72 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex-shrink-0 mx-auto md:mx-0 border border-white/10">
                                <img src={anime.thumbnail} className="w-full h-full object-cover" alt={anime.title} />
                            </div>

                            <div className="flex-1 text-center md:text-left">
                                <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mb-6">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${anime.status === 'Ongoing' ? 'bg-green-500/20 text-green-400' : 'bg-brand-primary/20 text-brand-primary font-bold'}`}>
                                        {anime.status}
                                    </span>
                                    <span className="bg-white/10 text-gray-300 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5">
                                        {anime.type}
                                    </span>
                                    <div className="flex items-center gap-2 text-yellow-500 bg-yellow-500/10 px-4 py-1.5 rounded-full border border-yellow-500/20">
                                        <Star className="w-3 h-3 fill-yellow-500" />
                                        <span className="text-[12px] font-black">{anime.rating}</span>
                                        {anime.members && (
                                            <span className="text-[10px] text-yellow-500/70 ml-1 border-l border-yellow-500/20 pl-2">
                                                <Users className="w-2.5 h-2.5 inline-block mr-1" />
                                                {(anime.members / 1000).toFixed(1)}k
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6 leading-[1.1] text-glow">
                                    {anime.title}
                                </h1>

                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-y-4 gap-x-8 mb-8 text-[11px] font-bold uppercase tracking-widest text-gray-500">
                                    {aniListData?.studios && aniListData.studios.length > 0 && (
                                        <div className="flex items-center gap-2">
                                            <Building className="w-4 h-4 text-brand-primary" />
                                            <span className="text-gray-300">{aniListData.studios[0].name}</span>
                                        </div>
                                    )}
                                    {anime.year && (
                                        <div className="flex items-center gap-2">
                                            <Tags className="w-4 h-4 text-brand-primary" />
                                            <span className="text-gray-300">{anime.year}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <List className="w-4 h-4 text-brand-primary" />
                                        <span className="text-gray-300">{anime.episodes} Episodes</span>
                                    </div>
                                </div>

                                <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-10 max-w-3xl custom-scrollbar max-h-40 overflow-y-auto pr-4">
                                    {anime.description}
                                </p>

                                <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
                                    <button
                                        onClick={handleToggleWatchlist}
                                        className={`group px-10 py-4 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all md:w-auto w-full flex items-center justify-center gap-3 ${inWatchlist
                                            ? 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                                            : 'bg-brand-primary text-[#0f1011] hover:bg-white shadow-xl shadow-brand-primary/20'
                                            }`}
                                    >
                                        <div className={`transition-transform duration-300 group-hover:scale-125 ${inWatchlist ? 'text-green-400' : ''}`}>
                                            {inWatchlist ? <i className="fa-solid fa-check"></i> : <i className="fa-solid fa-plus"></i>}
                                        </div>
                                        {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Relations Section (AniList) */}
                    {aniListData?.relations && aniListData.relations.length > 0 && (
                        <section className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="h-8 w-1.5 bg-brand-primary rounded-full shadow-[0_0_15px_rgba(183,148,244,0.5)]" />
                                <h2 className="text-2xl font-black uppercase tracking-tighter">Related Content</h2>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                                {aniListData.relations.slice(0, 4).map((rel) => (
                                    <motion.div
                                        key={rel.id}
                                        whileHover={{ y: -5 }}
                                        className="relative group aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 bg-black cursor-pointer shadow-lg"
                                        onClick={() => rel.malId && router.push(`/watch/${rel.malId}`)}
                                    >
                                        <img src={rel.coverImage} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt={rel.title} />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                                        <div className="absolute bottom-3 left-3 right-3">
                                            <span className="block text-[8px] font-black uppercase tracking-widest text-brand-primary mb-1">{rel.type.replace('_', ' ')}</span>
                                            <p className="text-[10px] font-bold text-white line-clamp-1 uppercase leading-tight">{rel.title}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Recommendations Section */}
                    {recommendations.length > 0 && (
                        <section className="space-y-6 pt-8 border-t border-white/5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-8 w-1.5 bg-brand-primary rounded-full shadow-[0_0_15px_rgba(183,148,244,0.5)]" />
                                    <h2 className="text-2xl font-black uppercase tracking-tighter">You May Also Like</h2>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                                {recommendations.slice(0, 6).map((rec, i) => (
                                    <motion.div
                                        key={rec.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                    >
                                        <AnimeCard anime={rec} size="sm" />
                                    </motion.div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">
                    {/* Episodes List */}
                    <div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden flex flex-col h-[700px] shadow-2xl backdrop-blur-md">
                        <div className="p-8 border-b border-white/10 flex items-center justify-between flex-shrink-0 bg-white/5">
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3">
                                <List className="w-4 h-4 text-brand-primary" />
                                Episodes <span className="text-gray-500 ml-1">({anime.episodes || '?'})</span>
                            </h2>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3">
                            {anime.episodes ? (
                                <>
                                    {Array.from({ length: anime.episodes }).slice(0, visibleEpisodes).map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleRedirect(i + 1)}
                                            className="w-full flex items-center justify-between p-5 rounded-2xl bg-white/5 hover:bg-brand-primary text-gray-300 hover:text-black hover:scale-[1.02] border border-white/5 transition-all group/ep text-left shadow-lg overflow-hidden relative"
                                        >
                                            <div className="flex items-center gap-4 relative z-10">
                                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xs font-black group-hover/ep:bg-black group-hover/ep:text-white transition-colors">
                                                    {i + 1}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black uppercase tracking-wider">Episode {i + 1}</span>
                                                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest group-hover/ep:text-black/60">Watch On External</span>
                                                </div>
                                            </div>
                                            <ExternalLink className="w-4 h-4 text-gray-600 group-hover/ep:text-black transition-colors relative z-10" />
                                            {/* Hover anim bg */}
                                            <div className="absolute inset-0 bg-brand-primary opacity-0 group-hover/ep:opacity-100 transition-opacity" />
                                        </button>
                                    ))}
                                    {visibleEpisodes < anime.episodes && (
                                        <button
                                            onClick={() => setVisibleEpisodes(prev => prev + 24)}
                                            className="w-full py-5 text-xs font-black text-brand-primary uppercase tracking-[0.2em] hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/10"
                                        >
                                            View More Episodes
                                        </button>
                                    )}
                                </>
                            ) : (
                                <div className="p-12 text-center space-y-4">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto opacity-40">
                                        <List className="w-6 h-6" />
                                    </div>
                                    <p className="text-xs font-black text-gray-500 uppercase tracking-widest">
                                        No episodes available
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Characters (AniList) */}
                    {aniListData?.characters && aniListData.characters.length > 0 && (
                        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 shadow-2xl backdrop-blur-md">
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3 mb-8">
                                <Users className="w-4 h-4 text-brand-primary" />
                                Top Characters
                            </h2>
                            <div className="space-y-4">
                                {aniListData.characters.slice(0, 5).map((char) => (
                                    <div key={char.id} className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 flex-shrink-0 group-hover:scale-110 transition-transform">
                                            <img src={char.image} className="w-full h-full object-cover" alt={char.name} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-black text-white uppercase truncate">{char.name}</p>
                                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">{char.role}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Genres Card */}
                    <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 shadow-2xl backdrop-blur-md">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3 mb-8">
                            <Tags className="w-4 h-4 text-brand-primary" />
                            Categories
                        </h2>
                        <div className="flex flex-wrap gap-2.5">
                            {anime.genres.map(genre => (
                                <span key={genre} className="px-5 py-2.5 bg-white/5 rounded-2xl text-[10px] font-black text-gray-400 border border-white/10 uppercase tracking-widest hover:bg-brand-primary hover:text-black cursor-default transition-all">
                                    {genre}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
