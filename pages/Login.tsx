import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { loginUser, status, error } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await loginUser({ email, password });
            navigate('/');
        } catch (err) {
            console.error('Login failed');
        }
    };

    return (
        <div className="min-h-screen bg-[#0f1011] flex items-center justify-center relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand-primary blur-[150px] rounded-full"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-brand-secondary blur-[150px] rounded-full"></div>
            </div>

            <div className="relative z-10 w-full max-w-md p-8 bg-brand-card/50 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
                <div className="flex flex-col items-center mb-8">
                    <Logo className="w-16 h-16 mb-4 animate-spin-slow" />
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Welcome Back</h2>
                    <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mt-2">Access the Mangekyou Verse</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm font-bold text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
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
                        disabled={status === 'loading'}
                        className="w-full bg-brand-primary hover:bg-[#cbb2f9] text-[#0f1011] font-black py-4 rounded-xl uppercase tracking-widest transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-primary/20"
                    >
                        {status === 'loading' ? 'Authenticating...' : 'Enter the Verse'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-gray-500 text-sm">
                        New to the village?{' '}
                        <Link to="/register" className="text-brand-primary font-bold hover:text-white transition-colors">
                            Register here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
