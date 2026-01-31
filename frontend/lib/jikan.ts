// Jikan API v4 Client for Mangekyou Verse
// Base URL: https://api.jikan.moe/v4
// No API key required - respects rate limits

export interface JikanAnime {
  mal_id: number;
  title: string;
  title_english?: string;
  title_japanese?: string;
  type: string;
  source: string;
  episodes?: number;
  status: string;
  airing: boolean;
  aired: {
    from: string;
    to: string;
  };
  duration: string;
  rating: string;
  score: number;
  scored_by: number;
  rank: number;
  popularity: number;
  members: number;
  favorites: number;
  synopsis: string;
  background?: string;
  season?: string;
  year?: number;
  images: {
    jpg: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
    webp: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
  };
  trailer?: {
    youtube_id: string;
    url: string;
    embed_url: string;
  };
  genres: Array<{
    mal_id: number;
    type: string;
    name: string;
    url: string;
  }>;
}

export interface JikanEpisode {
  mal_id: number;
  title: string;
  title_japanese?: string;
  title_romanji?: string;
  aired: string;
  score?: number;
  filler: boolean;
  recap: boolean;
  forum_url?: string;
}

export interface JikanResponse<T> {
  pagination: {
    last_visible_page: number;
    has_next_page: boolean;
    current_page: number;
    items: {
      count: number;
      total: number;
      per_page: number;
    };
  };
  data: T[];
}

class JikanClient {
  private baseUrl = 'https://api.jikan.moe/v4';
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private lastRequestTime = 0;
  private minRequestInterval = 2000; // Increased to 2 seconds between requests
  private maxRetries = 3;
  private retryDelay = 5000; // 5 seconds delay for retries

  private async makeRequest<T>(endpoint: string, ttl: number = 300000): Promise<T> {
    const cacheKey = endpoint;
    const cached = this.cache.get(cacheKey);
    
    // Return cached data if still valid
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }

    let lastError: Error | null = null;
    
    // Retry logic with exponential backoff
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        // Rate limiting: wait if necessary
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        
        if (timeSinceLastRequest < this.minRequestInterval) {
          const waitTime = this.minRequestInterval - timeSinceLastRequest;
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          headers: {
            'User-Agent': 'MangekyouVerse/1.0',
          },
        });

        this.lastRequestTime = Date.now();

        if (response.status === 429) {
          // Rate limited - wait longer and retry
          const retryWait = this.retryDelay * Math.pow(2, attempt); // Exponential backoff
          console.warn(`Jikan API rate limited. Retrying in ${retryWait}ms (attempt ${attempt + 1}/${this.maxRetries + 1})`);
          
          if (attempt === this.maxRetries) {
            throw new Error(`Jikan API rate limit exceeded after ${this.maxRetries + 1} attempts`);
          }
          
          await new Promise(resolve => setTimeout(resolve, retryWait));
          continue;
        }

        if (!response.ok) {
          throw new Error(`Jikan API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        // Cache the response
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          ttl,
        });

        return data;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === this.maxRetries) {
          console.error(`Jikan API request failed for ${endpoint} after ${this.maxRetries + 1} attempts:`, error);
          throw lastError;
        }
        
        // For non-429 errors, wait a bit before retrying
        if (!(error as Error).message.includes('429')) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }

    throw lastError || new Error('Unknown error occurred');
  }

  // Get top anime
  async getTopAnime(page: number = 1, limit: number = 25): Promise<JikanResponse<JikanAnime>> {
    return this.makeRequest<JikanResponse<JikanAnime>>(`/top/anime?page=${page}&limit=${limit}`);
  }

  // Get anime by popularity
  async getTopAnimeByPopularity(page: number = 1, limit: number = 25): Promise<JikanResponse<JikanAnime>> {
    return this.makeRequest<JikanResponse<JikanAnime>>(`/top/anime?filter=bypopularity&page=${page}&limit=${limit}`);
  }

  // Get current season anime
  async getSeasonalAnime(page: number = 1, limit: number = 25): Promise<JikanResponse<JikanAnime>> {
    return this.makeRequest<JikanResponse<JikanAnime>>(`/seasons/now?page=${page}&limit=${limit}`);
  }

  // Get anime details by ID
  async getAnimeById(id: number): Promise<JikanAnime> {
    const response = await this.makeRequest<{data: JikanAnime}>(`/anime/${id}`, 600000); // Cache for 10 minutes
    return response.data;
  }

  // Get anime episodes
  async getAnimeEpisodes(id: number, page: number = 1, limit: number = 100): Promise<JikanResponse<JikanEpisode>> {
    return this.makeRequest<JikanResponse<JikanEpisode>>(`/anime/${id}/episodes?page=${page}&limit=${limit}`, 600000);
  }

  // Search anime
  async searchAnime(query: string, page: number = 1, limit: number = 25): Promise<JikanResponse<JikanAnime>> {
    const encodedQuery = encodeURIComponent(query);
    return this.makeRequest<JikanResponse<JikanAnime>>(`/anime?q=${encodedQuery}&page=${page}&limit=${limit}`);
  }

  // Get anime by genre
  async getAnimeByGenre(genreId: number, page: number = 1, limit: number = 25): Promise<JikanResponse<JikanAnime>> {
    return this.makeRequest<JikanResponse<JikanAnime>>(`/anime?genres=${genreId}&page=${page}&limit=${limit}`);
  }

  // Get genres list
  async getGenres(): Promise<{ data: Array<{ mal_id: number; name: string; url: string }> }> {
    return this.makeRequest('/genres/anime', 3600000); // Cache for 1 hour
  }

  // Clear cache (useful for testing)
  clearCache(): void {
    this.cache.clear();
    this.lastRequestTime = 0;
  }

  // Get cache stats
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  // Reset rate limiting (useful after rate limit errors)
  resetRateLimit(): void {
    this.lastRequestTime = 0;
  }
}

// Singleton instance
export const jikanClient = new JikanClient();

// Helper functions for common operations
export const animeService = {
  // Get spotlight anime (top 10)
  async getSpotlightAnime(): Promise<JikanAnime[]> {
    try {
      const response = await jikanClient.getTopAnime(1, 10);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch spotlight anime:', error);
      return [];
    }
  },

  // Get trending anime (top 20 by popularity)
  async getTrendingAnime(): Promise<JikanAnime[]> {
    try {
      const response = await jikanClient.getTopAnimeByPopularity(1, 20);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch trending anime:', error);
      return [];
    }
  },

  // Get recent anime (current season)
  async getRecentAnime(): Promise<JikanAnime[]> {
    try {
      const response = await jikanClient.getSeasonalAnime(1, 15);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch recent anime:', error);
      return [];
    }
  },

  // Get anime details
  async getAnimeDetails(id: number): Promise<JikanAnime | null> {
    try {
      return await jikanClient.getAnimeById(id);
    } catch (error) {
      console.error(`Failed to fetch anime details for ID ${id}:`, error);
      return null;
    }
  },

  // Get anime episodes
  async getAnimeEpisodes(id: number): Promise<JikanEpisode[]> {
    try {
      const response = await jikanClient.getAnimeEpisodes(id);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch episodes for anime ID ${id}:`, error);
      return [];
    }
  },

  // Search anime
  async searchAnime(query: string): Promise<JikanAnime[]> {
    try {
      const response = await jikanClient.searchAnime(query);
      return response.data;
    } catch (error) {
      console.error(`Failed to search anime for query "${query}":`, error);
      return [];
    }
  },
};

export default jikanClient;
