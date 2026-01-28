import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import Logo from '../components/Logo';

const Register: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (user) return;

        setLoading(true);
        setLocalError(null);

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        display_name: name,
                    }
                }
            });

            if (error) {
                setLocalError(error.message);
            } else if (data.user && data.session) {
                // Immediate login success
                navigate('/');
            } else if (data.user) {
                // Email confirmation might be required
                setLocalError('Success! Please check your email to confirm your account.');
            }
        } catch (err: any) {
            setLocalError('An error occurred during registration.');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#0f1011] flex items-center justify-center">
                <div className="animate-pulse text-brand-primary font-black uppercase tracking-widest">Loading Verse...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f1011] flex items-center justify-center relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-brand-primary blur-[150px] rounded-full"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand-secondary blur-[150px] rounded-full"></div>
            </div>

            <div className="relative z-10 w-full max-w-md p-8 bg-brand-card/50 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
                <div className="flex flex-col items-center mb-8">
                    <Logo className="w-16 h-16 mb-4 animate-spin-slow" />
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Join The Order</h2>
                    <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mt-2">
                        {user ? 'You are already a member' : 'Begin your ninja way'}
                    </p>
                </div>

                {user ? (
                    <div className="text-center space-y-6">
                        <div className="p-4 bg-brand-primary/10 border border-brand-primary/30 rounded-xl text-brand-primary text-sm font-bold">
                            You are already logged in as <span className="text-white">{user.email}</span>.
                            <br />Logout to create a new account.
                        </div>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full bg-white/5 hover:bg-white/10 text-white font-black py-4 rounded-xl uppercase tracking-widest transition-all"
                        >
                            Return to Home
                        </button>
                    </div>
                ) : (
                    <>
                        {localError && (
                            <div className={`mb-6 p-4 rounded-xl text-sm font-bold text-center ${localError.includes('Success') ? 'bg-green-500/20 border border-green-500/50 text-green-200' : 'bg-red-500/20 border border-red-500/50 text-red-200'}`}>
                                {localError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Ninja Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-[#0f1011] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                                    placeholder="Naruto Uzumaki"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-[#0f1011] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                                    placeholder="shinobi@konoha.com"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#0f1011] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-brand-primary hover:bg-[#cbb2f9] text-[#0f1011] font-black py-4 rounded-xl uppercase tracking-widest transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-primary/20"
                            >
                                {loading ? 'Awakening...' : 'Awaken Mangekyou'}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-gray-500 text-sm">
                                Already have an account?{' '}
                                <Link to="/login" className="text-brand-primary font-bold hover:text-white transition-colors">
                                    Login here
                                </Link>
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Register;
