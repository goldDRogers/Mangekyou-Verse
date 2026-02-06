# Mangekyou Verse Backend

A "HiAnime" clone backend with Referral System, specialized for Mangekyou Verse.

## Features
- **User System**: JWT Auth, Profile management.
- **Referral System**: Unique codes, invite tracking, reward points.
- **Anime Data**: Scraper/Proxy service for anime metadata and streaming links.
- **Watch History**: Syncs progress across devices.

## Tech Stack
- Node.js & Express
- MongoDB (Atlas)
- Cheerio (Scraping)

## Setup
1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file based on `.env.example`:
   ```
   MONGO_URI=mongodb+srv://...
   JWT_SECRET=...
   ```

3. **Run Locally**
   ```bash
   npm run dev
   ```

## Deployment
### Vercel
This project is configured for Vercel.
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel`.
3. Set Environment Variables in Vercel Dashboard.

## API Endpoints

### Auth
- `POST /auth/register` - { username, email, password, referralCode }
- `POST /auth/login` - { email, password }
- `GET /auth/me` - (Auth required) Get profile & points

### Referral
- `GET /api/referral/stats` - (Auth required) Get invite count and list

### Anime
- `GET /api/anime/search?q=naruto`
- `GET /api/anime/:id`
- `GET /api/anime/:id/episodes`
- `GET /api/anime/episodes/:episodeId` (Returns stream sources)

### History
- `GET /api/history`
- `POST /api/history` - { animeId, episodeId, progress, ... }

## Disclaimer
This project uses scraping techniques. Ensure you respect HiAnime's Terms of Service.
