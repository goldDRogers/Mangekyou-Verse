
import React, { useEffect, useState, useRef } from 'react';
import AnimeCard from '../components/AnimeCard';
import SpotlightSlider from '../components/home/SpotlightSlider';
import TrendingCarousel from '../components/home/TrendingCarousel';
import Top10Sidebar from '../components/home/Top10Sidebar';
import Logo from '../components/Logo';
import ParticleGrid from '../components/ParticleGrid';
import { generateAnimeList } from '../services/geminiService';
import { getSpotlight, getTrending, searchAnime } from '../services/animeService';
import { Anime } from '../types';
import { useRouter } from 'next/router';

type SearchSuggestion = {
  id: string;
  title: string;
  thumbnail: string;
  type?: string;
};

const Home: React.FC = () => {
  const [topAiring, setTopAiring] = useState<Anime[]>([]);
  const [spotlight, setSpotlight] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<SearchSuggestion[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fuzzyScore = (query: string, text: string): number => {
    const q = query.trim().toLowerCase();
    const t = text.trim().toLowerCase();
    if (!q) return Number.POSITIVE_INFINITY;
    if (!t) return Number.POSITIVE_INFINITY;
    if (t === q) return 0;
    if (t.startsWith(q)) return 1;
    const idx = t.indexOf(q);
    if (idx !== -1) return 2 + idx;

    // subsequence score (typo-tolerant-ish)
    let ti = 0;
    let hits = 0;
    let gaps = 0;
    for (let qi = 0; qi < q.length; qi++) {
      const ch = q[qi];
      const found = t.indexOf(ch, ti);
      if (found === -1) return 9999;
      gaps += found - ti;
      hits++;
      ti = found + 1;
    }
    return 10 + gaps + (q.length - hits) * 50;
  };

  const buildLocalSuggestions = (): SearchSuggestion[] => {
    const mapAnime = (a: Anime): SearchSuggestion => ({
      id: a.id,
      title: a.title,
      thumbnail: a.thumbnail,
      type: a.type,
    });

    const localPool: Anime[] = [];
    localPool.push(...(Array.isArray(spotlight) ? spotlight : []));
    localPool.push(...(Array.isArray(trending) ? trending : []));
    localPool.push(...(Array.isArray(topAiring) ? topAiring : []));

    const seen = new Set<string>();
    const unique: Anime[] = [];
    for (const a of localPool) {
      if (!a?.id || seen.has(a.id)) continue;
      seen.add(a.id);
      unique.push(a);
    }

    return unique.map(mapAnime);
  };

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
        const [spotlightData, trendingData, fullList] = await Promise.all([
          getSpotlight(),
          getTrending(),
          generateAnimeList(18)
        ]);

        setSpotlight(spotlightData);
        setTrending(trendingData);
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
    const q = searchQuery.trim();
    if (!q) {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // 1) instant local fuzzy results
    const local = buildLocalSuggestions()
      .map((s) => ({ s, score: fuzzyScore(q, s.title) }))
      .filter((x) => x.score < 9999)
      .sort((a, b) => a.score - b.score)
      .slice(0, 6)
      .map((x) => x.s);

    setFilteredSuggestions(local);
    setShowSuggestions(true);

    // 2) debounced remote results (merge in)
    const timer = setTimeout(async () => {
      try {
        const remote = await searchAnime(q);
        const remoteSuggestions: SearchSuggestion[] = remote.slice(0, 8).map((a) => ({
          id: a.id,
          title: a.title,
          thumbnail: a.thumbnail,
          type: a.type,
        }));

        setFilteredSuggestions((prev) => {
          const merged: SearchSuggestion[] = [];
          const seen = new Set<string>();
          for (const item of [...prev, ...remoteSuggestions]) {
            if (!item?.id || seen.has(item.id)) continue;
            seen.add(item.id);
            merged.push(item);
            if (merged.length >= 10) break;
          }
          return merged;
        });
      } catch (e) {
        // ignore remote failures; local suggestions still work
      }
    }, 250);

    return () => clearTimeout(timer);
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
    const q = searchQuery.trim();
    if (!q) return;
    router.push(`/Search?q=${encodeURIComponent(q)}`);
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
    <div className="bg-brand-bg relative min-h-screen overflow-x-hidden">
      {/* Search Landing Section */}
      <section className="relative min-h-[90vh] md:min-h-[95vh] flex items-center justify-center py-20">
        {/* Visual Background Elements */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <ParticleGrid />

          {/* Ambient Glows */}
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[150px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-brand-secondary/10 rounded-full blur-[150px] animate-pulse"></div>

          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>
        </div>

        <div className="relative z-10 w-full max-w-4xl mx-auto px-6">
          <div className="flex flex-col items-center gap-10 md:gap-14 animate-fade-in text-center">

            {/* Branding Section */}
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 group cursor-default">
              <div className="relative">
                <div className="absolute inset-0 bg-brand-primary/20 blur-3xl rounded-full animate-pulse"></div>
                <Logo className="w-20 h-20 md:w-32 md:h-32 transform transition-all duration-1000 group-hover:rotate-[360deg] animate-spin-slow relative z-10" />
              </div>
              <div className="flex flex-col items-center md:items-start">
                <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase leading-none drop-shadow-2xl">
                  MANGEKYOU<span className="text-brand-primary">VERSE</span>
                </h1>
                <p className="text-[10px] md:text-xs font-black text-brand-primary opacity-60 uppercase tracking-[0.6em] mt-2 md:mt-4 ml-1">
                  The Ultimate Anime Node
                </p>
              </div>
            </div>

            {/* Premium Search Container */}
            <div className="w-full max-w-3xl relative" ref={searchContainerRef}>
              <form onSubmit={handleSearchSubmit} className="relative group">
                <input
                  type="text"
                  placeholder="What are you looking for today?"
                  className="w-full h-16 md:h-24 bg-white rounded-[40px] pl-10 md:pl-16 pr-24 md:pr-32 text-lg md:text-2xl font-bold text-black border-none focus:outline-none focus:ring-[12px] md:focus:ring-[16px] focus:ring-brand-primary/15 transition-all shadow-[0_40px_100px_rgba(0,0,0,0.6)] placeholder:text-gray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length > 0 && setShowSuggestions(true)}
                />
                <button
                  type="submit"
                  className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-brand-primary rounded-full flex items-center justify-center text-black text-xl md:text-2xl hover:scale-110 active:scale-95 transition-all shadow-xl shadow-brand-primary/40 group-hover:shadow-brand-primary/60"
                >
                  <i className="fa-solid fa-magnifying-glass"></i>
                </button>
              </form>

              {/* Enhanced Suggestions Dropdown */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-6 bg-[#1a1b26]/95 backdrop-blur-2xl rounded-[32px] border border-white/10 shadow-[0_40px_120px_rgba(0,0,0,0.9)] overflow-hidden z-[100] animate-slide-up">
                  <div className="max-h-[450px] overflow-y-auto custom-scrollbar p-3">
                    {filteredSuggestions.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          router.push(`/watch/${item.id}`);
                          setShowSuggestions(false);
                        }}
                        className="flex items-center gap-6 p-4 hover:bg-white/5 rounded-2xl cursor-pointer transition-all group"
                      >
                        <div className="relative w-16 h-24 flex-shrink-0">
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-full h-full rounded-xl object-cover shadow-2xl border border-white/10 group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                        <div className="flex flex-col gap-1.5 flex-grow">
                          <div className="flex items-start justify-between gap-4">
                            <h4 className="text-xl font-black text-white group-hover:text-brand-primary transition-colors leading-tight line-clamp-1">{item.title}</h4>
                            <span className="text-[10px] bg-brand-primary/20 text-brand-primary px-2 py-0.5 rounded font-black uppercase tracking-widest">{item.type}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div
                    onClick={handleSearchSubmit}
                    className="p-5 bg-black/40 text-center text-[11px] font-black uppercase tracking-[0.4em] text-brand-primary hover:text-white cursor-pointer transition-all border-t border-white/10 group"
                  >
                    View All Results <i className="fa-solid fa-arrow-right ml-3 transform group-hover:translate-x-2 transition-transform"></i>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Access Tags */}
            <div className="flex flex-col items-center gap-6">
              <div className="flex flex-wrap justify-center gap-3">
                <span className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] mr-4 self-center px-4 border-r border-white/10">Trending Tags:</span>
                {topSearches.slice(0, 6).map((tag, idx) => (
                  <button key={idx} className="bg-white/5 hover:bg-brand-primary hover:text-black px-5 py-2 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-widest transition-all border border-white/5 hover:border-brand-primary/50">
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spotlight Slider Section */}
      <section ref={contentRef} className="pt-0 bg-[#0f1011]">
        <SpotlightSlider items={spotlight} />
      </section>

      {/* Trending Section (Full Width) */}
      <section className="bg-[#0f1011] pb-8 relative z-10 -mt-10">
        <div className="max-w-[1920px] mx-auto">
          <TrendingCarousel items={trending} />
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* LEFT COLUMN: Main Content */}
          <div className="lg:col-span-3 space-y-12">

            {/* Latest Updated Section */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-brand-primary flex items-center gap-3 uppercase tracking-wide">
                  <i className="fa-solid fa-play text-xl"></i>
                  Latest Episodes
                </h2>
                <button className="text-xs text-gray-400 hover:text-white transition-colors uppercase tracking-widest font-bold">
                  View All <i className="fa-solid fa-chevron-right ml-1 text-[10px]"></i>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-8">
                {topAiring.map(anime => (
                  <AnimeCard key={anime.id} anime={anime} />
                ))}
              </div>
            </section>

            {/* New Recommendations Section (Mock) */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-[#ca2221] flex items-center gap-3 uppercase tracking-wide">
                  <i className="fa-solid fa-fire text-xl"></i>
                  New on Mangekyou
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-8">
                {/* Reusing list for demo purposes, reversed */}
                {[...topAiring].reverse().slice(0, 8).map(anime => (
                  <AnimeCard key={`new-${anime.id}`} anime={anime} />
                ))}
              </div>
            </section>

          </div>

          {/* RIGHT COLUMN: Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            <Top10Sidebar items={trending.length > 0 ? trending : topAiring} />

            {/* Genres Block */}
            <div className="bg-[#1f2026] p-6 rounded-lg border border-white/5">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Genres</h3>
              <div className="grid grid-cols-3 gap-2">
                {['Action', 'Adventure', 'Cars', 'Comedy', 'Dementia', 'Demons', 'Drama', 'Ecchi', 'Fantasy', 'Game', 'Harem', 'Historical', 'Horror', 'Isekai', 'Josei', 'Kids', 'Magic', 'Mecha'].map(genre => (
                  <a key={genre} href="#" className="text-[11px] text-gray-400 hover:text-brand-primary hover:bg-white/5 px-2 py-1 rounded transition-colors truncate">
                    {genre}
                  </a>
                ))}
              </div>
            </div>

            {/* Community Promo */}
            <div className="bg-gradient-to-br from-brand-secondary to-[#0f1011] p-6 rounded-lg text-center relative overflow-hidden group">
              <div className="relative z-10">
                <i className="fa-brands fa-discord text-4xl text-white mb-3"></i>
                <h3 className="text-white font-black uppercase text-lg mb-2">Join Our Discord</h3>
                <p className="text-xs text-white/70 mb-4">Chat with other fans, get updates, and request anime.</p>
                <button className="bg-white text-brand-secondary px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform">
                  Join Server
                </button>
              </div>
              <i className="fa-brands fa-discord text-[100px] absolute -bottom-4 -right-4 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-500"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
