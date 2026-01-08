
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Anime, Comment } from '../types';
import { generateAnimeList } from '../services/geminiService';

const Watch: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const [relatedAnime, setRelatedAnime] = useState<Anime[]>([]);

  const genres = [
    "Action", "Adventure", "Cars", "Comedy", "Dementia", "Demons", "Drama", "Ecchi", "Fantasy", "Game", "Harem", "Hentai", "Historical", "Horror", "Isekai", "Josei", "Kids", "Magic", "Martial Arts", "Mecha", "Military", "Music", "Mystery", "Parody"
  ];

  const trendingPosts = [
    { user: "Vocsw", text: "You think jujutsu kaisen season 3 trailer tomorrow? Like Saturday?", time: "11 mins ago" },
    { user: "Yuu_chan", text: "So yesterday I was gonna post some pick up lines... i am gonna be a savage pickup lines teller in general...", time: "25 mins ago" },
    { user: "Itachi_Fan", text: "The Mangekyou Verse layout is actually better than the original lol", time: "1 hour ago" }
  ];

  useEffect(() => {
    const fetchAnime = async () => {
      const data = await generateAnimeList(12);
      setAnime(data[0]);
      setRelatedAnime(data.slice(1, 10));
      setLoading(false);
    };
    fetchAnime();
    window.scrollTo(0, 0);
  }, [id]);

  const handleEpisodeChange = (num: number) => {
    if (num === currentEpisode) return;
    setIsBuffering(true);
    setCurrentEpisode(num);
    setTimeout(() => setIsBuffering(false), 1000);
  };

  if (loading || !anime) return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
      <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-brand-primary font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Syncing Rinnegan Node...</p>
    </div>
  );

  return (
    <div className="bg-[#0f1011]">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-4">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-600 mb-6">
          <Link to="/" className="hover:text-brand-primary transition-colors">Home</Link>
          <i className="fa-solid fa-chevron-right text-[8px]"></i>
          <span className="text-gray-400">{anime.type}</span>
          <i className="fa-solid fa-chevron-right text-[8px]"></i>
          <span className="text-brand-primary">{anime.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Player Column */}
          <div className="lg:col-span-9 space-y-4">
            
            <div className="flex flex-col lg:flex-row gap-4">
               {/* Left: Episode List Grid (as seen in video) */}
               <div className="lg:w-64 bg-brand-card rounded-2xl border border-white/5 flex flex-col h-[400px] lg:h-auto overflow-hidden">
                  <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Episodes</span>
                    <div className="relative">
                      <input type="text" placeholder="Number of Ep" className="bg-[#0f1011] border border-white/10 rounded-lg px-3 py-1 text-[9px] w-24 focus:outline-none focus:border-brand-primary/50" />
                      <i className="fa-solid fa-magnifying-glass absolute right-2 top-1/2 -translate-y-1/2 text-[8px] text-gray-600"></i>
                    </div>
                  </div>
                  <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
                    <div className="grid grid-cols-4 gap-2">
                      {Array.from({ length: anime.episodes }, (_, i) => i + 1).map(num => (
                        <button 
                          key={num}
                          onClick={() => handleEpisodeChange(num)}
                          className={`h-9 rounded-lg text-[11px] font-black transition-all border ${currentEpisode === num ? 'bg-brand-primary text-black border-brand-primary shadow-lg shadow-brand-primary/20' : 'bg-[#0f1011] text-gray-500 border-white/5 hover:border-brand-primary/40'}`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
               </div>

               {/* Right: Player Area */}
               <div className="flex-grow space-y-4">
                  <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-white/5 shadow-2xl group">
                    {isBuffering ? (
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
                        <div className="w-12 h-12 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-brand-primary text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Buffering...</p>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 bg-brand-primary/90 rounded-full flex items-center justify-center animate-pulse cursor-pointer hover:scale-110 transition-transform shadow-2xl shadow-brand-primary/40">
                          <i className="fa-solid fa-play text-black text-3xl ml-1.5"></i>
                        </div>
                      </div>
                    )}
                    
                    {/* Bottom Controls Bar (Exactly as video) */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-6">
                        <i className="fa-solid fa-play text-white hover:text-brand-primary cursor-pointer text-sm"></i>
                        <span className="text-[10px] font-mono text-white/50 tracking-tighter">00:00 / 24:00</span>
                      </div>
                      <div className="flex items-center gap-5 text-white/70">
                        <div className="flex items-center gap-4">
                          <i className="fa-solid fa-arrow-rotate-left hover:text-brand-primary cursor-pointer text-xs"></i>
                          <i className="fa-solid fa-arrow-rotate-right hover:text-brand-primary cursor-pointer text-xs"></i>
                        </div>
                        <div className="h-3 w-[1px] bg-white/10"></div>
                        <i className="fa-solid fa-gear hover:text-brand-primary cursor-pointer text-xs"></i>
                        <i className="fa-solid fa-expand hover:text-brand-primary cursor-pointer text-xs"></i>
                      </div>
                    </div>
                  </div>

                  {/* Feature Toggles (Light, Auto Play, etc.) */}
                  <div className="bg-brand-card border border-white/5 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-6">
                      <button className="flex items-center gap-2 text-[10px] font-black text-gray-500 hover:text-brand-primary uppercase tracking-widest transition-colors">
                        <i className="fa-solid fa-lightbulb"></i> Light On
                      </button>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Auto Play</span>
                        <div className="w-8 h-4 bg-brand-primary rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-2 h-2 bg-black rounded-full"></div></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Auto Next</span>
                        <div className="w-8 h-4 bg-brand-primary rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-2 h-2 bg-black rounded-full"></div></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Auto Skip Intro</span>
                        <div className="w-8 h-4 bg-brand-primary rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-2 h-2 bg-black rounded-full"></div></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 transition-all border border-white/5"><i className="fa-solid fa-plus"></i> Add to List</button>
                       <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 transition-all border border-white/5"><i className="fa-solid fa-tower-broadcast"></i> Watch2Gether</button>
                    </div>
                  </div>
               </div>
            </div>

            {/* Server Selection & Info Box */}
            <div className="space-y-4">
              <div className="bg-brand-card border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row gap-8 items-center">
                 <div className="space-y-3 flex-grow">
                   <div className="flex items-center gap-4">
                     <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest bg-brand-primary/10 px-3 py-1 rounded border border-brand-primary/20">You are watching Episode {currentEpisode}</span>
                     <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">If current server doesn't work please try other servers beside.</p>
                   </div>
                   <div className="flex flex-wrap gap-6 pt-4">
                      <div className="space-y-2">
                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-2"><i className="fa-solid fa-closed-captioning text-brand-primary"></i> SUB:</span>
                        <div className="flex gap-2">
                          <button className="bg-brand-primary text-black text-[10px] font-black px-4 py-1.5 rounded-lg border border-brand-primary">HD-1</button>
                          <button className="bg-white/5 text-gray-500 text-[10px] font-black px-4 py-1.5 rounded-lg border border-white/5 hover:border-brand-primary/40 transition-colors">HD-2</button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-2"><i className="fa-solid fa-microphone text-brand-primary"></i> DUB:</span>
                        <div className="flex gap-2">
                          <button className="bg-white/5 text-gray-500 text-[10px] font-black px-4 py-1.5 rounded-lg border border-white/5 hover:border-brand-primary/40 transition-colors">HD-1</button>
                          <button className="bg-white/5 text-gray-500 text-[10px] font-black px-4 py-1.5 rounded-lg border border-white/5 hover:border-brand-primary/40 transition-colors">HD-2</button>
                        </div>
                      </div>
                   </div>
                 </div>
              </div>

              {/* Show Comments Toggle Switch */}
              <div className="flex items-center gap-4 px-2">
                 <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">Show Comments</span>
                 <button 
                  onClick={() => setShowComments(!showComments)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${showComments ? 'bg-brand-primary' : 'bg-gray-800'}`}
                 >
                   <div className={`absolute top-1 w-4 h-4 bg-black rounded-full transition-all ${showComments ? 'right-1' : 'left-1'}`}></div>
                 </button>
              </div>

              {/* Rankings Tabbed Section (Bottom of Video Page) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10">
                 {['Most Popular', 'Most Favorite', 'Latest Completed'].map(section => (
                   <div key={section} className="bg-brand-card rounded-3xl p-6 border border-white/5 shadow-xl">
                      <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <span className="w-1 h-3 bg-brand-primary rounded-full"></span>
                        {section}
                      </h3>
                      <div className="space-y-5">
                        {relatedAnime.slice(0, 5).map((a, idx) => (
                          <div key={a.id} className="flex gap-4 group cursor-pointer border-b border-white/5 pb-4 last:border-none last:pb-0">
                            <div className="w-14 h-18 rounded-xl overflow-hidden flex-shrink-0 border border-white/5 group-hover:border-brand-primary/50 transition-all">
                              <img src={a.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={a.title} />
                            </div>
                            <div className="flex flex-col justify-center gap-1.5 overflow-hidden">
                              <h4 className="text-[11px] font-black text-gray-300 group-hover:text-brand-primary transition-colors line-clamp-1 uppercase tracking-tight">{a.title}</h4>
                              <div className="flex items-center gap-2">
                                <span className="bg-white/5 text-gray-500 text-[8px] font-black px-1.5 py-0.5 rounded border border-white/5 uppercase">TV</span>
                                <div className="flex items-center gap-1 text-[8px] font-black text-brand-primary">
                                  <i className="fa-solid fa-star"></i>
                                  {a.rating}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button className="w-full mt-6 bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest py-2.5 rounded-xl transition-all border border-white/5 text-gray-500 hover:text-white">View More</button>
                   </div>
                 ))}
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Continue Watching / Recent */}
            <div className="bg-brand-card rounded-3xl p-6 border border-white/5 shadow-xl">
               <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center justify-between">
                 Continue Watching
                 <i className="fa-solid fa-clock-rotate-left text-brand-primary opacity-40"></i>
               </h3>
               <div className="space-y-4">
                 <div className="flex gap-4 p-3 bg-white/5 rounded-2xl border border-white/10 group cursor-pointer">
                    <img src={anime.thumbnail} className="w-12 h-16 rounded-lg object-cover" alt="Last watched" />
                    <div className="flex flex-col justify-center gap-1">
                      <h4 className="text-[10px] font-black text-gray-300 line-clamp-1 uppercase tracking-widest">{anime.title}</h4>
                      <p className="text-[8px] font-bold text-brand-primary uppercase">Episode 01 / {anime.episodes}</p>
                    </div>
                 </div>
               </div>
            </div>

            {/* Genres Card */}
            <div className="bg-brand-card rounded-3xl p-6 border border-white/5 shadow-xl">
               <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6">Genres</h3>
               <div className="grid grid-cols-2 gap-2">
                  {genres.slice(0, 12).map(g => (
                    <button key={g} className="text-left text-[9px] font-black text-gray-500 hover:text-brand-primary hover:bg-brand-primary/10 px-3 py-2 rounded-lg border border-white/5 transition-all">
                      {g}
                    </button>
                  ))}
               </div>
               <button className="w-full mt-4 text-[9px] font-black text-gray-600 uppercase tracking-widest hover:text-brand-primary transition-colors">Show more +</button>
            </div>

            {/* Top 10 (Today, Week, Month) */}
            <div className="bg-brand-card rounded-3xl p-6 border border-white/5 shadow-xl">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Top 10</h3>
                  <div className="flex gap-3 text-[9px] font-black uppercase text-gray-600">
                    <span className="text-brand-primary cursor-pointer border-b border-brand-primary">Today</span>
                    <span className="hover:text-gray-300 cursor-pointer">Week</span>
                  </div>
               </div>
               <div className="space-y-5">
                  {relatedAnime.slice(0, 5).map((a, idx) => (
                    <div key={a.id} className="flex items-center gap-4 group cursor-pointer">
                       <span className={`text-2xl font-black italic italic ${idx < 3 ? 'text-brand-primary' : 'text-gray-800'}`}>0{idx + 1}</span>
                       <img src={a.thumbnail} className="w-10 h-14 rounded-lg object-cover border border-white/5 group-hover:border-brand-primary/40 transition-all" alt={a.title} />
                       <div className="flex flex-col justify-center gap-1 overflow-hidden">
                          <h4 className="text-[10px] font-black text-gray-400 group-hover:text-brand-primary transition-colors line-clamp-1 uppercase tracking-widest">{a.title}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] text-gray-600 font-bold uppercase"><i className="fa-solid fa-closed-captioning mr-1"></i> {a.episodes}</span>
                            <span className="text-[8px] text-gray-600 font-bold uppercase"><i className="fa-solid fa-microphone mr-1"></i> {a.episodes}</span>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* Estimated Schedule Placeholder */}
            <div className="bg-brand-card rounded-3xl p-6 border border-white/5 shadow-xl">
               <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center justify-between">
                 Schedule
                 <span className="text-[8px] text-gray-500 font-bold">GMT+5:30</span>
               </h3>
               <div className="flex gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
                  {['Fri 9', 'Sat 10', 'Sun 11', 'Mon 12'].map((day, i) => (
                    <div key={day} className={`flex-shrink-0 px-3 py-2 rounded-xl text-center cursor-pointer transition-all border ${i === 1 ? 'bg-brand-primary text-black border-brand-primary' : 'bg-[#0f1011] text-gray-600 border-white/5'}`}>
                      <p className="text-[8px] font-black uppercase">{day.split(' ')[0]}</p>
                      <p className="text-[10px] font-black">{day.split(' ')[1]}</p>
                    </div>
                  ))}
               </div>
               <div className="space-y-4">
                 {[1, 2, 3].map(i => (
                   <div key={i} className="flex items-center justify-between text-[10px] font-bold group cursor-pointer">
                      <span className="text-gray-400 group-hover:text-brand-primary transition-colors line-clamp-1 uppercase tracking-widest">Anime Release {i}</span>
                      <span className="text-brand-primary text-[8px] bg-brand-primary/10 px-2 py-0.5 rounded border border-brand-primary/20">EP {12 + i}</span>
                   </div>
                 ))}
               </div>
            </div>

            {/* Trending Posts */}
            <div className="bg-brand-card rounded-3xl p-6 border border-white/5 shadow-xl">
               <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6">Trending Posts</h3>
               <div className="space-y-6">
                  {trendingPosts.map((post, idx) => (
                    <div key={idx} className="space-y-2 group cursor-pointer border-b border-white/5 pb-4 last:border-none last:pb-0">
                       <div className="flex items-center gap-2">
                          <img src={`https://picsum.photos/seed/user-${idx}/50`} className="w-5 h-5 rounded-full border border-white/10" alt="user" />
                          <span className="text-[9px] font-black text-brand-primary uppercase tracking-widest">{post.user}</span>
                          <span className="text-[8px] text-gray-700 font-bold ml-auto">{post.time}</span>
                       </div>
                       <p className="text-[10px] text-gray-500 leading-relaxed font-medium line-clamp-2 group-hover:text-gray-300 transition-colors">#{idx + 1} {post.text}</p>
                    </div>
                  ))}
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Watch;
