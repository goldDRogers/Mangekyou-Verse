import { Anime } from '../types';

const BASE_URL = 'https://api.jikan.moe/v4';

// Global queue to handle rate limiting across parallel calls
let requestQueue: Promise<any> = Promise.resolve();

const fetchWithDelay = async (url: string, retries = 3, backoff = 1500): Promise<any> => {
    return new Promise((resolve, reject) => {
        requestQueue = requestQueue
            .catch(() => { }) // Prevent previous failures from breaking the chain
            .then(async () => {
                // Jikan rate limit is tight (3 req/sec). 700ms is stable and faster.
                await new Promise(r => setTimeout(r, 700));

                try {
                    const res = await fetch(url, {
                        next: { revalidate: 3600 },
                        headers: { 'Accept': 'application/json' }
                    });

                    if (res.status === 429) {
                        console.warn(`[Jikan API] Rate limited (429) for ${url}. Handing back to retry loop...`);
                        throw new Error('API_RATE_LIMIT');
                    }

                    if (!res.ok) {
                        throw new Error(`API_ERROR_${res.status}`);
                    }

                    const data = await res.json();
                    resolve(data);
                } catch (error: any) {
                    if (retries > 0 && (error.message === 'API_RATE_LIMIT' || error.message.includes('500'))) {
                        console.log(`[Jikan API] Retrying ${url} (${retries} left)...`);
                        await new Promise(r => setTimeout(r, backoff));
                        // Recursive call inside the queue context
                        try {
                            const retryResult = await fetchWithDelay(url, retries - 1, backoff * 1.5);
                            resolve(retryResult);
                        } catch (retryErr) {
                            reject(retryErr);
                        }
                    } else {
                        console.error(`[Jikan API] Final Failure for ${url}:`, error.message);
                        reject(error);
                    }
                }
            });
    });
};

const mapJikanToAnime = (item: any): Anime => ({
    id: item.mal_id.toString(),
    malId: item.mal_id,
    title: item.title_english || item.title,
    description: item.synopsis || "No description available.",
    thumbnail: item.images?.webp?.large_image_url || item.images?.jpg?.large_image_url || '',
    gallery: [
        item.images?.webp?.large_image_url,
        item.trailer?.images?.maximum_image_url,
        ...(item.images?.jpg?.large_image_url ? [item.images.jpg.large_image_url] : [])
    ].filter(Boolean),
    rating: item.score || 0,
    episodes: item.episodes || 0,
    type: item.type || 'TV',
    status: item.status === 'Currently Airing' ? 'Ongoing' : 'Completed',
    genres: item.genres ? item.genres.map((g: any) => g.name).slice(0, 5) : [],
    year: item.year || item.aired?.prop?.from?.year,
    season: item.season,
    studios: item.studios?.map((s: any) => s.name) || [],
    source: item.source,
    duration: item.duration,
    airedFrom: item.aired?.from,
    airedTo: item.aired?.to,
    rank: item.rank,
    popularity: item.popularity,
    members: item.members,
    favorites: item.favorites,
});

export interface SearchFilters {
    genres?: string[];
    year?: number;
    status?: 'airing' | 'complete' | 'upcoming';
    type?: 'tv' | 'movie' | 'ova' | 'ona' | 'special';
    orderBy?: 'popularity' | 'score' | 'title' | 'start_date' | 'episodes';
    sort?: 'asc' | 'desc';
    minScore?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        lastVisiblePage: number;
        hasNextPage: boolean;
        currentPage: number;
        itemsCount: number;
        itemsTotal: number;
        itemsPerPage: number;
    };
}

// Available genres for filtering
export const ANIME_GENRES = [
    { id: 1, name: 'Action' },
    { id: 2, name: 'Adventure' },
    { id: 4, name: 'Comedy' },
    { id: 8, name: 'Drama' },
    { id: 10, name: 'Fantasy' },
    { id: 14, name: 'Horror' },
    { id: 7, name: 'Mystery' },
    { id: 22, name: 'Romance' },
    { id: 24, name: 'Sci-Fi' },
    { id: 36, name: 'Slice of Life' },
    { id: 30, name: 'Sports' },
    { id: 37, name: 'Supernatural' },
    { id: 41, name: 'Thriller' },
    { id: 27, name: 'Shounen' },
    { id: 42, name: 'Seinen' },
    { id: 25, name: 'Shoujo' },
    { id: 43, name: 'Josei' },
    { id: 62, name: 'Isekai' },
];

