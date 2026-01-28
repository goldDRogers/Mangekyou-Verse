"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${searchQuery}`);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#0f1011] text-gray-200">
      {/* Top Utility Bar */}
      <div className="bg-[#121315] border-b border-white/5 py-2 px-4 lg:px-8 hidden md:flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-gray-400">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-gray-500">Join now</span>
            <div className="flex gap-2">
              <a href="#" className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all"><i className="fa-brands fa-discord"></i></a>
              <a href="#" className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-400/10 text-blue-300 hover:bg-blue-400 hover:text-white transition-all"><i className="fa-brands fa-telegram"></i></a>
              <a href="#" className="w-5 h-5 flex items-center justify-center rounded-full bg-pink-500/10 text-pink-400 hover:bg-pink-500 hover:text-white transition-all"><i className="fa-brands fa-reddit-alien"></i></a>
              <a href="#" className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-400/10 text-blue-300 hover:bg-blue-400 hover:text-white transition-all"><i className="fa-brands fa-twitter"></i></a>
            </div>
          </div>
          <div className="flex items-center gap-4 border-l border-white/10 pl-6">
            <a href="#" className="hover:text-brand-primary flex items-center gap-1.5 transition-colors"><i className="fa-solid fa-tower-broadcast"></i> Watch2gether</a>
            <a href="#" className="hover:text-brand-primary flex items-center gap-1.5 transition-colors"><i className="fa-solid fa-shuffle"></i> Random</a>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-brand-primary">EN</span>
            <span className="w-[1px] h-3 bg-white/10"></span>
            <span className="hover:text-brand-primary cursor-pointer transition-colors">JP</span>
          </div>
          <a href="#" className="hover:text-brand-primary flex items-center gap-1.5 transition-colors"><i className="fa-solid fa-newspaper"></i> News</a>
          <a href="#" className="hover:text-brand-primary flex items-center gap-1.5 transition-colors"><i className="fa-solid fa-comments"></i> Community</a>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="sticky top-0 z-50 bg-[#0f1011]/90 backdrop-blur-xl border-b border-white/5 px-4 lg:px-8 py-4 flex items-center justify-between shadow-2xl transition-all duration-300">
        <div className="flex items-center gap-4 lg:gap-12">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-2xl hover:text-brand-primary transition-colors lg:hidden"
          >
            <i className="fa-solid fa-bars-staggered"></i>
          </button>

          <Link href="/" className="flex items-center gap-3 group">
            <Logo className="w-12 h-12 transition-all duration-700 group-hover:rotate-[360deg]" />
            <span className="text-2xl font-black tracking-tighter uppercase text-white hidden sm:block">
              Mangekyou<span className="text-brand-primary">Verse</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            <Link href="/" className="text-xs font-black text-gray-400 hover:text-white transition-colors uppercase tracking-widest">Home</Link>
            <Link href="/" className="text-xs font-black text-gray-400 hover:text-white transition-colors uppercase tracking-widest">Movies</Link>
            <Link href="/" className="text-xs font-black text-gray-400 hover:text-white transition-colors uppercase tracking-widest">TV Series</Link>
            <Link href="/" className="text-xs font-black text-gray-400 hover:text-white transition-colors uppercase tracking-widest">Most Popular</Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2 bg-white/5 rounded-full px-4 py-2 w-72 border border-white/10 focus-within:border-brand-primary/50 transition-all group/navsearch">
            <i className="fa-solid fa-user-ninja text-xs text-gray-700 group-focus-within/navsearch:text-brand-primary transition-colors"></i>
            <input
              type="text"
              placeholder="Filter anime..."
              className="bg-transparent border-none focus:outline-none w-full text-xs text-gray-300 placeholder:text-gray-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="text-gray-500 hover:text-brand-primary transition-colors">
              <i className="fa-solid fa-magnifying-glass text-xs"></i>
            </button>
          </form>

          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/watchlist" className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-brand-primary transition-colors rounded-full hover:bg-white/5" title="My Collection">
                <i className="fa-solid fa-heart text-lg"></i>
              </Link>
              <Link
                href="/account"
                className="w-10 h-10 rounded-full border-2 border-brand-primary p-0.5 overflow-hidden shadow-lg shadow-brand-primary/20 hover:scale-105 transition-transform group"
                title="Account Settings"
              >
                <img src={`https://ui-avatars.com/api/?name=${user.email?.split('@')[0]}&background=b794f4&color=fff&bold=true`} alt="Avatar" className="w-full h-full object-cover rounded-full" />
              </Link>
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-brand-primary hover:bg-[#cbb2f9] text-[#0f1011] px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-brand-primary/10 flex items-center gap-2"
            >
              <i className="fa-solid fa-user"></i>
              Login
            </Link>
          )}
        </div>
      </nav>

      {/* Sidebar Mobile */}
      <aside className={`fixed top-0 left-0 h-full w-80 bg-[#121315] z-[70] transform transition-transform duration-500 ease-in-out shadow-[20px_0_50px_rgba(0,0,0,0.5)] ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 h-full flex flex-col">
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-3">
              <Logo className="w-10 h-10" />
              <span className="font-black uppercase tracking-tighter text-xl">Mangekyou</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="text-2xl hover:text-brand-primary transition-colors"><i className="fa-solid fa-xmark"></i></button>
          </div>
          <div className="flex flex-col gap-6">
            <Link href="/" onClick={() => setIsSidebarOpen(false)} className="text-lg font-black text-gray-500 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-4"><i className="fa-solid fa-house text-brand-primary"></i> Home</Link>
            {user && (
              <Link href="/watchlist" onClick={() => setIsSidebarOpen(false)} className="text-lg font-black text-gray-500 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-4"><i className="fa-solid fa-heart text-brand-primary"></i> Collection</Link>
            )}
            <Link href="/" onClick={() => setIsSidebarOpen(false)} className="text-lg font-black text-gray-500 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-4"><i className="fa-solid fa-film text-brand-primary"></i> Movies</Link>
          </div>
          <div className="mt-auto space-y-6">
            <div className="h-[1px] bg-white/5 w-full"></div>
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Connect with us</p>
            <div className="flex gap-4">
              <a href="#" className="text-xl text-gray-500 hover:text-brand-primary transition-colors"><i className="fa-brands fa-discord"></i></a>
              <a href="#" className="text-xl text-gray-500 hover:text-brand-primary transition-colors"><i className="fa-brands fa-twitter"></i></a>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-[#121315] border-t border-white/5 py-16 px-8">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <Logo className="w-20 h-20" />
            <span className="text-2xl font-black uppercase text-white tracking-tighter">Mangekyou<span className="text-brand-primary">Verse</span></span>
          </div>

          <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 text-xs font-black uppercase tracking-widest text-gray-500">
            <Link href="/" className="hover:text-brand-primary transition-colors">Terms of Service</Link>
            <Link href="/" className="hover:text-brand-primary transition-colors">Privacy Policy</Link>
          </div>

          <div className="max-w-xl text-[10px] text-gray-600 font-bold uppercase tracking-widest leading-loose">
            Mangekyou Verse is a high-performance streaming node. We do not store any files on our server, we only index content found from external nodes.
          </div>

          <p className="text-[10px] font-bold text-gray-700 uppercase tracking-widest">© 2026 MANGEKYOU VERSE Collective. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
