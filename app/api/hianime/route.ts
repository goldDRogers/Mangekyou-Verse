import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword');
  
  if (!keyword) {
    return NextResponse.json({ error: 'Keyword parameter is required' }, { status: 400 });
  }

  try {
    // Fetch search results from hianime.to
    const searchUrl = `https://hianime.to/search?keyword=${encodeURIComponent(keyword)}`;
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch hianime search results: ${response.status}`);
    }

    const html = await response.text();
    
    // Extract the first anime link from search results
    const directLink = extractFirstAnimeLink(html, keyword);
    
    if (directLink) {
      return NextResponse.json({ 
        success: true, 
        directUrl: directLink,
        fallbackUrl: searchUrl
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        fallbackUrl: searchUrl,
        error: 'No direct link found'
      });
    }
  } catch (error) {
    console.error('Error in hianime proxy:', error);
    
    // Return fallback search URL
    const fallbackUrl = `https://hianime.to/search?keyword=${encodeURIComponent(keyword)}`;
    return NextResponse.json({ 
      success: false, 
      fallbackUrl: fallbackUrl,
      error: 'Proxy failed, using fallback'
    });
  }
}

function extractFirstAnimeLink(html: string, keyword: string): string | null {
  try {
    // Look for anime links in the search results
    // The pattern is typically: <a href="/anime-name-id" class="item-link">
    const linkRegex = /<a[^>]+href="([^"]+)"[^>]*class="[^"]*item-link[^"]*"[^>]*>/gi;
    const matches = html.match(linkRegex);
    
    if (matches && matches.length > 0) {
      // Extract the href from the first match
      const hrefMatch = matches[0].match(/href="([^"]+)"/);
      if (hrefMatch && hrefMatch[1]) {
        const relativeUrl = hrefMatch[1];
        
        // Ensure it's a full URL
        if (relativeUrl.startsWith('/')) {
          return `https://hianime.to${relativeUrl}`;
        } else if (relativeUrl.startsWith('http')) {
          return relativeUrl;
        }
      }
    }
    
    // Alternative pattern: look for any links that look like anime pages
    const animeLinkRegex = /<a[^>]+href="\/([^"]+-\d+)"[^>]*>/gi;
    const animeMatches = html.match(animeLinkRegex);
    
    if (animeMatches && animeMatches.length > 0) {
      const hrefMatch = animeMatches[0].match(/href="\/([^"]+)"/);
      if (hrefMatch && hrefMatch[1]) {
        return `https://hianime.to/${hrefMatch[1]}`;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting anime link:', error);
    return null;
  }
}
