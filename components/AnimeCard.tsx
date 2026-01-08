
import React from 'react';
import { Link } from 'react-router-dom';
import { Anime } from '../types';

interface AnimeCardProps {
  anime: Anime;
}

const AnimeCard: React.FC<AnimeCardProps> = ({ anime }) => {
  return (
    <Link to={`/watch/${anime.id}`} className="group block relative animate-slide-up">
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-brand-card border border-white/5 group-hover:border-brand-accent/50 transition-all duration-300">
        <img 
          src={anime.thumbnail} 
          alt={anime.title}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        
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

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <div className="bg-brand-accent text-white rounded-full w-10 h-10 flex items-center justify-center self-center mb-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <i className="fa-solid fa-play text-lg"></i>
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
        <h3 className="text-sm font-bold text-gray-100 group-hover:text-brand-accent transition-colors line-clamp-1">
          {anime.title}
        </h3>
        <p className="text-[11px] text-gray-500 mt-1">
          {anime.status} • {anime.type}
        </p>
      </div>
    </Link>
  );
};

export default AnimeCard;
