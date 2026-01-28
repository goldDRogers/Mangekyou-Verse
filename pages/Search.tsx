import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import AnimeCard from '../components/AnimeCard';
import api from '../services/api';
import { Anime } from '../types';

const Search: React.FC = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const [results, setResults] = useState<Anime[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const searchAnime = async () => {
            if (!query) return;
            setLoading(true);
            try {
                const res = await api.get(`/api/anime/search?q=${query}`);
                // Map different possible backend responses to Anime type
                const mapped = res.data.map((item: any) => ({
                    id: item.id || item.animeId,
                    title: item.name || item.title || item.animeTitle,
                    thumbnail: item.poster || item.image || item.animePoster,
                    description: item.description || "No description available.",
                    rating: item.rating ? parseFloat(item.rating) : 0,
                    episodes: item.episodes?.sub || 0,
                    type: item.type || 'TV',
                    status: 'Ongoing',
                    genres: []
                }));
                setResults(mapped);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        searchAnime();
    }, [query]);

    return (
        <div className="min-h-screen bg-[#0f1011] pt-32 px-4 md:px-12 pb-24">
            <h1 className="text-3xl font-black text-white uppercase mb-8">Results for <span className="text-brand-primary">"{query}"</span></h1>
            {loading ? (
                <div className="text-white animate-pulse">Scanning the multiverse...</div>
            ) : results.length === 0 ? (
                <div className="text-gray-500">No results found in this timeline.</div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
                    {results.map((anime, idx) => <AnimeCard key={`${anime.id}-${idx}`} anime={anime} />)}
                </div>
            )}
        </div>
    );
};
export default Search;
