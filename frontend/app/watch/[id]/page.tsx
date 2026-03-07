import React from 'react';
import { Metadata, ResolvingMetadata } from 'next';
import { jikanService } from '@/services/jikanService';
import WatchClient from './WatchClient';
import { Anime } from '@/types';

type Props = {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// Next.js App Router dynamic metadata for individual anime pages
export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { id } = await params;

    try {
        const anime = await jikanService.getAnimeDetails(id);

        if (!anime) {
            return {
                title: 'Anime Not Found',
            };
        }

        const previousImages = (await parent).openGraph?.images || [];

        return {
            title: anime.title,
            description: anime.description?.slice(0, 160) + '...',
            keywords: [...anime.genres, 'anime', 'watch anime', 'mangekyou verse'],
            openGraph: {
                title: `${anime.title} | Mangekyou Verse`,
                description: anime.description?.slice(0, 200),
                url: `https://mangekyouversee.vercel.app/watch/${id}`,
                images: [
                    {
                        url: anime.thumbnail,
                        width: 400,
                        height: 600,
                        alt: anime.title,
                    },
                    ...previousImages,
                ],
                type: 'video.other',
            },
            twitter: {
                card: 'summary_large_image',
                title: anime.title,
                description: anime.description?.slice(0, 200),
                images: [anime.thumbnail],
            },
        };
    } catch (error) {
        console.error("SEO Metadata fetch failed", error);
        return {
            title: 'Anime Details',
        };
    }
}

export default async function Page({ params }: Props) {
    const { id } = await params;
    let anime: Anime | null = null;

    try {
        anime = await jikanService.getAnimeDetails(id);
    } catch (error) {
        console.error("Initial data fetch failed", error);
    }

    // JSON-LD Structured Data for Google Indexing
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Movie',
        name: anime?.title || 'Anime',
        description: anime?.description,
        image: anime?.thumbnail,
        genre: anime?.genres,
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: anime?.rating || '0',
            bestRating: '10',
            worstRating: '1',
            ratingCount: anime?.popularity || '0',
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <WatchClient id={id} initialData={anime} />
        </>
    );
}
