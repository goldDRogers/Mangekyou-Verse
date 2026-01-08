
import React, { useState, useEffect } from 'react';
import { Anime } from '../types';
import { useNavigate } from 'react-router-dom';

interface HeroSliderProps {
  items: Anime[];
}

const HeroSlider: React.FC<HeroSliderProps> = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [items.length]);

  if (items.length === 0) return null;

  const activeItem = items[currentIndex];

  return (
    <div className="relative h-[500px] md:h-[650px] w-full overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
      {/* Background Layer */}
      <div className="absolute inset-0">
        <img 
          src={activeItem.thumbnail} 
          alt={activeItem.title} 
          className="w-full h-full object-cover scale-110 blur-2xl opacity-40 transition-all duration-[2000ms]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f1011] via-[#0f1011]/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1011] via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[#0f1011]/40"></div>
      </div>

      {/* Main Content Area */}
      <div className="relative h-full max-w-7xl mx-auto px-6 md:px-12 flex items-center z-10" key={currentIndex}>
        <div className="max-w-3xl animate-fade-in space-y-8">
          <div className="flex items-center gap-4">
             <span className="bg-brand-primary text-[#0f1011] font-black text-[10px] tracking-[0.3em] uppercase px-4 py-2 rounded-full shadow-lg shadow-brand-primary/20">
               Spotlight #{currentIndex + 1}
             </span>
             <div className="h-[2px] w-16 bg-gradient-to-r from-brand-primary to-transparent rounded-full"></div>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white leading-[0.9] drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] tracking-tighter uppercase">
            {activeItem.title}
          </h1>

          <div className="flex items-center gap-6 text-[11px] font-black uppercase tracking-widest text-gray-400">
             <div className="flex items-center gap-2 text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-lg border border-brand-primary/20">
               <i className="fa-solid fa-star"></i>
               <span>{activeItem.rating}</span>
             </div>
             <span className="flex items-center gap-2"><i className="fa-solid fa-circle text-[4px] text-gray-700"></i> {activeItem.type}</span>
             <span className="flex items-center gap-2"><i className="fa-solid fa-circle text-[4px] text-gray-700"></i> {activeItem.episodes} Episodes</span>
             <span className="flex items-center gap-2 text-gray-500"><i className="fa-solid fa-circle text-[4px] text-gray-700"></i> High Definition</span>
          </div>

          <p className="text-gray-300 text-lg md:text-xl leading-relaxed max-w-2xl font-medium opacity-80 line-clamp-3">
            {activeItem.description}
          </p>

          <div className="flex flex-wrap gap-5 pt-4">
            <button 
              onClick={() => navigate(`/watch/${activeItem.id}`)}
              className="group flex items-center gap-4 bg-brand-primary hover:bg-[#cbb2f9] text-[#0f1011] px-10 py-5 rounded-[24px] font-black uppercase tracking-widest text-xs transition-all transform hover:scale-110 active:scale-95 shadow-2xl shadow-brand-primary/30"
            >
              <i className="fa-solid fa-play-circle text-lg"></i>
              Watch Now
            </button>
            <button className="flex items-center gap-4 bg-white/5 hover:bg-white/10 text-white px-10 py-5 rounded-[24px] font-black uppercase tracking-widest text-xs transition-all border border-white/10 backdrop-blur-md">
              <i className="fa-solid fa-info-circle text-lg"></i>
              Detail
            </button>
          </div>
        </div>
        
        {/* Large Floating Poster Image */}
        <div className="hidden lg:block ml-auto w-[400px] aspect-[3/4.5] rounded-[48px] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)] border-4 border-white/10 transform rotate-3 hover:rotate-0 transition-all duration-[1500ms] group/poster relative">
          <img src={activeItem.thumbnail} alt={activeItem.title} className="w-full h-full object-cover group-hover/poster:scale-110 transition-transform duration-[2000ms]" />
          <div className="absolute inset-0 bg-brand-primary/10 opacity-0 group-hover/poster:opacity-100 transition-opacity"></div>
        </div>
      </div>

      {/* Modern Slider Navigation */}
      <div className="absolute bottom-12 right-12 flex items-center gap-6 z-20">
        <div className="flex gap-3">
          {items.map((_, idx) => (
            <button 
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all duration-500 ${currentIndex === idx ? 'bg-brand-primary w-12 shadow-[0_0_15px_rgba(183,148,244,0.8)]' : 'bg-white/10 w-2 hover:bg-white/30'}`}
            />
          ))}
        </div>
        <div className="flex gap-2">
           <button 
            onClick={() => setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-brand-primary hover:text-[#0f1011] border border-white/10 transition-all"
           >
             <i className="fa-solid fa-chevron-left"></i>
           </button>
           <button 
            onClick={() => setCurrentIndex((prev) => (prev + 1) % items.length)}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-brand-primary hover:text-[#0f1011] border border-white/10 transition-all"
           >
             <i className="fa-solid fa-chevron-right"></i>
           </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSlider;
