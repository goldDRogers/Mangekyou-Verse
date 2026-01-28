"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { motion } from 'framer-motion';

export default function LoginPage() {
    const { user, signOut, loading: authLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [localLoading, setLocalLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    if (authLoading) return null;

    // HiAnime Style: If already logged in, block the form
    if (user) {
        return (
            <div className="min-h-screen bg-[#0f1011] flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md bg-[#1c1d21] rounded-3xl p-10 text-center border border-white/5 shadow-2xl"
                >
                    <Logo className="w-16 h-16 mx-auto mb-6" />
                    <h1 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Workspace Active</h1>
                    <p className="text-gray-400 mb-8 font-medium">
                        You are already logged in as:<br />
                        <span className="text-brand-primary font-bold">{user.email}</span>
                    </p>
                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => router.push('/')}
                            className="bg-brand-primary text-black font-black uppercase tracking-widest py-4 rounded-full hover:scale-[1.02] transition-transform"
                        >
                            Return to Home
                        </button>
                        <button
                            onClick={signOut}
                            className="text-gray-500 hover:text-white font-bold uppercase tracking-widest text-xs py-2 transition-colors"
                        >
                            Log into another account
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setError(error.message);
            setLocalLoading(false);
        } else {
            router.push('/');
        }
    };

    return (
        <div className="min-h-screen bg-[#0f1011] flex items-center justify-center p-6 selection:bg-brand-primary selection:text-black">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-[#121315] rounded-3xl p-10 border border-white/5 shadow-[0_50px_100px_rgba(0,0,0,0.8)] relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-primary to-transparent opacity-50"></div>

                <div className="flex flex-col items-center mb-10">
                    <Logo className="w-16 h-16 mb-4 animate-spin-slow" />
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Welcome Back</h2>
                    <p className="text-[10px] uppercase tracking-[0.4em] text-gray-500 font-bold mt-1">Access the Mangekyou Node</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Secure Email</label>
                        <input
                            type="email"
                            required
                            className="w-full bg-[#1c1d21] border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-primary/50 transition-all font-bold placeholder:text-gray-700"
                            placeholder="shinobi@konoha.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full bg-[#1c1d21] border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-primary/50 transition-all font-bold placeholder:text-gray-700"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold py-3 px-4 rounded-xl text-center">
                            {error}
                        </div>
                    )}

                    <button
                        disabled={localLoading}
                        className="w-full bg-brand-primary hover:bg-[#cbb2f9] text-[#0f1011] font-black uppercase tracking-widest py-5 rounded-2xl transition-all shadow-xl shadow-brand-primary/10 hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:scale-100"
                    >
                        {localLoading ? 'Initializing...' : 'Enter the Verse'}
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-white/5 text-center">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
                        New Ninja? <Link href="/register" className="text-brand-primary hover:text-white transition-colors ml-2">Awaken Here</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
