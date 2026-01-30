import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import Logo from '../components/Logo';

const RegisterComponent = () => {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Check if user is already logged in
        const checkAuth = async () => {
            try {
                // Check if Supabase is properly configured
                if (!supabase) {
                    console.warn('Supabase not configured. Skipping auth check.');
                    return;
                }
                
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    router.push('/');
                }
            } catch (error) {
                console.error('Auth check failed:', error);
            }
        };
        checkAuth();
    }, [router]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (!supabase) {
                throw new Error('Supabase not configured');
            }

            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: name
                    }
                }
            });

            if (error) throw error;

            router.push('/login');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f1011] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Logo />
                    <h1 className="text-2xl font-black text-white uppercase mt-4">Join the <span className="text-brand-primary">Verse</span></h1>
                    <p className="text-gray-400 mt-2">Create your account to start watching</p>
                </div>

                <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8">
                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-6">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-6">
                        <div>
                            <input
                                type="text"
                                placeholder="Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-[#0f1011] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-brand-primary focus:outline-none transition-colors"
                                required
                            />
                        </div>

                        <div>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#0f1011] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-brand-primary focus:outline-none transition-colors"
                                required
                            />
                        </div>

                        <div>
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#0f1011] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-brand-primary focus:outline-none transition-colors"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-brand-primary hover:bg-brand-primary/90 text-black font-black uppercase py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-400">
                            Already have an account?{' '}
                            <a href="/login" className="text-brand-primary hover:underline">
                                Sign In
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Register = dynamic(() => Promise.resolve(RegisterComponent), { ssr: false });

export default Register;
