"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export const BackToTop: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 500) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    transition={{ duration: 0.2 }}
                    onClick={scrollToTop}
                    className="
                        fixed bottom-8 right-8 z-[100]
                        w-14 h-14 rounded-full
                        bg-brand-primary text-white
                        flex items-center justify-center
                        shadow-[0_0_40px_rgba(183,148,244,0.6)]
                        hover:shadow-[0_0_60px_rgba(183,148,244,0.9)]
                        hover:bg-brand-secondary
                        hover:scale-110
                        active:scale-95
                        transition-all duration-300
                        group
                        animate-pulse-glow
                    "
                    aria-label="Back to top"
                >
                    <ArrowUp className="w-7 h-7 group-hover:animate-bounce" />
                </motion.button>
            )}
        </AnimatePresence>
    );
};

export default BackToTop;
