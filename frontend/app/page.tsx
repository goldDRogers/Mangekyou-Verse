import React from 'react';
import { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
    title: 'Home | Mangekyou Verse - Discover Your Next Favorite Anime',
    description: 'Mangekyou Verse is the most advanced anime discovery platform. Search, track, and explore thousands of anime titles with high-performance metadata from Jikan, AniList, and Kitsu.',
    openGraph: {
        title: 'Mangekyou Verse | The Ultimate Anime Discovery Platform',
        description: 'Explore, discover, and track your favorite anime with the most advanced discovery engine.',
        url: 'https://mangekyouversee.vercel.app/',
        siteName: 'Mangekyou Verse',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Mangekyou Verse Home',
            },
        ],
        type: 'website',
    },
};

export default function Page() {
    // JSON-LD for Website
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Mangekyou Verse',
        url: 'https://mangekyouversee.vercel.app/',
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: 'https://mangekyouversee.vercel.app/search?q={search_term_string}'
            },
            'query-input': 'required name=search_term_string'
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <HomeClient />
        </>
    );
}