export const jikanService = {
    // Basic endpoints (already existing)
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

    // Enhanced search with autocomplete
    searchAnime: async (query: string, limit: number = 8): Promise<Anime[]> => {
        try {
            if (!query.trim()) return [];
            const data = await fetchWithDelay(
                `${BASE_URL}/anime?q=${encodeURIComponent(query)}&limit=${limit}&sfw=true`
            );
            return data.data.map(mapJikanToAnime);
        } catch (error) {
            console.error("Jikan Search Error:", error);
            return [];
        }
    },

    // Full search with filters and pagination
    searchWithFilters: async (
        query: string,
        filters: SearchFilters = {},
        page: number = 1,
        limit: number = 24
    ): Promise<PaginatedResponse<Anime>> => {
        try {
            const params = new URLSearchParams();
            if (query.trim()) params.append('q', query);
            params.append('page', page.toString());
            params.append('limit', limit.toString());
            params.append('sfw', 'true');

            if (filters.genres?.length) {
                params.append('genres', filters.genres.join(','));
            }
            if (filters.year) params.append('start_date', `${filters.year}-01-01`);
            if (filters.status) params.append('status', filters.status);
            if (filters.type) params.append('type', filters.type);
            if (filters.orderBy) {
                params.append('order_by', filters.orderBy);
                params.append('sort', filters.sort || 'desc');
            }
            if (filters.minScore) params.append('min_score', filters.minScore.toString());

            const data = await fetchWithDelay(`${BASE_URL}/anime?${params.toString()}`);

            return {
                data: data.data.map(mapJikanToAnime),
                pagination: {
                    lastVisiblePage: data.pagination?.last_visible_page || 1,
                    hasNextPage: data.pagination?.has_next_page || false,
                    currentPage: data.pagination?.current_page || page,
                    itemsCount: data.pagination?.items?.count || data.data.length,
                    itemsTotal: data.pagination?.items?.total || data.data.length,
                    itemsPerPage: data.pagination?.items?.per_page || limit,
                },
            };
        } catch (error) {
            console.error("Jikan Search with Filters Error:", error);
            return {
                data: [],
                pagination: {
                    lastVisiblePage: 1,
                    hasNextPage: false,
                    currentPage: page,
                    itemsCount: 0,
                    itemsTotal: 0,
                    itemsPerPage: limit,
                },
            };
        }
    },

    // Get anime by genre
    getByGenre: async (genreId: number, page: number = 1): Promise<PaginatedResponse<Anime>> => {
        try {
            const data = await fetchWithDelay(
                `${BASE_URL}/anime?genres=${genreId}&order_by=popularity&page=${page}&limit=24&sfw=true`
            );
            return {
                data: data.data.map(mapJikanToAnime),
                pagination: {
                    lastVisiblePage: data.pagination?.last_visible_page || 1,
                    hasNextPage: data.pagination?.has_next_page || false,
                    currentPage: data.pagination?.current_page || page,
                    itemsCount: data.pagination?.items?.count || data.data.length,
                    itemsTotal: data.pagination?.items?.total || data.data.length,
                    itemsPerPage: data.pagination?.items?.per_page || 24,
                },
            };
        } catch (error) {
            console.error("Jikan Genre Error:", error);
            return {
                data: [],
                pagination: { lastVisiblePage: 1, hasNextPage: false, currentPage: page, itemsCount: 0, itemsTotal: 0, itemsPerPage: 24 },
            };
        }
    },

    // Get full anime details
    getAnimeDetails: async (id: string): Promise<Anime | null> => {
        try {
            const data = await fetchWithDelay(`${BASE_URL}/anime/${id}/full`);
            return mapJikanToAnime(data.data);
        } catch (error) {
            console.error("Jikan Details Error:", error);
            return null;
        }
    },

    // Get anime episodes
    getAnimeEpisodes: async (id: string, page: number = 1): Promise<{ episodes: any[], pagination: any }> => {
        try {
            const data = await fetchWithDelay(`${BASE_URL}/anime/${id}/episodes?page=${page}`);
            return {
                episodes: data.data.map((ep: any) => ({
                    number: ep.mal_id,
                    title: ep.title || `Episode ${ep.mal_id}`,
                    titleJapanese: ep.title_japanese,
                    titleRomanji: ep.title_romanji,
                    aired: ep.aired,
                    filler: ep.filler,
                    recap: ep.recap,
                })),
                pagination: data.pagination,
            };
        } catch (error) {
            console.error("Jikan Episodes Error:", error);
            return { episodes: [], pagination: null };
        }
    },

    // Get anime recommendations
    getRecommendations: async (id: string): Promise<Anime[]> => {
        try {
            const data = await fetchWithDelay(`${BASE_URL}/anime/${id}/recommendations`);
            return data.data.slice(0, 12).map((rec: any) => mapJikanToAnime(rec.entry));
        } catch (error) {
            console.error("Jikan Recommendations Error:", error);
            return [];
        }
    },

    // Get smart recommendations based on genres and popularity
    getGenreBasedSimilarAnime: async (genres: string[], excludeId?: string): Promise<Anime[]> => {
        try {
            const genreIds = genres
                .map(name => ANIME_GENRES.find(g => g.name.toLowerCase() === name.toLowerCase())?.id)
                .filter(Boolean);

            if (genreIds.length === 0) return [];

            // Fetch top anime in these genres
            const data = await fetchWithDelay(
                `${BASE_URL}/anime?genres=${genreIds.slice(0, 3).join(',')}&order_by=popularity&sort=desc&limit=12&sfw=true`
            );

            let results = data.data.map(mapJikanToAnime);
            if (excludeId) {
                results = results.filter(a => a.id !== excludeId);
            }
            return results;
        } catch (error) {
            console.error("Jikan Genre Based Similar Error:", error);
            return [];
        }
    },

    // Get random anime
    getRandomAnime: async (): Promise<Anime | null> => {
        try {
            const data = await fetchWithDelay(`${BASE_URL}/random/anime`);
            return mapJikanToAnime(data.data);
        } catch (error) {
            console.error("Jikan Random Error:", error);
            return null;
        }
    },

    // Get top anime with pagination
    getTopAnime: async (
        filter: 'airing' | 'upcoming' | 'bypopularity' | 'favorite' = 'bypopularity',
        page: number = 1
    ): Promise<PaginatedResponse<Anime>> => {
        try {
            const data = await fetchWithDelay(`${BASE_URL}/top/anime?filter=${filter}&page=${page}&limit=24`);
            return {
                data: data.data.map(mapJikanToAnime),
                pagination: {
                    lastVisiblePage: data.pagination?.last_visible_page || 1,
                    hasNextPage: data.pagination?.has_next_page || false,
                    currentPage: data.pagination?.current_page || page,
                    itemsCount: data.pagination?.items?.count || data.data.length,
                    itemsTotal: data.pagination?.items?.total || data.data.length,
                    itemsPerPage: data.pagination?.items?.per_page || 24,
                },
            };
        } catch (error) {
            console.error("Jikan Top Error:", error);
            return {
                data: [],
                pagination: { lastVisiblePage: 1, hasNextPage: false, currentPage: page, itemsCount: 0, itemsTotal: 0, itemsPerPage: 24 },
            };
        }
    },
};

// Extended Anime type with additional fields
export interface AnimeExtended extends Anime {
    year?: number;
    season?: string;
    studios?: string[];
    source?: string;
    duration?: string;
    airedFrom?: string;
    airedTo?: string;
    rank?: number;
    popularity?: number;
    members?: number;
    favorites?: number;
}
