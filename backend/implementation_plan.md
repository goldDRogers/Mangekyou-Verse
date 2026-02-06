# Mangekyou Verse Backend - Implementation Plan

## 1. Project Overview
A Node.js/Express backend cloning HiAnime features with a custom Referral System and MongoDB storage.
**Directory**: `C:\Users\joshi\.gemini\antigravity\scratch\mangekyou-verse-backend`

## 2. Architecture
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Atlas)
- **Authentication**: JWT + bcryptjs
- **External Data**: Custom scraper/extractor for HiAnime data (respecting TOS/Robots).

## 3. Modules & Features
### A. Core Setup
- Express Server configuration
- MongoDB Connection (Mongoose)
- Error Handling Middleware
- CORS / Security Headers (Helmet)

### B. Authentication & Users
- **Models**: `User` (email, password, referralCode, referredBy, points)
- **Routes**: POST `/auth/register`, POST `/auth/login`, GET `/auth/me`
- **Logic**: 
    - generate `referralCode` on signup.
    - handle `referralCode` usage during registration.

### C. Referral System
- **Models**: `Referral` (referrerId, refereeId, status, timestamp)
- **Routes**: 
    - GET `/api/referral/stats` (user's invites)
    - POST `/api/referral/track` (manual tracking if needed)
- **Logic**: Update points/rewards when a referred user verifies/signs up.

### D. Anime Data (The "Clone" Aspect)
- **Service**: `AnimeService`
- **Strategy**: Scrape/Fetch from public sources (simulated or using `hianime-api` logic patterns).
- **Routes**:
    - GET `/api/anime/search?q=...`
    - GET `/api/anime/:id` (details)
    - GET `/api/anime/:id/episodes`
    - GET `/api/episodes/:episodeId/sources` (stream links)

### E. Watch History
- **Models**: `WatchHistory` (userId, animeId, episodeId, progress, timestamp)
- **Routes**:
    - POST `/api/history`
    - GET `/api/history`

## 4. Work Steps
1. **Initialize Project**: `package.json`, structure.
2. **Install Dependencies**: `express mongoose cors dotenv jsonwebtoken bcryptjs helmet morgan axios cheerio`.
3. **Draft Models**: User, Referral, WatchHistory.
4. **Implement Auth**: Register/Login with Referral integration.
5. **Implement Anime Service**: Basic scraping/fetching logic.
6. **Implement Routes**: Wire up controllers.
7. **Test**: Basic Jest tests for Auth & Referral logic.
8. **Documentation**: Deployment guide.

## 5. Security & Legal
- Rate limiting on scraper routes.
- No direct content hosting (only linking).
- Secure password storage.
