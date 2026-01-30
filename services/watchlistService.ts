import { supabase } from '../lib/supabaseClient';
import { getAnimeDetailsFromBackend } from './animeService';
import { Anime } from '../types';

export const watchlistService = {
    async getWatchlist(): Promise<Anime[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('watchlist')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Fetch anime details from Jikan for each watchlist item
        const animePromises = data.map(async (item: any) => {
            try {
                const animeDetails = await getAnimeDetailsFromBackend(item.anime_id);
                return animeDetails;
            } catch (error) {
                console.error(`Failed to fetch anime details for ID ${item.anime_id}:`, error);
                return null;
            }
        });

        const animeResults = await Promise.all(animePromises);
        return animeResults.filter((anime): anime is Anime => anime !== null);
    },

    async toggleWatchlist(animeId: string) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Must be logged in");

        // Check if exists
        const { data: existing } = await supabase
            .from('watchlist')
            .select('id')
            .eq('user_id', user.id)
            .eq('anime_id', animeId)
            .single();

        if (existing) {
            // Remove
            const { error } = await supabase
                .from('watchlist')
                .delete()
                .eq('id', existing.id);
            if (error) throw error;
            return false; // Not in watchlist anymore
        } else {
            // Add
            const { error } = await supabase
                .from('watchlist')
                .insert([{ user_id: user.id, anime_id: animeId }]);
            if (error) throw error;
            return true; // In watchlist now
        }
    },

    async isInWatchlist(animeId: string) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { data, error } = await supabase
            .from('watchlist')
            .select('id')
            .eq('user_id', user.id)
            .eq('anime_id', animeId)
            .maybeSingle();

        return !!data;
    }
};

export const historyService = {
    async getHistory() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('watch_history')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async getContinueWatching(): Promise<Array<{anime: Anime; progress: number; episode: number}>> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('watch_history')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })
            .limit(10); // Show last 10 watched items

        if (error) throw error;
        
        // Fetch anime details from Jikan for each history item
        const continueWatchingPromises = data.map(async (item: any) => {
            try {
                const animeDetails = await getAnimeDetailsFromBackend(item.anime_id);
                if (animeDetails) {
                    return {
                        anime: animeDetails,
                        progress: item.progress_seconds || 0,
                        episode: parseInt(item.episode_id) || 1
                    };
                }
                return null;
            } catch (error) {
                console.error(`Failed to fetch anime details for ID ${item.anime_id}:`, error);
                return null;
            }
        });

        const results = await Promise.all(continueWatchingPromises);
        return results.filter((item): item is {anime: Anime; progress: number; episode: number} => item !== null);
    },

    async updateProgress(animeId: string, episodeId: string, seconds: number) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Upsert the progress
        const { error } = await supabase
            .from('watch_history')
            .upsert({
                user_id: user.id,
                anime_id: animeId,
                episode_id: episodeId,
                progress_seconds: seconds,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id, anime_id'
            });

        if (error) console.error("Failed to update history", error);
    }
};
