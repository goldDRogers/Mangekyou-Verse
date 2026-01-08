import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SkeletonGrid } from '../components/SkeletonLoader';
import ErrorHandler from '../components/ErrorHandler';

interface WatchlistItem {
    _id: string;
    animeId: string;
    animeTitle: string;
    animePoster: string;
    status: 'watching' | 'completed' | 'plan-to-watch' | 'dropped' | 'on-hold';
    rating?: number;
    notes?: string;
}

const Watchlist: React.FC = () => {
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<string>('all');

    const fetchWatchlist = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = '#/login';
                return;
            }

            const response = await fetch('http://localhost:5000/api/watchlist', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch watchlist');
            const data = await response.json();
            setWatchlist(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWatchlist();
    }, []);

    const handleStatusChange = async (itemId: string, newStatus: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/watchlist/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                fetchWatchlist();
            }
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    const handleRemove = async (itemId: string) => {
        if (!confirm('Remove this anime from your watchlist?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/watchlist/${itemId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                fetchWatchlist();
            }
        } catch (err) {
            console.error('Error removing item:', err);
        }
    };

    const filteredWatchlist = filter === 'all'
        ? watchlist
        : watchlist.filter(item => item.status === filter);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'watching': return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'completed': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'plan-to-watch': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'dropped': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'on-hold': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
            default: return 'bg-white/10 text-white border-white/20';
        }
    };

    if (error) return <ErrorHandler message={error} retry={fetchWatchlist} />;

    return (
        <div className="min-h-screen bg-[#0f1011] py-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-6xl font-black text-white uppercase tracking-tighter mb-4">
                        My <span className="text-brand-primary">Collection</span>
                    </h1>
                    <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">
                        {loading ? 'Scanning nodes...' : `${watchlist.length} Anime in Your Node`}
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-8">
                    {['all', 'watching', 'completed', 'plan-to-watch', 'on-hold', 'dropped'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${filter === status
                                ? 'bg-brand-primary text-black border-brand-primary'
                                : 'bg-white/5 text-gray-400 border-white/10 hover:border-brand-primary/50'
                                }`}
                        >
                            {status.replace('-', ' ')}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {loading ? (
                    <SkeletonGrid count={12} />
                ) : filteredWatchlist.length === 0 ? (
                    <div className="text-center py-20">
                        <i className="fa-solid fa-heart-crack text-6xl text-gray-700 mb-4"></i>
                        <p className="text-gray-500 text-xl font-bold">No anime in this category yet</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {filteredWatchlist.map((item) => (
                            <div key={item._id} className="group relative">
                                <Link to={`/watch/${item.animeId}`} className="block">
                                    <div className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-white/5 shadow-2xl mb-3 group-hover:border-brand-primary/50 transition-all">
                                        <img
                                            src={item.animePoster || 'https://via.placeholder.com/200x300'}
                                            alt={item.animeTitle}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    </div>
                                </Link>

                                <h3 className="text-sm font-black text-white line-clamp-2 mb-2 uppercase tracking-tight">
                                    {item.animeTitle}
                                </h3>

                                <select
                                    value={item.status}
                                    onChange={(e) => handleStatusChange(item._id, e.target.value)}
                                    className={`w-full px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border mb-2 ${getStatusColor(item.status)}`}
                                >
                                    <option value="watching">Watching</option>
                                    <option value="completed">Completed</option>
                                    <option value="plan-to-watch">Plan to Watch</option>
                                    <option value="on-hold">On Hold</option>
                                    <option value="dropped">Dropped</option>
                                </select>

                                <button
                                    onClick={() => handleRemove(item._id)}
                                    className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                                >
                                    <i className="fa-solid fa-trash mr-2"></i>
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Watchlist;
