import { GoogleGenAI, Type } from "@google/genai";
import { Anime } from "../types";

const CACHE_KEY = 'mangekyou_anime_cache';
const CACHE_EXPIRY = 1000 * 60 * 60; // 1 hour

const getApiKey = () => {
  try {
    return (process.env.NEXT_PUBLIC_GEMINI_API_KEY) ||
      (process.env.GEMINI_API_KEY) ||
      // @ts-ignore
      (import.meta.env?.VITE_GEMINI_API_KEY) ||
      '';
  } catch (e) {
    return '';
  }
};

const getAIClient = () => {
  const key = getApiKey();
  if (!key) return null;
  try {
    // For @google/genai v1.34.0, the constructor takes an object or just the key depending on version
    // Based on previous working code, it expects an object with apiKey
    return new GoogleGenAI({ apiKey: key });
  } catch (e) {
    console.error("Failed to initialize GoogleGenAI", e);
    return null;
  }
};

const ai = getAIClient();

export const generateAnimeList = async (count: number = 8): Promise<Anime[]> => {
  // Graceful fallback if API fails
  const mockData = Array.from({ length: count }).map((_, i) => ({
    id: `mock-id-${i}`,
    title: `Anime Title ${i + 1}`,
    description: "This is a fallback description because the AI service is currently unavailable or the quota has been exceeded. Please check back in an hour or add your own Gemini API key.",
    rating: (Math.random() * 5 + 5).toFixed(1),
    episodes: 12 + i,
    type: 'TV',
    status: 'Finished',
    genres: ['Action', 'Fantasy'],
    thumbnail: `https://loremflickr.com/800/1200/anime,girl,scenery/all?lock=${i}`,
    gallery: [
      `https://loremflickr.com/1280/720/anime,background,scenery/all?lock=${i + 10}`,
      `https://loremflickr.com/1280/720/anime,fight,action/all?lock=${i + 20}`,
      `https://loremflickr.com/1280/720/anime,city,night/all?lock=${i + 30}`
    ]
  })) as unknown as Anime[];

  // 1. Check Cache first to save quota
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_EXPIRY && data.length >= count) {
          console.log("Using cached anime list to save Gemini quota.");
          return data.slice(0, count);
        }
      }
    } catch (e) {
      console.warn("Failed to read from cache", e);
    }
  }

  try {
    const key = getApiKey();
    if (!ai || !key) {
      console.warn("Gemini API Key missing. Using fallback data.");
      return mockData;
    }

    // Use the API pattern that was working before (ai.models.generateContent)
    // @ts-ignore
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash', // Fixed model name
      contents: [{ role: 'user', parts: [{ text: `Generate a list of 18 fictional anime titles with short descriptions, ratings, genres, types (TV, Movie, OVA, ONA, Special). Provide the data as a clean JSON array.` }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              rating: { type: Type.NUMBER },
              episodes: { type: Type.NUMBER },
              type: { type: Type.STRING },
              status: { type: Type.STRING },
              genres: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["id", "title", "description", "rating", "episodes", "type", "status", "genres"]
          }
        }
      }
    });

    // @ts-ignore
    const data = JSON.parse(response.text || '[]');

    const processedData = data.map((item: any, idx: number) => ({
      ...item,
      thumbnail: `https://loremflickr.com/800/1200/anime,cover/all?lock=${idx}`,
      gallery: [
        `https://loremflickr.com/1280/720/anime,scenery/all?lock=${idx + 100}`,
        `https://loremflickr.com/1280/720/anime,character/all?lock=${idx + 200}`,
        `https://loremflickr.com/1280/720/anime,scene/all?lock=${idx + 300}`
      ]
    }));

    // 2. Save to Cache
    if (typeof window !== 'undefined') {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: processedData,
        timestamp: Date.now()
      }));
    }

    return processedData;
  } catch (error: any) {
    // Graceful handling of common 429 quota errors
    if (error?.message?.includes('429') || error?.message?.includes('quota') || error?.status === 429) {
      console.error("Gemini Quota Exceeded. Switching to fallback data...");
    } else {
      console.error("Error generating anime list:", error);
    }
    return mockData;
  }
};

