import { animeService as jikanService, JikanAnime } from '../lib/jikan';
import { Anime } from '../types';

// Convert Jikan anime to our Anime type
const convertJikanToAnime = (jikanAnime: JikanAnime): Anime | null => {
    // Add null check
    if (!jikanAnime) return null;
    
    // Map Jikan type to our type
    const mapType = (type: string): 'TV' | 'Movie' | 'OVA' | 'ONA' | 'Special' => {
        switch (type?.toLowerCase()) {
            case 'tv': return 'TV';
            case 'movie': return 'Movie';
            case 'ova': return 'OVA';
            case 'ona': return 'ONA';
            case 'special': return 'Special';
            default: return 'TV';
        }
    };

    // Map Jikan status to our status
    const mapStatus = (status: string): 'Ongoing' | 'Completed' => {
        return status?.toLowerCase().includes('currently') ? 'Ongoing' : 'Completed';
    };

    // Add safety checks for nested objects
    if (!jikanAnime.mal_id || !jikanAnime.title) {
        console.warn('Invalid anime data: missing required fields', jikanAnime);
        return null;
    }

    // Get thumbnail with fallback
    const thumbnail = jikanAnime.images?.jpg?.image_url || 
                     jikanAnime.images?.webp?.image_url ||
                     `https://picsum.photos/seed/anime-${jikanAnime.mal_id}/400/600.jpg`;

    // Debug logging
    console.log('Anime data:', {
        id: jikanAnime.mal_id,
        title: jikanAnime.title,
        thumbnail: thumbnail,
        originalImageUrl: jikanAnime.images?.jpg?.image_url,
        webpUrl: jikanAnime.images?.webp?.image_url
    });

    return {
        id: jikanAnime.mal_id.toString(),
        malId: jikanAnime.mal_id, // Include MAL ID for direct linking
        title: jikanAnime.title,
        description: jikanAnime.synopsis || 'No synopsis available.',
        type: mapType(jikanAnime.type || 'TV'),
        status: mapStatus(jikanAnime.status || 'Completed'),
        rating: jikanAnime.score || 0,
        episodes: jikanAnime.episodes || 0,
        genres: jikanAnime.genres?.map(genre => genre.name) || [],
        thumbnail: thumbnail,
        gallery: [
            jikanAnime.images?.jpg?.large_image_url || thumbnail,
            jikanAnime.images?.webp?.large_image_url || thumbnail,
        ].filter(Boolean)
    };
};

export const getSpotlight = async () => {
    try {
        console.log('Fetching spotlight anime...');
        const spotlightAnime = await jikanService.getSpotlightAnime();
        console.log('Raw spotlight data:', spotlightAnime);
        
        const converted = spotlightAnime.map(convertJikanToAnime).filter((anime): anime is Anime => anime !== null);
        console.log('Converted spotlight data:', converted);
        
        return converted;
    } catch (e) {
        console.error("Failed to get spotlight", e);
        return [];
    }
};

export const getTrending = async () => {
    try {
        console.log('Fetching trending anime...');
        const trendingAnime = await jikanService.getTrendingAnime();
        return trendingAnime.map(convertJikanToAnime).filter((anime): anime is Anime => anime !== null);
    } catch (e) {
        console.error("Failed to get trending", e);
        return [];
    }
};

export const getRecentAnime = async () => {
    try {
        const recentAnime = await jikanService.getRecentAnime();
        return recentAnime.map(convertJikanToAnime).filter((anime): anime is Anime => anime !== null);
    } catch (e) {
        console.error("Failed to get recent anime", e);
        return [];
    }
};

export const getAnimeDetailsFromBackend = async (id: string): Promise<Anime | null> => {
    try {
        const jikanAnime = await jikanService.getAnimeDetails(parseInt(id));
        if (!jikanAnime) return null;
        
        return convertJikanToAnime(jikanAnime);
    } catch (e) {
        console.error("Failed to get anime details", e);
        return null;
    }
};

export const getEpisodes = async (id: string) => {
    try {
        const episodes = await jikanService.getAnimeEpisodes(parseInt(id));
        return episodes.map((episode, index) => ({
            id: episode.mal_id.toString(),
            anime_id: id,
            episode_number: index + 1,
            title: episode.title || `Episode ${index + 1}`,
            description: `Episode ${index + 1} of the anime series.`,
            duration_seconds: 1440, // 24 minutes default
            video_url: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`,
            created_at: new Date().toISOString(),
            thumbnail: `https://picsum.photos/seed/episode-${id}-${index}/320/180.jpg`
        }));
    } catch (e) {
        console.error("Failed to get episodes", e);
        return [];
    }
};

export const searchAnime = async (query: string) => {
    try {
        const searchResults = await jikanService.searchAnime(query);
        return searchResults.map(convertJikanToAnime).filter((anime): anime is Anime => anime !== null);
    } catch (e) {
        console.error("Failed to search anime", e);
        return [];
    }
};
