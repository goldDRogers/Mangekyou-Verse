import React, { useEffect, useState } from 'react';
import { getWatchlist } from '../services/watchlistService';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Watchlist: React.FC = () => {
    const [watchlist, setWatchlist] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchWatchlist = async () => {
            try {
                const data = await getWatchlist();
                setWatchlist(data);
            } catch (err) {
                console.error("Failed to fetch watchlist");
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchWatchlist();
        else setLoading(false);
    }, [user]);

    if (!user) return <div className="min-h-screen bg-[#0f1011] text-white p-24 flex items-center justify-center font-bold text-xl uppercase tracking-widest">Please login to view your watchlist</div>;
    if (loading) return <div className="min-h-screen bg-[#0f1011] text-white p-24 flex items-center justify-center font-bold text-xl uppercase tracking-widest animate-pulse">Loading Collection...</div>;

    return (
        <div className="min-h-screen bg-[#0f1011] pt-32 px-4 md:px-12 pb-24">
            <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-12">My <span className="text-brand-primary">Collection</span></h1>

            {watchlist.length === 0 ? (
                <div className="text-gray-500 font-bold text-xl text-center py-20 border-2 border-dashed border-gray-800 rounded-3xl">
                    <p>Your node is empty.</p>
                    <Link to="/" className="text-brand-primary mt-4 inline-block hover:underline">Discover Anime</Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
                    {watchlist.map(item => (
                        <Link to={`/watch/${item.anime_id}`} key={item._id} className="group relative block aspect-[2/3] rounded-2xl overflow-hidden bg-gray-900 border border-white/10 hover:border-brand-primary transition-all shadow-xl">
                            <img src={item.anime_poster} alt={item.anime_title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                                <h3 className="text-white font-black text-sm uppercase leading-tight line-clamp-2">{item.anime_title}</h3>
                                <p className="text-brand-primary text-[10px] font-bold uppercase mt-2 bg-brand-primary/10 inline-block px-2 py-1 rounded border border-brand-primary/30 w-max">{item.status}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Watchlist;
