"use client";

import React, { useState } from 'react';
import { Anime } from '../../types';
import Link from 'next/link';

interface Top10SidebarProps {
    items: Anime[];
}

const Top10Sidebar: React.FC<Top10SidebarProps> = ({ items }) => {
    const [activeTab, setActiveTab] = useState<'day' | 'week' | 'month'>('day');

    return (
        <div className="bg-[#1f2026] rounded-t-lg overflow-hidden">
            {/* Header with Tabs */}
            <div className="flex items-center justify-between p-4 bg-[#2a2c31] border-b border-white/5">
                <h3 className="text-lg font-bold text-brand-primary uppercase tracking-wider">Top 10</h3>
                <div className="flex bg-[#121315] rounded-lg p-1">
                    {['day', 'week', 'month'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-3 py-1 text-xs font-bold rounded-md uppercase transition-all ${activeTab === tab
                                ? 'bg-brand-primary text-black'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="flex flex-col">
                {items.slice(0, 10).map((anime, index) => (
                    <Link
                        href={`/watch/${anime.id}`}
                        key={anime.id}
                        className={`flex items-center gap-4 p-4 hover:bg-white/5 transition-colors border-b border-white/5 group relative ${index < 3 ? 'pl-4' : 'pl-6'}`}
                    >
                        {/* Rank Number */}
                        <div className={`text-3xl font-black italic w-8 text-center ${index + 1 === 1 ? 'text-brand-primary' :
                            index + 1 === 2 ? 'text-[#00e396]' :
                                index + 1 === 3 ? 'text-[#feb019]' : 'text-gray-600'
                            } opacity-80 group-hover:opacity-100`}>
                            {index < 9 ? `0${index + 1}` : index + 1}
                        </div>

                        {/* Thumbnail */}
                        <div className="relative w-14 h-20 flex-shrink-0 rounded-md overflow-hidden">
                            <img
                                src={anime.thumbnail}
                                alt={anime.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                        </div>

                        {/* Details */}
                        <div className="flex flex-col gap-1 overflow-hidden">
                            <h4 className="text-sm font-bold text-white group-hover:text-brand-primary truncate transition-colors">
                                {anime.title}
                            </h4>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-300 border border-white/5">
                                    <i className="fa-regular fa-closed-captioning mr-1"></i>{anime.episodes}
                                </span>
                                <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-300 border border-white/5">
                                    <i className="fa-solid fa-microphone mr-1"></i>{Math.max(0, anime.episodes - 2)}
                                </span>
                                <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                                <span className="text-[11px] text-gray-400 font-medium lowercase first-letter:uppercase">{anime.type}</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Show More */}
            <div className="p-3 bg-[#2a2c31] text-center">
                <button className="text-xs font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-widest w-full py-2">
                    View Full List <i className="fa-solid fa-chevron-right ml-1 text-[10px]"></i>
                </button>
            </div>
        </div>
    );
};

export default Top10Sidebar;
