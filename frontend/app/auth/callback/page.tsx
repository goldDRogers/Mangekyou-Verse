"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Logo from '@/components/Logo';

export default function AuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        const handleAuthCallback = async () => {
            const { error } = await supabase.auth.getSession();
            if (error) {
                console.error('Error during auth callback:', error.message);
                router.push('/login?error=auth-callback-failed');
            } else {
                router.push('/');
            }
        };

        handleAuthCallback();
    }, [router]);

    return (
        <div className="min-h-screen bg-[#0f1011] flex items-center justify-center">
            <div className="flex flex-col items-center gap-6">
                <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full border-4 border-brand-primary/10"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-brand-primary border-t-transparent animate-spin"></div>
                    <Logo className="absolute inset-2 w-16 h-16" variant="spinning" />
                </div>
                <p className="text-brand-primary font-black uppercase tracking-[0.4em] text-xs animate-pulse">
                    Synchronizing Node Identity...
                </p>
            </div>
        </div>
    );
}
