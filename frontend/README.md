<div align="center">
  <img src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" width="100%" alt="Mangekyou Verse Banner" />
  
  # 👁️ MANGEKYOU VERSE
  ### The Ultimate High-Performance Anime Discovery Platform
  
  [![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-blue?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
</div>

---

## 🌌 Overview

**Mangekyou Verse** is a premium, portfolio-grade anime discovery engine built for speed, aesthetics, and discoverability. It leverages multiple metadata nodes (Jikan, AniList, Kitsu) to provide a unified, high-fidelity experience for anime enthusiasts.

> **Production Status:** Refined for recruiters. Optimized for SEO. Built for scale.

## 🚀 Key Features

### 🔍 Advanced Discovery
- **Smart Recommendations:** A custom ranking engine that combines direct Jikan recommendations with genre-based similarities, weighted by shared tags, popularity, and global ratings.
- **Multimodal Search:** Lightning-fast search with multi-API fallback (Jikan -> Kitsu) for descriptions and metadata.
- **Dynamic Filtering:** Search by genres, years, status, and types with real-time feedback.

### 🛡️ Production Grade Architecture
- **SEO & Socials:** Full Server-Side Rendering (SSR) for anime pages with dynamic Open Graph (OG) tags and Twitter Cards.
- **JSON-LD Structured Data:** Implemented Google-friendly schema for better search engine ranking and rich snippets.
- **Admin Command Center:** A dedicated dashboard for monitoring API health (Jikan, AniList, Kitsu), system stats, and hot search trends.
- **API Resilience:** Robust rate-limit handling with exponential backoff and graceful UI error states.

### ⚡ Performance Optimized
- **90+ Lighthouse Scores:** Optimized using `next/image`, component memoization, and efficient asset delivery.
- **Glassmorphism UI:** A sleek, dark-themed interface built with Framer Motion for micro-interactions and high-end aesthetics.
- **Skeleton Loading:** Seamless transition states using custom-built Shimmer UI components.

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS, Framer Motion, Lucide Icons |
| **Backend** | Supabase (Auth, Profiles, Watchlist History) |
| **Data Nodes** | Jikan (MyAnimeList), AniList (GraphQL), Kitsu (REST) |
| **Optimization** | Next/Image, React.memo, Dynamic Metadata |

## 🕹️ Getting Started

### Prerequisites
- Node.js 18+
- Supabase Project (URL & Anon Key)

### Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/goldDRogers/Mangekyou-Verse.git
   cd Mangekyou-Verse/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Launch Dev Server:**
   ```bash
   npm run dev
   ```

## ⚖️ Legal Disclaimer

Mangekyou Verse is a **metadata discovery platform**. We do not host, store, or stream any copyrighted video content. All anime data is fetched via public APIs (MyAnimeList, AniList, Kitsu). Any "Watch" functionality works via secure external redirects to verified third-party platforms.

---

<div align="center">
  Built with 💜 by [Your Name/GitHub]
</div>
