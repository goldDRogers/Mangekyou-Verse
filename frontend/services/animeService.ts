import api from './api';
import { Anime } from '../types';

export const getSpotlight = async () => {
    try {
        const response = await api.get('/api/anime/spotlight');
        return response.data;
    } catch (e) {
        console.error("Failed to get spotlight", e);
        return [];
    }
};

export const getTrending = async () => {
    try {
        const response = await api.get('/api/anime/trending');
        return response.data;
    } catch (e) {
        console.error("Failed to get trending", e);
        return [];
    }
};

export const getAnimeDetailsFromBackend = async (id: string): Promise<Anime | null> => {
    try {
        const response = await api.get(`/api/anime/${id}`);
        return response.data;
    } catch (e) {
        console.error("Failed to get anime details from backend", e);
        return null;
    }
};

export const getEpisodes = async (id: string) => {
    try {
        const response = await api.get(`/api/anime/${id}/episodes`);
        return response.data;
    } catch (e) {
        console.error("Failed to get episodes", e);
        return [];
    }
};
