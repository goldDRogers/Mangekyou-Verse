"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Mail,
    Settings,
    LogOut,
    Shield,
    Bell,
    ShieldCheck,
    Calendar,
    Zap,
    ChevronRight,
    Loader2,
    Upload,
    Image as ImageIcon,
    CheckCircle2,
    XCircle,
    X,
    Camera
} from 'lucide-react';
import Link from 'next/link';
import { historyService, watchlistService } from '@/services/watchlistService';
import { profileService } from '@/services/profileService';

// --- Sub-Components ---

const PRESET_AVATARS = [
    { id: 'boy', label: 'Dark Shinobi', url: 'https://i.pinimg.com/originals/1c/b4/d3/1cb4d3d4b2d56a7364860d8a70669298.jpg', category: 'Ninja' },
    { id: 'girl', label: 'Silver Spirit', url: 'https://i.pinimg.com/736x/8e/9d/23/8e9d23192039234fd4013149fc57f62e.jpg', category: 'Kaguya' },
    { id: 'mysterious', label: 'Void Specter', url: 'https://i.pinimg.com/originals/f3/d3/9a/f3d39a66d03d3c19d4b684fa2d88c697.jpg', category: 'Uchiha' },
    { id: 'samurai', label: 'Crimson Blade', url: 'https://i.pinimg.com/736x/2b/8c/7e/2b8c7e06fd7a6e14a1e967a9609c379a.jpg', category: 'Warrior' },
];

