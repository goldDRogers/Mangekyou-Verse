import { supabase } from './supabaseClient';

export const login = async (userData: any) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: userData.password,
    });

    if (error) {
        throw error;
    }
    return data;
};

export const register = async (userData: any) => {
    const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
            data: {
                username: userData.username,
            }
        }
    });

    if (error) {
        throw error;
    }
    return data;
};

export const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('token');
};

export const getMe = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
};

