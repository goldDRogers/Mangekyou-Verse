
import React, { useEffect, useState, useRef } from 'react';
import AnimeCard from '../components/AnimeCard';
import HeroSlider from '../components/HeroSlider';
import Logo from '../components/Logo';
import ParticleGrid from '../components/ParticleGrid';
import { generateAnimeList } from '../services/geminiService';
import { Anime } from '../types';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const [topAiring, setTopAiring] = useState<Anime[]>([]);
  const [spotlight, setSpotlight] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<any[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Sample data for suggestions
  const sampleSuggestions = [
    { id: 'naruto-1', title: 'Road of Naruto', original: 'Road of Naruto', date: 'Oct 3, 2022', type: 'ONA', duration: '9m', thumbnail: 'https://picsum.photos/seed/n1/100/150' },
    { id: 'boruto-1', title: 'Boruto: Naruto Next Generations', original: 'Boruto: Naruto Next Generations', date: 'Apr 5, 2017', type: 'TV', duration: '23m', thumbnail: 'https://picsum.photos/seed/b1/100/150' },
    { id: 'naruto-2', title: 'Naruto: Find the Crimson Four-leaf Clover!', original: 'Naruto: Akaki Yotsuba no Clover wo Sagase', date: 'May 24, 2003', type: 'Special', duration: '17m', thumbnail: 'https://picsum.photos/seed/n2/100/150' },
    { id: 'naruto-3', title: 'Naruto OVA5: Naruto, The Genie, and The Three Wishes!!', original: 'Naruto Soyokazeden Movie: Naruto to Mashin no...', date: 'Jul 31, 2010', type: 'OVA', duration: '14m', thumbnail: 'https://picsum.photos/seed/n3/100/150' },
    { id: 'naruto-4', title: 'Naruto OVA3: Hidden Leaf Village Grand Sports Festival', original: 'Naruto: Dai Katsugeki!! Yuki Hime Shinobu...', date: 'Aug 21, 2004', type: 'Special', duration: '11m', thumbnail: 'https://picsum.photos/seed/n4/100/150' },
  ];

  const topSearches = [
    "Jujutsu Kaisen: The Culling...",
    "Sentenced to Be a Hero",
    "Jujutsu Kaisen 2nd Season",
    "One Piece",
    "Demon Slayer: Kimetsu no...",
    "Solo Leveling",
    "Chainsaw Man Movie",
    "The Demon King's Daughte...",
    "Frieren: Beyond Journey's End"
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fullList = await generateAnimeList(18);
        setSpotlight(fullList.slice(0, 6));
        setTopAiring(fullList.slice(6));
      } catch (err) {
        console.error("Failed to load content", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const filtered = sampleSuggestions.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToContent = () => {
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8 bg-brand-bg">
        <div className="relative w-32 h-32">
           <div className="absolute inset-0 rounded-full border-4 border-brand-primary/10 shadow-[0_0_50px_rgba(183,148,244,0.1)]"></div>
           <div className="absolute inset-0 rounded-full border-4 border-brand-primary border-t-transparent animate-spin"></div>
           <Logo className="absolute inset-4 w-24 h-24 animate-pulse-glow" />
        </div>
        <p className="text-brand-primary font-black uppercase tracking-[0.5em] text-xs animate-pulse">Initializing Rinnegan Node...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0f1011] overflow-x-hidden">
      {/* Search Landing */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Whole Page Interactive Particle Grid */}
        <div className="absolute inset-0 z-0">
          <ParticleGrid />
        </div>

        {/* Dynamic Background Collage */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
           <div className="absolute inset-y-0 right-[-10%] w-[120%] flex gap-6 grayscale opacity-40">
              <img src="https://images3.alphacoders.com/131/1314352.png" className="h-full w-1/5 object-cover skew-x-[-15deg] scale-110" alt="bg-1" />
              <img src="https://images.alphacoders.com/134/1341498.png" className="h-full w-1/5 object-cover skew-x-[-15deg] scale-110" alt="bg-2" />
              <img src="https://images.alphacoders.com/133/1330368.png" className="h-full w-1/5 object-cover skew-x-[-15deg] scale-110" alt="bg-3" />
              <img src="https://images2.alphacoders.com/132/1320490.png" className="h-full w-1/5 object-cover skew-x-[-15deg] scale-110" alt="bg-4" />
              <img src="https://images8.alphacoders.com/133/1333798.png" className="h-full w-1/5 object-cover skew-x-[-15deg] scale-110" alt="bg-5" />
           </div>
           {/* Gradient Shadows */}
           <div className="absolute inset-0 bg-gradient-to-r from-[#0f1011] via-[#0f1011]/80 to-transparent"></div>
           <div className="absolute inset-0 bg-gradient-to-t from-[#0f1011] to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full pt-10">
          <div className="max-w-2xl space-y-12 animate-fade-in">
            {/* Project Branding */}
            <div className="relative flex items-center gap-10 group cursor-default">
              <div className="relative z-20 flex items-center gap-10">
                <Logo className="w-40 h-40 transform rotate-12 group-hover:rotate-0 transition-all duration-1000 animate-spin-slow" />
                <h1 className="text-7xl md:text-9xl font-black text-white tracking-tighter uppercase leading-[0.75] drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)]">
                  Mangekyou<br /><span className="text-brand-primary">Verse</span>
                </h1>
              </div>
            </div>

            {/* Premium Search Bar with Suggestions */}
            <div className="relative" ref={searchContainerRef}>
              <form onSubmit={handleSearchSubmit} className="flex gap-4">
                <input 
                  type="text" 
                  placeholder="What are you looking for today?" 
                  className="w-full h-16 md:h-24 bg-white rounded-[32px] px-12 text-black text-2xl font-bold focus:outline-none focus:ring-[12px] focus:ring-brand-primary/20 transition-all shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length > 0 && setShowSuggestions(true)}
                />
                <button type="submit" className="w-16 h-16 md:w-24 md:h-24 bg-brand-primary rounded-[32px] flex items-center justify-center text-[#0f1011] text-4xl hover:bg-[#cbb2f9] transition-all transform hover:scale-105 active:scale-95 shadow-2xl shadow-brand-primary/40">
                  <i className="fa-solid fa-magnifying-glass"></i>
                </button>
              </form>

              {/* Suggestions Dropdown */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-4 bg-[#2a2b3c]/95 backdrop-blur-xl rounded-[32px] border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.8)] overflow-hidden z-[100] animate-fade-in">
                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {filteredSuggestions.map((item) => (
                      <div 
                        key={item.id}
                        onClick={() => {
                          navigate(`/watch/${item.id}`);
                          setShowSuggestions(false);
                        }}
                        className="flex items-center gap-6 p-4 hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-none transition-colors group"
                      >
                        <img 
                          src={item.thumbnail} 
                          alt={item.title} 
                          className="w-14 h-20 rounded-xl object-cover shadow-lg border border-white/10 group-hover:scale-105 transition-transform" 
                        />
                        <div className="flex flex-col gap-1">
                          <h4 className="text-lg font-black text-white group-hover:text-brand-primary transition-colors leading-tight">{item.title}</h4>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest line-clamp-1">{item.original}</p>
                          <div className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                            <span>{item.date}</span>
                            <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                            <span className="text-brand-primary">{item.type}</span>
                            <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                            <span>{item.duration}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div 
                    onClick={handleSearchSubmit}
                    className="p-4 bg-black/30 text-center text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary hover:text-white cursor-pointer transition-colors border-t border-white/5"
                  >
                    View all results <i className="fa-solid fa-chevron-right ml-2"></i>
                  </div>
                </div>
              )}
            </div>

            {/* Search Cloud Tags */}
            <div className="space-y-4">
              <p className="text-gray-200 text-sm font-black uppercase tracking-widest flex flex-wrap gap-x-6 gap-y-3 opacity-90">
                <span className="text-gray-500 font-bold border-r border-white/10 pr-6">Top search:</span>
                {topSearches.map((tag, idx) => (
                  <span key={idx} className="hover:text-brand-primary cursor-pointer transition-colors border-b-2 border-transparent hover:border-brand-primary/50 text-xs">
                    {tag}
                  </span>
                ))}
              </p>
            </div>

            {/* Action Button */}
            <button 
              onClick={scrollToContent}
              className="group flex items-center gap-6 bg-brand-primary hover:bg-[#cbb2f9] text-[#0f1011] px-16 py-7 rounded-[32px] font-black text-2xl uppercase tracking-[0.2em] transition-all transform hover:scale-[1.08] active:scale-95 shadow-[0_20px_50px_rgba(183,148,244,0.4)]"
            >
              Watch anime
              <div className="bg-[#0f1011] w-10 h-10 rounded-full flex items-center justify-center text-white text-sm group-hover:translate-x-4 transition-transform">
                <i className="fa-solid fa-arrow-right"></i>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Spotlight Slider Section */}
      <section ref={contentRef} className="pt-24 pb-12 bg-gradient-to-b from-[#0f1011] to-[#121315]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 mb-12">
          <div className="flex items-center gap-5 mb-3">
            <span className="w-4 h-4 rounded-full bg-brand-primary animate-pulse shadow-[0_0_15px_rgba(183,148,244,1)]"></span>
            <h2 className="text-base font-black uppercase tracking-[0.4em] text-brand-primary">Spotlight</h2>
          </div>
          <h3 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">Featured Collections</h3>
        </div>
        <HeroSlider items={spotlight} />
      </section>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-24 space-y-40">
        {/* Trending Section */}
        <section>
          <div className="flex items-center justify-between mb-16">
            <h2 className="text-4xl font-black text-white flex items-center gap-5 uppercase tracking-tighter">
              <span className="w-3 h-12 bg-brand-primary rounded-full shadow-2xl shadow-brand-primary/40"></span>
              Top Airing
            </h2>
            <button className="text-xs text-gray-400 hover:text-brand-primary font-black transition-all uppercase tracking-[0.3em] flex items-center gap-3 group border-2 border-white/5 px-8 py-3.5 rounded-full hover:bg-white/5 hover:border-brand-primary/20">
              Discover All <i className="fa-solid fa-chevron-right group-hover:translate-x-3 transition-transform text-xs"></i>
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-10">
            {topAiring.map(anime => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        </section>

        {/* Community & Rankings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Promo Card */}
          <div className="lg:col-span-8">
             <section className="bg-brand-card rounded-[64px] p-16 border border-white/5 relative overflow-hidden group shadow-[0_40px_120px_rgba(0,0,0,0.6)]">
               <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
               <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-brand-primary/10 blur-[150px] group-hover:bg-brand-primary/20 transition-all duration-1500"></div>
               <div className="relative z-10 flex flex-col md:flex-row items-center gap-16">
                 <div className="space-y-8 text-center md:text-left flex-grow">
                   <span className="bg-brand-primary/20 text-brand-primary text-xs font-black px-6 py-3 rounded-full uppercase tracking-[0.3em] border border-brand-primary/30 shadow-inner">Elite Node Member</span>
                   <h3 className="text-6xl font-black text-white uppercase tracking-tight leading-[0.9]">Assemble The Order</h3>
                   <p className="text-gray-500 text-xl leading-relaxed max-w-md font-medium">Unlock exclusive high-bitrate streams, AI-assisted translations, and priority schedule access.</p>
                   <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-6">
                      <button className="bg-brand-primary text-[#0f1011] px-12 py-5 rounded-[24px] text-sm font-black uppercase tracking-widest hover:scale-110 transition-all shadow-2xl shadow-brand-primary/40">Join Discord</button>
                      <button className="bg-white/5 border border-white/10 text-white px-12 py-5 rounded-[24px] text-sm font-black uppercase tracking-widest hover:bg-white/10 transition-all backdrop-blur-md">Support Collective</button>
                   </div>
                 </div>
                 <div className="relative">
                    <i className="fa-brands fa-discord text-[220px] text-brand-primary opacity-20 group-hover:opacity-100 group-hover:rotate-12 transition-all duration-1000 group-hover:drop-shadow-[0_0_50px_rgba(183,148,244,0.6)]"></i>
                 </div>
               </div>
             </section>
          </div>
          
          {/* Rankings Sidebar */}
          <div className="lg:col-span-4">
             <section className="bg-brand-card rounded-[64px] p-12 border border-white/5 h-full shadow-2xl relative overflow-hidden">
                <h3 className="text-2xl font-black text-white mb-12 uppercase tracking-[0.4em] flex items-center justify-between">
                  Rankings
                  <i className="fa-solid fa-trophy text-brand-primary opacity-50 animate-bounce"></i>
                </h3>
                <div className="space-y-10">
                  {topAiring.slice(0, 5).map((anime, idx) => (
                    <div key={anime.id} className="flex items-center gap-8 group cursor-pointer">
                      <div className="relative">
                         <span className={`text-5xl font-black italic transition-all duration-500 ${idx < 3 ? 'text-brand-primary scale-125' : 'text-gray-800'}`}>0{idx + 1}</span>
                         {idx === 0 && <i className="fa-solid fa-crown absolute -top-4 -left-4 text-yellow-500 text-lg rotate-[-25deg] drop-shadow-lg"></i>}
                      </div>
                      <div className="w-16 h-16 rounded-[20px] overflow-hidden bg-brand-bg border-2 border-white/10 group-hover:border-brand-primary transition-all shadow-2xl">
                        <img src={anime.thumbnail} alt={anime.title} className="w-full h-full object-cover group-hover:scale-150 transition-transform duration-[2000ms]" />
                      </div>
                      <div className="flex-grow">
                        <h4 className="text-base font-black text-gray-200 group-hover:text-brand-primary transition-colors line-clamp-1 uppercase tracking-tight">{anime.title}</h4>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-[10px] font-black text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-lg border border-brand-primary/20">#{idx + 1} S-CLASS</span>
                          <div className="flex items-center gap-1.5">
                            <i className="fa-solid fa-star text-brand-primary text-xs"></i>
                            <span className="text-xs text-gray-500 font-black">{anime.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
             </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
