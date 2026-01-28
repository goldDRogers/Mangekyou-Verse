"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { motion } from 'framer-motion';

export default function RegisterPage() {
    const { user, signOut, loading: authLoading } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [localLoading, setLocalLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    if (authLoading) return null;

    // HiAnime Style: Block registration if already logged in
    if (user) {
        return (
            <div className="min-h-screen bg-[#0f1011] flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md bg-[#1c1d21] rounded-3xl p-10 text-center border border-white/5 shadow-2xl"
                >
                    <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-brand-primary/20">
                        <i className="fa-solid fa-user-lock text-3xl text-brand-primary"></i>
                    </div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Registration Locked</h1>
                    <p className="text-gray-400 mb-8 font-medium italic">
                        Please logout of <span className="text-white font-bold">{user.email}</span> before creating a new identity.
                    </p>
                    <div className="flex flex-col gap-4">
                        <button
                            onClick={signOut}
                            className="bg-[#ca2221] text-white font-black uppercase tracking-widest py-4 rounded-full hover:scale-[1.02] shadow-xl shadow-red-500/10 transition-all hover:bg-red-500"
                        >
                            Logout Current Ninja
                        </button>
                        <Link href="/" className="text-gray-500 hover:text-white font-bold uppercase tracking-widest text-xs py-2 transition-colors">
                            Return to Home
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLocalLoading(true);

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: name }
            }
        });

        if (error) {
            console.error("Supabase Registration Error:", error);
            setError(error.message);
            setLocalLoading(false);
        } else {
            // Instant login works if email confirmation is disabled in Supabase
            if (data.session) {
                router.push('/');
            } else {
                setError("Please check your email to confirm your identity.");
                setLocalLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#0f1011] flex items-center justify-center p-6 selection:bg-brand-primary selection:text-black">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg bg-[#121315] rounded-3xl p-10 border border-white/5 shadow-[0_50px_100px_rgba(0,0,0,0.8)] relative overflow-hidden"
            >
                <div className="flex flex-col items-center mb-10">
                    <Logo className="w-16 h-16 mb-4" />
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Join The Order</h2>
                    <p className="text-[10px] uppercase tracking-[0.4em] text-brand-primary font-bold mt-1">Begin your ninja way</p>
                </div>

                <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Ninja Name</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-[#1c1d21] border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-primary/50 transition-all font-bold placeholder:text-gray-700"
                            placeholder="Kakashi"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full bg-[#1c1d21] border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-primary/50 transition-all font-bold placeholder:text-gray-700"
                            placeholder="sharingan@eye.com"
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
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Confirm</label>
                        <input
                            type="password"
                            required
                            className="w-full bg-[#1c1d21] border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-primary/50 transition-all font-bold placeholder:text-gray-700"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div className="md:col-span-2 bg-[#ca2221]/10 border border-[#ca2221]/20 text-[#ca2221] text-xs font-bold py-3 px-4 rounded-xl text-center">
                            {error}
                        </div>
                    )}

                    <button
                        disabled={localLoading}
                        className="md:col-span-2 bg-brand-primary hover:bg-[#cbb2f9] text-[#0f1011] font-black uppercase tracking-widest py-5 rounded-2xl transition-all shadow-xl shadow-brand-primary/10 hover:scale-[1.01] active:scale-95 disabled:opacity-50"
                    >
                        {localLoading ? 'Summoning Identity...' : 'Awaken Mangekyou'}
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-white/5 text-center">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
                        Already have an account? <Link href="/login" className="text-brand-primary hover:text-white transition-colors ml-2">Login here</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
