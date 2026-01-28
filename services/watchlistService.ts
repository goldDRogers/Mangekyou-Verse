import api from './api';

export const getWatchlist = async () => {
    const response = await api.get('/watchlist');
    return response.data;
};

export const addToWatchlist = async (data: { animeId: string, animeTitle: string, animePoster: string }) => {
    const response = await api.post('/watchlist', {
        animeId: data.animeId,
        animeTitle: data.animeTitle,
        animePoster: data.animePoster
    });
    return response.data;
};