export const generateThumbnail = async (prompt: string): Promise<string | null> => {
  try {
    if (!ai) return null;
    // @ts-ignore
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [{ role: 'user', parts: [{ text: `High quality anime style illustration for: ${prompt}` }] }]
    });

    // @ts-ignore
    const candidates = response.candidates || [];
    for (const part of candidates[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    // Fallback if no image is returned
    return `https://picsum.photos/seed/${encodeURIComponent(prompt)}/400/600`;
  } catch (error) {
    console.error("Error generating thumbnail:", error);
    return null;
  }
};

export const searchAnime = async (query: string, count: number = 12): Promise<Anime[]> => {
  try {
    const key = getApiKey();
    if (!ai || !key) {
      console.warn("Gemini API Key missing. Using fallback data for search.");
      return generateAnimeList(count);
    }

    // @ts-ignore
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [{
        role: 'user',
        parts: [{ text: `Search for anime related to "${query}". Generate ${count} fictional anime titles that would match this search term, with short descriptions, ratings, genres, types (TV, Movie, OVA, ONA, Special). Provide the data as a clean JSON array.` }]
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              rating: { type: Type.NUMBER },
              episodes: { type: Type.NUMBER },
              type: { type: Type.STRING },
              status: { type: Type.STRING },
              genres: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["id", "title", "description", "rating", "episodes", "type", "status", "genres"]
          }
        }
      }
    });

    // @ts-ignore
    const data = JSON.parse(response.text || '[]');

    return data.map((item: any, idx: number) => ({
      ...item,
      thumbnail: `https://loremflickr.com/800/1200/anime,search/all?lock=${idx}`,
      gallery: [
        `https://loremflickr.com/1280/720/anime,scenery/all?lock=${idx + 400}`,
        `https://loremflickr.com/1280/720/anime,action/all?lock=${idx + 500}`,
        `https://loremflickr.com/1280/720/anime,art/all?lock=${idx + 600}`
      ]
    }));
  } catch (error: any) {
    console.error("Error searching anime:", error);
    return generateAnimeList(count);
  }
};

export const getAnimeDetails = async (id: string): Promise<Anime | null> => {
  // 1. Check Cache first
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data } = JSON.parse(cached);
        const anime = data.find((a: Anime) => a.id === id);
        if (anime) return anime;
      }
    } catch (e) {
      console.warn("Failed to read from cache", e);
    }
  }

  // 2. If not in cache, generate details
  try {
    const key = getApiKey();
    if (!ai || !key) return null;

    // @ts-ignore
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [{
        role: 'user',
        parts: [{ text: `Generate detailed information for a fictional anime with ID "${id}". Provide title, description, rating, episodes, type, status, and genres as a clean JSON object.` }]
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            rating: { type: Type.NUMBER },
            episodes: { type: Type.NUMBER },
            type: { type: Type.STRING },
            status: { type: Type.STRING },
            genres: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["id", "title", "description", "rating", "episodes", "type", "status", "genres"]
        }
      }
    });

    // @ts-ignore
    const data = JSON.parse(response.text || '{}');
    return {
      ...data,
      thumbnail: `https://loremflickr.com/800/1200/anime,main/all?lock=${id.length}`,
      gallery: [
        `https://loremflickr.com/1280/720/anime,wallpaper/all?lock=${id.length + 10}`,
        `https://loremflickr.com/1280/720/anime,screenshot/all?lock=${id.length + 20}`,
        `https://loremflickr.com/1280/720/anime,scene/all?lock=${id.length + 30}`
      ]
    };
  } catch (error) {
    console.error("Error fetching anime details:", error);
    return null;
  }
};
