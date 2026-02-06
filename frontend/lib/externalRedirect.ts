// External Redirect Utilities for Mangekyou Verse
// Provides safe, explicit redirects to third-party streaming sites

export interface ExternalSite {
  name: string;
  baseUrl: string;
  searchPath: string;
  watchPath: string;
  icon: string;
}

// Supported external streaming sites
export const EXTERNAL_SITES: Record<string, ExternalSite> = {
  hianime: {
    name: 'HiAnime',
    baseUrl: 'https://hianime.to',
    searchPath: '/search',
    watchPath: '/watch', // Direct watch page path
    icon: 'fa-solid fa-external-link-alt'
  }
};

/**
 * Builds a safe search URL for hianime.to
 * @param animeTitle - The anime title from Jikan API
 * @returns Complete search URL for hianime.to
 */
export function buildHiAnimeSearchUrl(animeTitle: string): string {
  if (!animeTitle || typeof animeTitle !== 'string') {
    throw new Error('Invalid anime title provided');
  }

  // Clean and encode the title for safe URL construction
  const cleanTitle = animeTitle
    .trim()
    .replace(/[^\w\s\-\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/g, '') // Keep Japanese chars and basic alphanum
    .replace(/\s+/g, ' '); // Normalize spaces

  const encodedTitle = encodeURIComponent(cleanTitle);
  const site = EXTERNAL_SITES.hianime;
  
  return `${site.baseUrl}${site.searchPath}?keyword=${encodedTitle}`;
}

/**
 * Attempts to build a direct anime page URL for hianime.to
 * Uses title matching to find the most likely anime page
 * @param animeTitle - The anime title from Jikan API
 * @param malId - MyAnimeList ID from Jikan API
 * @returns Direct anime page URL or fallback to search URL
 */
export async function buildHiAnimeDirectUrl(animeTitle: string, malId?: number): Promise<string> {
  if (!animeTitle || typeof animeTitle !== 'string') {
    throw new Error('Invalid anime title provided');
  }

  try {
    // First try to find the anime page by searching and extracting the direct link
    const searchUrl = buildHiAnimeSearchUrl(animeTitle);
    const directUrl = await extractDirectAnimeLink(searchUrl, animeTitle);
    
    if (directUrl) {
      return directUrl;
    }
  } catch (error) {
    console.warn('Failed to extract direct link, falling back to search:', error);
  }

  // Fallback to search URL
  return buildHiAnimeSearchUrl(animeTitle);
}

/**
 * Extracts the direct anime page URL from hianime search results
 * Uses our proxy API to avoid CORS issues
 * @param searchUrl - The hianime search URL
 * @param targetTitle - The anime title we're looking for
 * @returns Direct anime page URL or null
 */
async function extractDirectAnimeLink(searchUrl: string, targetTitle: string): Promise<string | null> {
  try {
    // Use our proxy API to fetch and parse hianime search results
    const keyword = encodeURIComponent(targetTitle);
    const proxyUrl = `/api/hianime?keyword=${keyword}`;
    
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`Proxy API failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.directUrl) {
      return data.directUrl;
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting direct link:', error);
    return null;
  }
}

/**
 * Creates a URL-friendly slug from anime title
 * @param title - The anime title
 * @returns URL-friendly slug
 */
function createAnimeSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s\-\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/g, '') // Keep alphanum, spaces, hyphens, Japanese
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Opens an external site in a new tab with proper security attributes
 * @param url - The URL to open
 * @param siteName - Name of the external site for logging
 */
export function openExternalSite(url: string, siteName: string = 'external site'): void {
  if (!url || typeof url !== 'string') {
    console.error('Invalid URL provided for external redirect');
    return;
  }

  // Validate URL format
  try {
    new URL(url);
  } catch {
    console.error('Invalid URL format:', url);
    return;
  }

  // Log the redirect for analytics/debugging
  console.log(`Redirecting to ${siteName}:`, url);

  // Open in new tab with security attributes
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Creates a redirect handler for anime watching with direct link attempt
 * @param animeTitle - The anime title to search for
 * @param malId - MyAnimeList ID (optional)
 * @param siteKey - The external site key (default: 'hianime')
 */
export function createWatchRedirectHandler(animeTitle: string, malId?: number, siteKey: string = 'hianime') {
  return async () => {
    try {
      const site = EXTERNAL_SITES[siteKey];
      if (!site) {
        throw new Error(`Unsupported external site: ${siteKey}`);
      }

      // Show loading state (optional)
      console.log('Finding direct anime page...');

      // Try to get direct URL first
      const directUrl = await buildHiAnimeDirectUrl(animeTitle, malId);
      openExternalSite(directUrl, site.name);
    } catch (error) {
      console.error('Failed to create external redirect:', error);
      // Optionally show user feedback here
    }
  };
}

/**
 * Gets display information for an external site
 * @param siteKey - The external site key
 */
export function getExternalSiteInfo(siteKey: string = 'hianime'): ExternalSite | null {
  return EXTERNAL_SITES[siteKey] || null;
}

/**
 * Validates if a redirect URL is safe
 * @param url - URL to validate
 */
export function isValidRedirectUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    const allowedDomains = ['hianime.to'];
    return allowedDomains.includes(parsedUrl.hostname);
  } catch {
    return false;
  }
}

/**
 * Fallback function that always works - uses search URL
 * @param animeTitle - The anime title
 */
export function createSafeWatchRedirectHandler(animeTitle: string, siteKey: string = 'hianime') {
  return () => {
    try {
      const site = EXTERNAL_SITES[siteKey];
      if (!site) {
        throw new Error(`Unsupported external site: ${siteKey}`);
      }

      const searchUrl = buildHiAnimeSearchUrl(animeTitle);
      openExternalSite(searchUrl, site.name);
    } catch (error) {
      console.error('Failed to create external redirect:', error);
    }
  };
}
