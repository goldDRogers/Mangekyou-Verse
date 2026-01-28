import api from './api';

export const getSpotlight = async () => {
    const response = await api.get('/api/anime/spotlight');
    return response.data;
};

export const getTrending = async () => {
    const response = await api.get('/api/anime/trending');
    return response.data;
};