export default function AccountClient() {
    const { user, signOut, loading: authLoading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState({
        watchlistCount: 0,
        historyCount: 0,
        memberSince: 'Loading...'
    });
    const [loading, setLoading] = useState(true);
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [isPortalConfigOpen, setIsPortalConfigOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'preferences'>('profile');
    const [isUploading, setIsUploading] = useState(false);
    const [status, setStatus] = useState<'active' | 'inactive'>('active');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [preferences, setPreferences] = useState({
        autoSync: true,
        neuralAlerts: true,
        visualGlow: false
    });

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        if (user?.user_metadata) {
            setPreferences({
                autoSync: user.user_metadata.autoSync ?? true,
                neuralAlerts: user.user_metadata.neuralAlerts ?? true,
                visualGlow: user.user_metadata.visualGlow ?? false
            });
        }

        const fetchStats = async () => {
            if (!user) return;
            try {
                const [watchlist, history] = await Promise.all([
                    watchlistService.getWatchlist(),
                    historyService.getContinueWatching()
                ]);

                setStats({
                    watchlistCount: watchlist?.length || 0,
                    historyCount: history?.length || 0,
                    memberSince: user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric'
                    }) : 'Ancient Times'
                });
            } catch (err: any) {
                console.error("Critical Profile Sync Failure:", JSON.stringify(err, null, 2) || err);
                setStats(prev => ({
                    ...prev,
                    memberSince: user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric'
                    }) : 'Linked Node'
                }));
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user, authLoading, router]);

    const handleAvatarSelect = async (url: string) => {
        try {
            await profileService.updateAvatar(url);
            setIsAvatarModalOpen(false);
            // In a real app, use a toast. For now, we rely on immediate UI update via auth context if supported, 
            // or a simple reload if needed. Supabase Auth state usually updates internally.
            window.location.reload();
        } catch (err) {
            alert('Failed to update avatar node');
        }
    };

    const togglePreference = async (key: keyof typeof preferences) => {
        const newValue = !preferences[key];
        const updatedPreferences = { ...preferences, [key]: newValue };

        // Optimistic update
        setPreferences(updatedPreferences);

        try {
            await profileService.updateMetadata({ [key]: newValue });
        } catch (err) {
            console.error('Failed to sync preference:', err);
            // Rollback on failure
            setPreferences(preferences);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            alert('File too large. Max 2MB.');
            return;
        }

        setIsUploading(true);
        try {
            await profileService.uploadAvatar(file);
            setIsAvatarModalOpen(false);
            window.location.reload();
        } catch (err: any) {
            console.error('Finalized Upload Error:', err);
            alert(`Neural Sync Failed: ${err.message || 'Unknown configuration error'}`);
        } finally {
            setIsUploading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#0f1011] flex flex-col items-center justify-center gap-6">
                <div className="relative w-24 h-24">
                    <div className="absolute inset-0 rounded-full border-4 border-brand-primary/10"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-brand-primary border-t-transparent animate-spin"></div>
                    <Logo className="absolute inset-3 w-16 h-16" variant="spinning" />
                </div>
                <p className="text-brand-primary font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">
                    Authenticating Neural Link...
                </p>
            </div>
        );
    }

    if (!user) return null;

    const menuItems = [
        { id: 'profile', label: 'Identity Settings', icon: User, color: 'text-blue-400', desc: 'Manage your platform alias and avatar' },
        { id: 'security', label: 'Security & Keys', icon: ShieldCheck, color: 'text-green-400', desc: '2FA, password management and session keys' },
        { id: 'notifications', label: 'Neural Alerts', icon: Bell, color: 'text-yellow-400', desc: 'Sync alerts for new episodes and releases' },
        { id: 'preferences', label: 'Mangekyou Prefs', icon: Zap, color: 'text-brand-primary', desc: 'Custom UI themes and viewing preferences' },
    ];

    const userAvatar = user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.email?.split('@')[0]}&background=b794f4&color=fff&bold=true&size=256`;

    return (
        <div className="min-h-screen bg-[#0f1011] pt-24 pb-20 relative overflow-hidden">
            {/* Background Atmosphere */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-900/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

            <div className="max-w-5xl mx-auto px-6 relative z-10">
                {/* Profile Header Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#121315]/80 backdrop-blur-2xl rounded-[2.5rem] border border-white/5 p-8 md:p-12 mb-10 overflow-hidden relative group"
                >
                    <div className="absolute top-0 right-0 p-8 flex flex-col items-end gap-3">
                        <Settings className="w-6 h-6 text-gray-700 hover:text-brand-primary hover:rotate-90 transition-all duration-700 cursor-pointer" onClick={() => setIsPortalConfigOpen(true)} />
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-10">
                        {/* Avatar */}
                        <div className="relative group/avatar">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-brand-primary/20 p-1.5 transition-all group-hover/avatar:border-brand-primary shadow-2xl relative">
                                <img
                                    src={userAvatar}
                                    alt="User Avatar"
                                    className="w-full h-full object-cover rounded-full"
                                />
                                <div
                                    className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                    onClick={() => setIsAvatarModalOpen(true)}
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <Camera className="w-6 h-6 text-brand-primary" />
                                        <span className="text-[10px] font-black uppercase text-white tracking-widest">Update</span>
                                    </div>
                                </div>
                            </div>
                            <div
                                className={`absolute -bottom-2 -right-2 w-10 h-10 ${status === 'active' ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]'} rounded-full border-4 border-[#121315] flex items-center justify-center text-black transition-all duration-500 z-20`}
                                title={`Identity Status: ${status === 'active' ? 'Active Network Connection' : 'Neural Link Idle'}`}
                            >
                                <Zap className={`w-5 h-5 fill-current ${status === 'active' ? 'animate-pulse' : ''}`} />
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-grow text-center md:text-left">
                            <div className="flex flex-col md:flex-row items-center gap-4 mb-2">
                                <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">
                                    {user.email?.split('@')[0]}
                                </h1>
                            </div>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6">
                                <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-widest">
                                    <Mail className="w-3.5 h-3.5" /> {user.email}
                                </div>
                                <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-white/10"></div>
                                <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-widest">
                                    <Calendar className="w-3.5 h-3.5" /> Joined {stats.memberSince}
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                <div className="px-6 py-2 bg-white/5 border border-white/5 rounded-full flex items-center gap-3">
                                    <span className="text-brand-primary font-black">{stats.watchlistCount}</span>
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">In Watchlist</span>
                                </div>
                                <div className="px-6 py-2 bg-white/5 border border-white/5 rounded-full flex items-center gap-3">
                                    <span className="text-brand-primary font-black">{stats.historyCount}</span>
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Episodes Observed</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Menu Items */}
                    <div className="lg:col-span-2 space-y-4">
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-6 px-4">Portal Configuration</h3>
                        {menuItems.map((item, idx) => (
                            <motion.button
                                key={item.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                onClick={() => {
                                    setActiveTab(item.id as any);
                                    setIsPortalConfigOpen(true);
                                }}
                                className={`w-full group bg-[#121315]/40 hover:bg-brand-primary/[0.03] border border-white/5 hover:border-brand-primary/20 p-6 rounded-3xl flex items-center gap-6 transition-all duration-300 text-left`}
                            >
                                <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                                    <item.icon className="w-7 h-7" />
                                </div>
                                <div className="flex-grow">
                                    <h4 className="text-sm font-black text-white uppercase tracking-widest mb-1 group-hover:text-brand-primary transition-colors">{item.label}</h4>
                                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">{item.desc}</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-brand-primary transition-colors" />
                            </motion.button>
                        ))}
                    </div>

                    {/* Quick Rewards / Status */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-6 px-4">Node Status</h3>

                        <div className="bg-[#121315]/40 border border-white/5 p-8 rounded-[2rem] relative overflow-hidden group">
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <Shield className="w-8 h-8 text-brand-primary" />
                                    <span className="text-[9px] font-black text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full uppercase tracking-widest">Premium Node</span>
                                </div>
                                <h4 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Alpha Member</h4>
                                <p className="text-xs text-gray-500 font-bold leading-relaxed mb-8 uppercase tracking-widest">
                                    Your account is fully synchronized with the Mangekyou network. You have priority access to all discovery nodes.
                                </p>
                                <div className="space-y-3">
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full w-4/5 bg-brand-primary rounded-full"></div>
                                    </div>
                                    <div className="flex justify-between text-[9px] font-black text-gray-500 uppercase tracking-widest">
                                        <span>Contribution Level</span>
                                        <span>80%</span>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl group-hover:bg-brand-primary/10 transition-colors duration-1000"></div>
                        </div>

                        <button
                            onClick={async () => {
                                await signOut();
                                router.push('/');
                            }}
                            className="w-full h-16 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-3xl font-black uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-3 transition-all group"
                        >
                            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            Disconnect Node
                        </button>
                    </div>
                </div>
            </div>

            {/* --- Modals --- */}

            <AnimatePresence>
                {/* Avatar Selection Modal */}
                {isAvatarModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-[#121315] border border-white/10 w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl relative"
                        >
                            <button
                                onClick={() => setIsAvatarModalOpen(false)}
                                className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="p-10">
                                <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Update Identity Node</h2>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-10">Choose a preset or upload a custom spectral image</p>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                                    {PRESET_AVATARS.map((avatar) => (
                                        <button
                                            key={avatar.id}
                                            onClick={() => handleAvatarSelect(avatar.url)}
                                            className="group relative flex flex-col items-center gap-4"
                                        >
                                            <div className="w-full aspect-square rounded-3xl overflow-hidden border-2 border-white/5 group-hover:border-brand-primary transition-all">
                                                <img src={avatar.url} alt={avatar.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] font-black text-white uppercase tracking-widest">{avatar.label}</p>
                                                <p className="text-[8px] font-bold text-brand-primary/60 uppercase tracking-tighter">{avatar.category}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <div className="pt-10 border-t border-white/5 flex flex-col items-center">
                                    <input
                                        type="file"
                                        hidden
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                        accept="image/*"
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                        className="px-10 py-5 bg-brand-primary hover:bg-[#cbb2f9] text-[#0f1011] font-black uppercase tracking-[0.2em] text-[11px] rounded-full shadow-[0_0_30px_rgba(183,148,244,0.3)] hover:shadow-[0_0_40px_rgba(183,148,244,0.5)] hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                                    >
                                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                        Initialize Custom Upload
                                    </button>
                                    <p className="text-[9px] text-brand-primary/60 font-black uppercase tracking-[0.25em] mt-6">Supported formats: JPG, PNG, WEBP (Max 2MB)</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Portal Configuration Modal */}
                {isPortalConfigOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="bg-[#0f1011] border-l border-white/5 w-full max-w-xl h-full absolute right-0 shadow-2xl overflow-y-auto"
                        >
                            <div className="p-10 md:p-14">
                                <div className="flex items-center justify-between mb-12">
                                    <button
                                        onClick={() => setIsPortalConfigOpen(false)}
                                        className="flex items-center gap-3 text-gray-500 hover:text-brand-primary transition-colors text-[10px] font-black uppercase tracking-widest"
                                    >
                                        <X className="w-5 h-5" /> Close Portal
                                    </button>
                                    <Logo className="w-8 h-8" />
                                </div>

                                <div className="space-y-12">
                                    <section>
                                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-4">
                                            <span className="w-1.5 h-8 bg-brand-primary rounded-full"></span>
                                            Account / Portal Configuration
                                        </h2>

                                        <div className="space-y-6">
                                            <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Neural Address</p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-bold text-white tracking-widest">{user.email}</span>
                                                    <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[8px] font-black rounded-full border border-green-500/20 uppercase">Verified</span>
                                                </div>
                                            </div>

                                            <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Unique ID Instance</p>
                                                <code className="text-[11px] text-brand-primary/80 font-mono break-all opacity-60">
                                                    {user.id}
                                                </code>
                                            </div>

                                            <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Subscription Node</p>
                                                <div className="flex items-center gap-4">
                                                    <Zap className="w-6 h-6 text-brand-primary" />
                                                    <div>
                                                        <p className="text-sm font-black text-white uppercase tracking-widest">Alpha Access</p>
                                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Syncing since {stats.memberSince}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <section>
                                        <h3 className="text-xs font-black text-white uppercase tracking-[0.4em] mb-6 px-2">Preference Configuration</h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            {[
                                                { id: 'autoSync', label: 'Auto-Sync Episodes', desc: 'Automatically progress to next node', active: preferences.autoSync },
                                                { id: 'neuralAlerts', label: 'Neural Alerts', desc: 'Receive mental pings for new releases', active: preferences.neuralAlerts },
                                                { id: 'visualGlow', label: 'Visual Glow', desc: 'Enable secondary branding FX', active: preferences.visualGlow },
                                            ].map((pref) => (
                                                <button
                                                    key={pref.id}
                                                    onClick={() => togglePreference(pref.id as keyof typeof preferences)}
                                                    className="p-6 bg-[#121315] hover:bg-brand-primary/[0.03] border border-white/5 rounded-3xl flex items-center justify-between transition-all group"
                                                >
                                                    <div className="text-left">
                                                        <p className="text-[11px] font-black text-white uppercase tracking-widest mb-1">{pref.label}</p>
                                                        <p className="text-[9px] text-gray-600 font-bold uppercase">{pref.desc}</p>
                                                    </div>
                                                    <div className={`w-10 h-5 rounded-full relative transition-all duration-300 ${pref.active ? 'bg-brand-primary shadow-[0_0_15px_rgba(183,148,244,0.6)]' : 'bg-white/10'}`}>
                                                        <div className={`absolute top-1 w-3 h-3 rounded-full transition-all duration-300 ${pref.active ? 'right-1 bg-[#0f1011] scale-110' : 'left-1 bg-gray-600'}`}></div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </section>

                                    <div className="pt-10 flex gap-4">
                                        <button
                                            onClick={() => setIsPortalConfigOpen(false)}
                                            className="flex-grow h-14 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl border border-white/5 transition-all"
                                        >
                                            Cancel Changes
                                        </button>
                                        <button
                                            className="flex-grow h-14 bg-brand-primary text-black font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-brand-primary/20 hover:scale-[1.02] transition-all"
                                            onClick={() => {
                                                alert('Neural preferences synchronized successfully');
                                                setIsPortalConfigOpen(false);
                                            }}
                                        >
                                            Save Node Data
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
