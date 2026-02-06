/**
 * Kitsu API Service
 * Provides fallback anime metadata (descriptions, posters) if Jikan/AniList fails
 * Docs: https://kitsu.io/api/edge/
 */

const KITSU_API = 'https://kitsu.io/api/edge';

export interface KitsuData {
    description?: string;
    posterImage?: string;
    coverImage?: string;
    averageRating?: string;
    episodeCount?: number;
}

const fetchKitsu = async (url: string): Promise<any> => {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/vnd.api+json',
                'Accept': 'application/vnd.api+json',
            },
            next: { revalidate: 3600 }, // Cache for 1 hour
        });

        if (!response.ok) {
            throw new Error(`Kitsu API Error: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Kitsu Fetch Error:', error);
        return null;
    }
};

export const kitsuService = {
    /**
     * Get anime details by title (searching Kitsu)
     */
    getAnimeByTitle: async (title: string): Promise<KitsuData | null> => {
        const url = `${KITSU_API}/anime?filter[text]=${encodeURIComponent(title)}&page[limit]=1`;
        const data = await fetchKitsu(url);

        if (!data || !data.data || data.data.length === 0) {
            return null;
        }

        const attr = data.data[0].attributes;

        return {
            description: attr.synopsis || attr.description,
            posterImage: attr.posterImage?.large || attr.posterImage?.original,
            coverImage: attr.coverImage?.large || attr.coverImage?.original,
            averageRating: attr.averageRating,
            episodeCount: attr.episodeCount,
        };
    },

    /**
     * Get anime details by slug
     */
    getAnimeBySlug: async (slug: string): Promise<KitsuData | null> => {
        const url = `${KITSU_API}/anime?filter[slug]=${slug}`;
        const data = await fetchKitsu(url);

        if (!data || !data.data || data.data.length === 0) {
            return null;
        }

        const attr = data.data[0].attributes;

        return {
            description: attr.synopsis || attr.description,
            posterImage: attr.posterImage?.large || attr.posterImage?.original,
            coverImage: attr.coverImage?.large || attr.coverImage?.original,
            averageRating: attr.averageRating,
            episodeCount: attr.episodeCount,
        };
    }
};

export default kitsuService;
