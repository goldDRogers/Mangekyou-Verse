
import { GoogleGenAI, Type } from "@google/genai";
import { Anime } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateAnimeList = async (count: number = 8): Promise<Anime[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a list of ${count} fictional anime titles with short descriptions, ratings, genres, types (TV, Movie, OVA, ONA, Special). Provide the data as a clean JSON array.`,
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

    const data = JSON.parse(response.text || '[]');
    
    return data.map((item: any) => ({
      ...item,
      thumbnail: `https://picsum.photos/seed/${item.id}/400/600`
    }));
  } catch (error) {
    console.error("Error generating anime list:", error);
    return [];
  }
};

export const generateThumbnail = async (prompt: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `High quality anime style illustration for: ${prompt}` }]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating thumbnail:", error);
    return null;
  }
};
