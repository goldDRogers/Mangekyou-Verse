"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Logo from '@/components/Logo';
import { motion } from 'framer-motion';

export default function AccountPage() {
    const { user, signOut } = useAuth();

    if (!user) return null;

    const creationDate = new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-[#0f1011] pt-24 pb-12 px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#121315] rounded-[40px] border border-white/5 overflow-hidden shadow-2xl"
                    >
                        {/* Header Banner */}
                        <div className="h-48 bg-gradient-to-br from-brand-secondary/20 to-brand-primary/10 relative overflow-hidden flex items-center justify-center">
                            <img
                                src="https://loremflickr.com/1200/400/anime,background/all"
                                className="absolute inset-0 w-full h-full object-cover opacity-20"
                                alt="Banner"
                            />
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
                            <Logo className="w-24 h-24 opacity-20 transform -rotate-12 absolute -right-4 -top-4" />
                            <div className="relative text-center">
                                <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Your Ninja Profile</h1>
                                <p className="text-[10px] font-black tracking-[0.5em] text-brand-primary uppercase mt-2">Mangekyou Verse ID</p>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-10 md:p-16">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-8">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-2 block ml-1">Identity (Email)</label>
                                        <div className="bg-[#1c1d21] border border-white/5 py-5 px-8 rounded-3xl text-white font-bold text-lg md:text-xl truncate">
                                            {user.email}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-2 block ml-1">Member Since</label>
                                        <div className="bg-[#1c1d21] border border-white/5 py-5 px-8 rounded-3xl text-gray-300 font-bold">
                                            {creationDate}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="bg-brand-primary/5 border border-brand-primary/10 p-10 rounded-[40px] text-center space-y-6">
                                        <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-primary/20 shadow-2xl shadow-brand-primary/5">
                                            <i className="fa-solid fa-shield-halved text-3xl text-brand-primary"></i>
                                        </div>
                                        <h3 className="text-white font-black uppercase tracking-widest">Account Security</h3>
                                        <p className="text-xs text-gray-500 font-medium leading-relaxed uppercase tracking-wider">
                                            Your session is encrypted via the Mangekyou Secure Node.
                                        </p>
                                        <button
                                            onClick={signOut}
                                            className="w-full bg-[#ca2221] hover:bg-red-500 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all shadow-xl shadow-red-500/10 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
                                        >
                                            <i className="fa-solid fa-right-from-bracket"></i>
                                            Leave the Verse
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-16 pt-12 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-6">
                                <LinkCard icon="fa-heart" title="My Collection" count="Watchlist" />
                                <LinkCard icon="fa-clock-rotate-left" title="View History" count="Activity" />
                                <LinkCard icon="fa-gear" title="Preferences" count="Disabled" />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </ProtectedRoute>
    );
}

function LinkCard({ icon, title, count }: { icon: string, title: string, count: string }) {
    return (
        <div className="bg-[#1c1d21] p-8 rounded-3xl border border-white/5 hover:border-brand-primary/20 transition-all group cursor-pointer">
            <i className={`fa-solid ${icon} text-2xl text-gray-600 group-hover:text-brand-primary transition-colors mb-4`}></i>
            <h4 className="text-gray-400 font-black uppercase tracking-widest text-xs mb-1 group-hover:text-white">{title}</h4>
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest group-hover:text-brand-primary/60">{count}</p>
        </div>
    );
}
