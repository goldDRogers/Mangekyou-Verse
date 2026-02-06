"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Heart, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

const NAV_ITEMS = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/search', icon: Search, label: 'Search' },
    { href: '/watchlist', icon: Heart, label: 'Watchlist' },
    { href: '/account', icon: User, label: 'Profile' },
];

export const MobileBottomNav: React.FC = () => {
    const pathname = usePathname();

    return (
        <nav className="
            fixed bottom-0 left-0 right-0 z-40
            md:hidden
            bg-black/95 backdrop-blur-xl
            border-t border-white/10
            safe-area-inset-bottom
        ">
            <div className="flex items-center justify-around px-2 py-2">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== '/' && pathname?.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="relative flex flex-col items-center justify-center flex-1 py-2 group"
                        >
                            {/* Active indicator */}
                            {isActive && (
                                <motion.div
                                    layoutId="mobileNavIndicator"
                                    className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-12 h-1 bg-brand-primary rounded-full"
                                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                />
                            )}

                            {/* Icon */}
                            <div className={clsx(
                                "relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300",
                                isActive
                                    ? "bg-brand-primary/20 text-brand-primary scale-110"
                                    : "text-gray-400 group-hover:text-white group-hover:bg-white/5"
                            )}>
                                <Icon className="w-5 h-5" />

                                {/* Glow effect on active */}
                                {isActive && (
                                    <div className="absolute inset-0 bg-brand-primary/20 rounded-xl blur-lg -z-10" />
                                )}
                            </div>

                            {/* Label */}
                            <span className={clsx(
                                "text-[10px] font-bold uppercase tracking-wider mt-1 transition-colors duration-300",
                                isActive ? "text-brand-primary" : "text-gray-500 group-hover:text-gray-300"
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};

export default MobileBottomNav;
