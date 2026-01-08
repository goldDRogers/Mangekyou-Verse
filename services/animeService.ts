import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Hardcoded for now, ideally in .env
});

export const getTopAiring = async () => {
    // In a real scenario, this would hit a specific endpoint. 
    // We'll search for 'popular' or just 'naruto' as a placeholder if no specific top list endpoint exists yet.
    // For Mangekyou Verse, let's search for a popular term.
    const res = await api.get('/anime/search?q=demon slayer');
    return res.data;
};

export const searchAnime = async (query: string, page: number = 1) => {
    const res = await api.get(`/anime/search?q=${query}&page=${page}`);
    return res.data;
};

export const getAnimeDetails = async (id: string) => {
    const res = await api.get(`/anime/${id}`);
    return res.data;
};

export const getAnimeEpisodes = async (id: string) => {
    const res = await api.get(`/anime/${id}/episodes`);
    return res.data;
};
