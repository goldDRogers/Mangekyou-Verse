"use client";

import React from 'react';
import Link from 'next/link';
import { Anime } from '../types';
import { createWatchRedirectHandler, getExternalSiteInfo } from '../lib/externalRedirect';

interface AnimeCardProps {
  anime: Anime;
  showDetailsLink?: boolean;
  malId?: number; // MyAnimeList ID for better direct linking
}

const AnimeCard: React.FC<AnimeCardProps> = ({ anime, showDetailsLink = true, malId }) => {
  const handleWatchClick = createWatchRedirectHandler(anime.title, malId);
  const externalSite = getExternalSiteInfo();
  const [imageError, setImageError] = React.useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="group block relative animate-slide-up">
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-brand-card border border-white/5 group-hover:border-brand-accent/50 transition-all duration-300">
        {imageError ? (
          <div className="w-full h-full bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 flex items-center justify-center">
            <div className="text-center">
              <i className="fa-solid fa-image text-4xl text-brand-primary/50 mb-2"></i>
              <p className="text-xs text-gray-400 uppercase tracking-wider">No Image</p>
            </div>
          </div>
        ) : (
          <img
            src={anime.thumbnail}
            alt={anime.title}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
            onError={handleImageError}
          />
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          <span className="bg-brand-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
            {anime.type}
          </span>
          <span className="bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
            Ep {anime.episodes}
          </span>
        </div>

        {/* Rating */}
        <div className="absolute top-2 right-2 z-10">
          <span className="bg-yellow-500/90 text-black text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
            <i className="fa-solid fa-star"></i>
            {anime.rating}
          </span>
        </div>

        {/* Overlay with External Watch Button */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          {/* External Watch Button */}
          <button
            onClick={handleWatchClick}
            className="bg-brand-accent hover:bg-brand-accent/90 text-white rounded-full w-12 h-12 flex items-center justify-center self-center mb-4 translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110"
            title={`Watch on ${externalSite?.name || 'external site'}`}
          >
            <i className={`${externalSite?.icon || 'fa-solid fa-external-link-alt'} text-lg`}></i>
          </button>
          
          {/* External Site Label */}
          <div className="text-center mb-3">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">
              Watch on external site
            </span>
          </div>

          <div className="flex flex-wrap gap-1 mt-2">
            {anime.genres.slice(0, 2).map(genre => (
              <span key={genre} className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-white/80">
                {genre}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3">
        {showDetailsLink ? (
          <Link href={`/watch/${anime.id}`} className="block">
            <h3 className="text-sm font-bold text-gray-100 group-hover:text-brand-accent transition-colors line-clamp-1">
              {anime.title}
            </h3>
          </Link>
        ) : (
          <h3 className="text-sm font-bold text-gray-100 line-clamp-1">
            {anime.title}
          </h3>
        )}
        <p className="text-[11px] text-gray-500 mt-1">
          {anime.status} • {anime.type}
        </p>
      </div>
    </div>
  );
};

export default AnimeCard;
