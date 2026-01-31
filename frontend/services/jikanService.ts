import { Anime } from '../types';

const BASE_URL = 'https://api.jikan.moe/v4';

// Rate limit handling helper
const fetchWithDelay = async (url: string) => {
    await new Promise(resolve => setTimeout(resolve, 350)); // Jikan rate limit buffer
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`Jikan API Error: ${res.statusText}`);
    return res.json();
};

const mapJikanToAnime = (item: any): Anime => ({
    id: item.mal_id.toString(),
    title: item.title_english || item.title,
    description: item.synopsis || "No description available.",
    thumbnail: item.images.webp?.large_image_url || item.images.jpg?.large_image_url,
    gallery: [
        item.images.webp?.large_image_url,
        item.trailer?.images?.maximum_image_url,
        ...(item.images.jpg?.large_image_url ? [item.images.jpg.large_image_url] : [])
    ].filter(Boolean),
    rating: item.score || 0,
    episodes: item.episodes || 0,
    type: item.type,
    status: item.status === 'Currently Airing' ? 'Ongoing' : 'Completed',
    genres: item.genres ? item.genres.map((g: any) => g.name).slice(0, 3) : []
});

export const jikanService = {
    getSpotlight: async (): Promise<Anime[]> => {
        try {
            const data = await fetchWithDelay(`${BASE_URL}/top/anime?filter=airing&limit=10`);
            return data.data.map(mapJikanToAnime);
        } catch (error) {
            console.error("Jikan Spotlight Error:", error);
            return [];
        }
    },

    getTrending: async (): Promise<Anime[]> => {
        try {
            const data = await fetchWithDelay(`${BASE_URL}/top/anime?filter=bypopularity&limit=12`);
            return data.data.map(mapJikanToAnime);
        } catch (error) {
            console.error("Jikan Trending Error:", error);
            return [];
        }
    },

    getNewThisSeason: async (): Promise<Anime[]> => {
        try {
            const data = await fetchWithDelay(`${BASE_URL}/seasons/now?limit=12`);
            return data.data.map(mapJikanToAnime);
        } catch (error) {
            console.error("Jikan Season Error:", error);
            return [];
        }
    },

    getUpcoming: async (): Promise<Anime[]> => {
        try {
            const data = await fetchWithDelay(`${BASE_URL}/seasons/upcoming?limit=12`);
            return data.data.map(mapJikanToAnime);
        } catch (error) {
            console.error("Jikan Upcoming Error:", error);
            return [];
        }
    },

    searchAnime: async (query: string): Promise<Anime[]> => {
        try {
            const data = await fetchWithDelay(`${BASE_URL}/anime?q=${encodeURIComponent(query)}&limit=8&sfw=true`);
            return data.data.map(mapJikanToAnime);
        } catch (error) {
            console.error("Jikan Search Error:", error);
            return [];
        }
    },

    getAnimeDetails: async (id: string): Promise<Anime | null> => {
        try {
            const data = await fetchWithDelay(`${BASE_URL}/anime/${id}/full`);
            return mapJikanToAnime(data.data);
        } catch (error) {
            console.error("Jikan Details Error:", error);
            return null;
        }
    }
};
