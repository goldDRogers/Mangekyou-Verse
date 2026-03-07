"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabaseClient';
import Logo from '@/components/Logo';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Loader2, Github, Chrome } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get('redirectedFrom') || '/';

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) throw authError;

      router.push(redirectedFrom);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'github' | 'google') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(`Social login failed: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1011] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Cinematic Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-secondary/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-[#121315]/80 backdrop-blur-2xl p-8 md:p-10 rounded-[2.5rem] border border-white/5 shadow-2xl relative">
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-10">
            <Link href="/" className="group mb-4">
              <Logo className="w-16 h-16 transition-all duration-700 group-hover:rotate-[360deg]" />
            </Link>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
              Welcome <span className="text-brand-primary">Back</span>
            </h1>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mt-2">
              Access the Mangekyou Node
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold uppercase tracking-wider text-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Email Address</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-primary transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="itachi@uchicha.com"
                  className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl pl-14 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/50 transition-all placeholder:text-gray-600"
                />
              </div>
              {errors.email && <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider ml-4">{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-4 mr-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Secret Key</label>
                <Link href="/forgot-password" className="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:text-white transition-colors">
                  Forgot?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-primary transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl pl-14 pr-14 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/50 transition-all placeholder:text-gray-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider ml-4">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-gradient-to-r from-brand-primary to-[#8b5cf6] hover:from-[#cbb2f9] hover:to-[#a78bfa] text-[#0f1011] font-black uppercase tracking-[0.3em] text-[11px] rounded-2xl shadow-[0_0_20px_rgba(183,148,244,0.3)] hover:shadow-[0_0_30px_rgba(183,148,244,0.5)] flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Authorize Entry <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="h-[1px] flex-grow bg-white/5"></div>
            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest whitespace-nowrap">OR SYNC NODE</span>
            <div className="h-[1px] flex-grow bg-white/5"></div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleSocialLogin('github')}
              className="h-14 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center gap-3 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all border-b-2 border-transparent hover:border-brand-primary/30"
            >
              <Github className="w-5 h-5" /> GitHub
            </button>
            <button
              onClick={() => handleSocialLogin('google')}
              className="h-14 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center gap-3 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all border-b-2 border-transparent hover:border-brand-primary/30"
            >
              <Chrome className="w-5 h-5" /> Google
            </button>
          </div>

          <p className="mt-10 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">
            New to the verse?{' '}
            <Link href="/register" className="text-brand-primary hover:text-white transition-colors">
              Initialize Account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
