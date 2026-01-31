# Jikan API Integration Documentation

## Overview

Mangekyou Verse now uses the **Jikan API v4** as its primary data source for anime metadata. This provides a legal, free, and comprehensive anime database that mimics real anime streaming platforms.

## Data Source

- **API**: Jikan API v4 (https://api.jikan.moe/v4)
- **Cost**: FREE (no API key required)
- **Rate Limits**: Built-in rate limiting (1 second between requests)
- **Data**: Real anime metadata from MyAnimeList

## Architecture

### Data Flow
```
Jikan API → Frontend → Supabase (user data only)
```

1. **Anime Metadata**: Fetched directly from Jikan API
2. **User Data**: Stored in Supabase (watchlist, watch history)
3. **No Anime Storage**: We don't store anime metadata in our database

### Key Components

#### 1. Jikan API Client (`/lib/jikan.ts`)
- **Rate Limiting**: 1 second between requests
- **Caching**: In-memory cache with TTL
- **Error Handling**: Graceful fallbacks
- **Type Safety**: Full TypeScript support

#### 2. Anime Service (`/services/animeService.ts`)
- Converts Jikan data to our `Anime` type
- Provides helper functions for common operations
- Maps Jikan fields to our schema

#### 3. User Services (`/services/watchlistService.ts`)
- Watchlist management with Jikan integration
- Watch history with progress tracking
- Continue Watching functionality

## Features Implemented

### 1. Home Page Sections

#### Spotlight (Top Anime)
- **Endpoint**: `/top/anime`
- **Data**: Top 10 anime by ranking
- **Auto-slide**: Every 5 seconds
- **Ranking**: #1-#10 display

#### Trending (Popular Anime)
- **Endpoint**: `/top/anime?filter=bypopularity`
- **Data**: Top 20 by popularity
- **Carousel**: Horizontal scroll with arrows

#### Recent Anime (Current Season)
- **Endpoint**: `/seasons/now`
- **Data**: Currently airing anime
- **Grid**: 2x6 layout

### 2. Anime Details Page
- **Endpoint**: `/anime/{id}`
- **Data**: Full anime information
- **Episodes**: `/anime/{id}/episodes`
- **Images**: High-quality posters and banners

### 3. Search Functionality
- **Endpoint**: `/anime?q={query}`
- **Real-time**: Search as you type
- **Results**: Paginated with loading states

### 4. User Features

#### Watchlist
- **Storage**: Supabase (user_id, anime_id, created_at)
- **Display**: Real anime data from Jikan
- **Actions**: Add/remove from watchlist

#### Watch History
- **Storage**: Supabase (user_id, anime_id, episode_id, progress_seconds)
- **Resume**: Continue watching from last position
- **Progress**: Visual progress bars

#### Continue Watching
- **Logic**: Last 10 watched items
- **Display**: Real anime thumbnails and titles
- **Progress**: Accurate progress calculation

## API Rate Limiting

### Implementation
```typescript
private minRequestInterval = 1000; // 1 second between requests

// Rate limiting logic
if (now - this.lastRequestTime < this.minRequestInterval) {
    await new Promise(resolve => 
        setTimeout(resolve, this.minRequestInterval - (now - this.lastRequestTime))
    );
}
```

### Caching Strategy
- **TTL**: 5 minutes for most data
- **Episodes**: 10 minutes cache
- **Genres**: 1 hour cache
- **Memory**: In-memory Map storage

## Data Mapping

### Jikan → Our Types
```typescript
const convertJikanToAnime = (jikanAnime: JikanAnime): Anime => ({
    id: jikanAnime.mal_id.toString(),
    title: jikanAnime.title,
    description: jikanAnime.synopsis,
    type: mapType(jikanAnime.type),
    status: mapStatus(jikanAnime.status),
    rating: jikanAnime.score || 0,
    episodes: jikanAnime.episodes || 0,
    genres: jikanAnime.genres.map(genre => genre.name),
    thumbnail: jikanAnime.images.jpg.image_url,
    // ... more mappings
});
```

## Legal Compliance

### ✅ What We Do
- Use official Jikan API (free and legal)
- Respect rate limits
- Use public anime metadata
- Store only user data in our database

### ❌ What We Don't Do
- Scrape websites directly
- Store copyrighted anime metadata
- Use copyrighted images
- Store video content

## Performance Optimizations

### 1. Caching
- In-memory cache reduces API calls
- TTL prevents stale data
- Cache invalidation on errors

### 2. Batch Operations
- Parallel API requests where possible
- Promise.all for multiple fetches
- Error isolation per request

### 3. Loading States
- Skeleton loaders during fetch
- Graceful error handling
- Fallback to cached data

## Error Handling

### API Errors
- Network failures → Return empty arrays
- Rate limits → Automatic retry with delay
- Invalid data → Graceful degradation

### User Experience
- Loading indicators
- Error messages
- Fallback content

## Testing

### Manual Testing
1. **Home Page**: Verify Spotlight, Trending, Recent sections
2. **Search**: Test various anime titles
3. **Details**: Check anime pages load correctly
4. **User Features**: Test watchlist and history

### Performance Testing
- Monitor API response times
- Check cache hit rates
- Verify rate limiting works

## Configuration

### Environment Variables
No additional environment variables needed - Jikan API is free.

### Cache Configuration
```typescript
// Adjust TTL values as needed
const CACHE_TTL = {
    default: 300000,    // 5 minutes
    episodes: 600000,   // 10 minutes
    genres: 3600000,    // 1 hour
};
```

## Future Enhancements

### Possible Additions
1. **Genre Filtering**: Use `/genres/anime` endpoint
2. **Seasonal Data**: Enhanced seasonal information
3. **Recommendations**: Related anime suggestions
4. **Character Data**: Character information and images

### Performance Improvements
1. **Redis Cache**: Server-side caching
2. **CDN**: Image optimization
3. **Background Sync**: Preload popular content

## Troubleshooting

### Common Issues

#### API Rate Limits
- **Symptom**: 429 errors
- **Solution**: Built-in rate limiting prevents this

#### Missing Images
- **Symptom**: Broken image URLs
- **Solution**: Fallback to placeholder images

#### Slow Loading
- **Symptom**: Initial page load is slow
- **Solution**: Cache warming for popular content

### Debug Tools
```typescript
// Check cache stats
console.log(jikanClient.getCacheStats());

// Clear cache if needed
jikanClient.clearCache();
```

## Conclusion

This Jikan API integration provides Mangekyou Verse with:
- **Real anime data** from a legal source
- **Professional user experience** with fast loading
- **Scalable architecture** for future growth
- **Legal compliance** for portfolio use

The system behaves like a real anime streaming platform while remaining 100% free and legal.
