"use client";

import React, { useEffect, useState } from 'react';
import { watchlistService } from '../../services/watchlistService';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function WatchlistPage() {
    const [watchlist, setWatchlist] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const fetchWatchlist = async () => {
            try {
                const data = await watchlistService.getWatchlist();
                setWatchlist(data);
            } catch (err) {
                console.error("Failed to fetch watchlist", err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchWatchlist();
        } else {
            // Delay redirect to allow auth check to complete if loading
            // But here loading is initially true.
            // Let's just wait for auth.
            // If user is null and not loading (auth checked), then redirect.
            // For now, we rely on AuthContext.
            setLoading(false);
        }
    }, [user]);

    if (!user && !loading) {
        return (
            <div className="min-h-screen bg-[#0f1011] text-white p-24 flex flex-col gap-4 items-center justify-center font-bold text-xl uppercase tracking-widest">
                Please login to view your watchlist
                <Link href="/login" className="bg-brand-primary text-black px-6 py-2 rounded-full text-sm">Login</Link>
            </div>
        );
    }

    if (loading) return <div className="min-h-screen bg-[#0f1011] text-white p-24 flex items-center justify-center font-bold text-xl uppercase tracking-widest animate-pulse">Loading Collection...</div>;

    return (
        <div className="min-h-screen bg-[#0f1011] pt-32 px-4 md:px-12 pb-24">
            <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-12">My <span className="text-brand-primary">Collection</span></h1>

            {watchlist.length === 0 ? (
                <div className="text-gray-500 font-bold text-xl text-center py-20 border-2 border-dashed border-gray-800 rounded-3xl">
                    <p>Your node is empty.</p>
                    <Link href="/" className="text-brand-primary mt-4 inline-block hover:underline">Discover Anime</Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
                    {watchlist.map(item => (
                        <Link href={`/watch/${item.anime_id}`} key={item.id} className="group relative block aspect-[2/3] rounded-2xl overflow-hidden bg-gray-900 border border-white/10 hover:border-brand-primary transition-all shadow-xl">
                            {/* Retrieve poster from item, assuming backend saves it. If not, use placeholder */}
                            {/* Note: The backend/schema for watchlist might have these fields. The original code assumed anime_poster. */}
                            <img src={item.poster_url || "https://placehold.co/400x600?text=No+Image"} alt={item.title || "Anime"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                                <h3 className="text-white font-black text-sm uppercase leading-tight line-clamp-2">{item.title || "Untitled"}</h3>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
