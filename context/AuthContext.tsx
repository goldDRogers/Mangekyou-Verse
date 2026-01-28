import React, { createContext, useState, useEffect, useContext } from 'react';
import { login, register, logout, getMe } from '../services/authService';

interface AuthContextType {
    user: any;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    loginUser: (userData: any) => Promise<void>;
    registerUser: (userData: any) => Promise<void>;
    logoutUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any>(null);
    const [status, setStatus] = useState<'idle' | 'loading' | 'succeeded' | 'failed'>('idle');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const userData = await getMe();
                    setUser(userData);
                } catch (err) {
                    localStorage.removeItem('token');
                }
            }
        };
        checkUser();
    }, []);

    const loginUser = async (userData: any) => {
        setStatus('loading');
        try {
            const data = await login(userData);
            setUser(data.user);
            setStatus('succeeded');
        } catch (err: any) {
            setStatus('failed');
            setError(err.response?.data?.message || 'Login failed');
            throw err;
        }
    };

    const registerUser = async (userData: any) => {
        setStatus('loading');
        try {
            const data = await register(userData);
            setUser(data.user);
            setStatus('succeeded');
        } catch (err: any) {
            setStatus('failed');
            setError(err.response?.data?.message || 'Registration failed');
            throw err;
        }
    };

    const logoutUser = () => {
        logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, status, error, loginUser, registerUser, logoutUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
