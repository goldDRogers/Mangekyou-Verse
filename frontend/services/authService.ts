import api from './api';

export const login = async (userData: any) => {
    const response = await api.post('/auth/login', userData);
    const { token, user } = response.data;
    if (token) {
        localStorage.setItem('token', token);
    }
    return response.data;
};

export const register = async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    const { token, user } = response.data;
    if (token) {
        localStorage.setItem('token', token);
    }
    return response.data;
};

export const logout = async () => {
    localStorage.removeItem('token');
};

export const getMe = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};
