"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Anime } from '../types';
import { createWatchRedirectHandler, getExternalSiteInfo } from '../lib/externalRedirect';

interface AnimeCardProps {
  anime: Anime;
  showDetailsLink?: boolean;
  malId?: number; // MyAnimeList ID for better direct linking
  size?: 'sm' | 'md' | 'lg';
}

const AnimeCardComponent: React.FC<AnimeCardProps> = ({ anime, showDetailsLink = true, malId, size = 'md' }) => {
  const handleWatchClick = createWatchRedirectHandler(anime.title, malId);
  const externalSite = getExternalSiteInfo();
  const [imageError, setImageError] = React.useState(false);

  const isSmall = size === 'sm';

  return (
    <div className="group block relative animate-slide-up" aria-label={`Anime card for ${anime.title}`}>
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-brand-card border border-white/5 group-hover:border-brand-accent/50 transition-all duration-300 shadow-lg">
        {imageError ? (
          <div className="w-full h-full bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 flex items-center justify-center">
            <div className="text-center">
              <i className="fa-solid fa-image text-4xl text-brand-primary/50 mb-2"></i>
              <p className="text-xs text-gray-400 uppercase tracking-wider">No Image</p>
            </div>
          </div>
        ) : (
          <Image
            src={anime.thumbnail || '/placeholder-anime.png'}
            alt={anime.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 anime-poster"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          <span className="bg-brand-accent text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md uppercase tracking-tighter">
            {anime.type}
          </span>
          <span className="bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md uppercase tracking-tighter">
            Ep {anime.episodes || '?'}
          </span>
        </div>

        {/* Rating */}
        <div className="absolute top-2 right-2 z-10">
          <span className="bg-yellow-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
            <i className="fa-solid fa-star"></i>
            {anime.rating}
          </span>
        </div>

        {/* Overlay with External Watch Button */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <button
            onClick={handleWatchClick}
            className="bg-brand-primary hover:bg-white text-black rounded-full w-12 h-12 flex items-center justify-center self-center mb-6 translate-y-4 group-hover:translate-y-0 transition-all duration-500 shadow-[0_0_30px_rgba(183,148,244,0.3)] hover:scale-110 active:scale-95"
            title={`Watch ${anime.title} on ${externalSite?.name || 'external site'}`}
            aria-label={`Watch ${anime.title} on ${externalSite?.name || 'external platform'}`}
          >
            <i className={`${externalSite?.icon || 'fa-solid fa-play'} text-lg`}></i>
          </button>

          <div className="text-center mb-4">
            <span className="text-[10px] text-brand-primary font-black uppercase tracking-[0.2em] animate-pulse">
              Play Node
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-2 justify-center">
            {anime.genres.slice(0, 2).map(genre => (
              <span key={genre} className="text-[9px] font-black uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded-full text-white/80 border border-white/5">
                {genre}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4">
        {showDetailsLink ? (
          <Link href={`/watch/${anime.id}`} className="block group/title">
            <h3 className={`${isSmall ? 'text-[12px]' : 'text-[13px]'} font-black text-gray-100 group-hover/title:text-brand-primary transition-colors line-clamp-1 uppercase tracking-tight`}>
              {anime.title}
            </h3>
          </Link>
        ) : (
          <h3 className={`${isSmall ? 'text-[12px]' : 'text-[13px]'} font-black text-gray-100 line-clamp-1 uppercase tracking-tight`}>
            {anime.title}
          </h3>
        )}
        <div className="flex items-center gap-2 mt-1.5">
          <span className={`${isSmall ? 'text-[9px]' : 'text-[10px]'} font-black text-gray-600 uppercase tracking-widest`}>
            {anime.status}
          </span>
          <span className="w-1 h-1 bg-gray-800 rounded-full" />
          <span className={`${isSmall ? 'text-[9px]' : 'text-[10px]'} font-black text-brand-primary/60 uppercase tracking-widest`}>
            {anime.type}
          </span>
        </div>
      </div>
    </div>
  );
};

// Memoize component to prevent unnecessary re-renders in large lists
export const AnimeCard = React.memo(AnimeCardComponent);
export default AnimeCard;
