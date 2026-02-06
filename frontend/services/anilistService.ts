/**
 * AniList GraphQL API Service
 * Provides additional anime metadata (studios, relations) not available in Jikan
 * Docs: https://anilist.gitbook.io/anilist-apiv2-docs/
 */

const ANILIST_API = 'https://graphql.anilist.co';

interface AniListAnime {
    id: number;
    idMal: number;
    title: {
        romaji: string;
        english: string;
        native: string;
    };
    studios: {
        nodes: Array<{
            id: number;
            name: string;
            isAnimationStudio: boolean;
        }>;
    };
    relations: {
        edges: Array<{
            id: number;
            relationType: string; // SEQUEL, PREQUEL, SIDE_STORY, etc.
            node: {
                id: number;
                idMal: number;
                title: {
                    romaji: string;
                    english: string;
                };
                type: string;
                format: string;
                coverImage: {
                    large: string;
                };
            };
        }>;
    };
    characters: {
        edges: Array<{
            role: string;
            node: {
                id: number;
                name: {
                    full: string;
                };
                image: {
                    large: string;
                };
            };
            voiceActors: Array<{
                id: number;
                name: {
                    full: string;
                };
                language: string;
            }>;
        }>;
    };
    staff: {
        edges: Array<{
            role: string;
            node: {
                id: number;
                name: {
                    full: string;
                };
            };
        }>;
    };
    trailer: {
        id: string;
        site: string;
        thumbnail: string;
    } | null;
}

export interface AnimeRelation {
    id: number;
    malId: number;
    title: string;
    type: string; // SEQUEL, PREQUEL, SIDE_STORY, etc.
    format: string; // TV, MOVIE, OVA, etc.
    coverImage: string;
}

export interface AnimeStudio {
    id: number;
    name: string;
    isAnimationStudio: boolean;
}

export interface AnimeCharacter {
    id: number;
    name: string;
    role: string; // MAIN, SUPPORTING, BACKGROUND
    image: string;
    voiceActor?: {
        id: number;
        name: string;
        language: string;
    };
}

export interface AniListData {
    studios: AnimeStudio[];
    relations: AnimeRelation[];
    characters: AnimeCharacter[];
    trailer: {
        id: string;
        site: string;
        thumbnail: string;
    } | null;
}

const fetchAniList = async (query: string, variables: any): Promise<any> => {
    try {
        const response = await fetch(ANILIST_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ query, variables }),
            next: { revalidate: 3600 }, // Cache for 1 hour
        });

        if (!response.ok) {
            throw new Error(`AniList API Error: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.errors) {
            console.error('AniList GraphQL Errors:', data.errors);
            return null;
        }

        return data.data;
    } catch (error) {
        console.error('AniList Fetch Error:', error);
        return null;
    }
};

export const anilistService = {
    /**
     * Get anime details by MAL ID
     * Returns studios, relations, characters, and trailer
     */
    getAnimeByMALId: async (malId: number): Promise<AniListData | null> => {
        const query = `
            query ($malId: Int) {
                Media(idMal: $malId, type: ANIME) {
                    id
                    idMal
                    title {
                        romaji
                        english
                        native
                    }
                    studios(isMain: true) {
                        nodes {
                            id
                            name
                            isAnimationStudio
                        }
                    }
                    relations {
                        edges {
                            id
                            relationType
                            node {
                                id
                                idMal
                                title {
                                    romaji
                                    english
                                }
                                type
                                format
                                coverImage {
                                    large
                                }
                            }
                        }
                    }
                    characters(sort: ROLE, perPage: 12) {
                        edges {
                            role
                            node {
                                id
                                name {
                                    full
                                }
                                image {
                                    large
                                }
                            }
                            voiceActors(language: JAPANESE, sort: RELEVANCE) {
                                id
                                name {
                                    full
                                }
                                language
                            }
                        }
                    }
                    trailer {
                        id
                        site
                        thumbnail
                    }
                }
            }
        `;

        const data = await fetchAniList(query, { malId });

        if (!data || !data.Media) {
            return null;
        }

        const media: AniListAnime = data.Media;

        return {
            studios: media.studios?.nodes?.filter(s => s.isAnimationStudio) || [],
            relations: media.relations?.edges?.map(edge => ({
                id: edge.node.id,
                malId: edge.node.idMal,
                title: edge.node.title.english || edge.node.title.romaji,
                type: edge.relationType,
                format: edge.node.format,
                coverImage: edge.node.coverImage.large,
            })) || [],
            characters: media.characters?.edges?.slice(0, 12).map(edge => ({
                id: edge.node.id,
                name: edge.node.name.full,
                role: edge.role,
                image: edge.node.image.large,
                voiceActor: edge.voiceActors?.[0] ? {
                    id: edge.voiceActors[0].id,
                    name: edge.voiceActors[0].name.full,
                    language: edge.voiceActors[0].language,
                } : undefined,
            })) || [],
            trailer: media.trailer,
        };
    },

    /**
     * Search anime by title (for cross-referencing)
     */
    searchAnime: async (title: string): Promise<{ id: number; malId: number } | null> => {
        const query = `
            query ($search: String) {
                Media(search: $search, type: ANIME) {
                    id
                    idMal
                }
            }
        `;

        const data = await fetchAniList(query, { search: title });

        if (!data || !data.Media) {
            return null;
        }

        return {
            id: data.Media.id,
            malId: data.Media.idMal,
        };
    },

    /**
     * Get trending anime from AniList
     */
    getTrending: async (page: number = 1, perPage: number = 12): Promise<any[]> => {
        const query = `
            query ($page: Int, $perPage: Int) {
                Page(page: $page, perPage: $perPage) {
                    media(sort: TRENDING_DESC, type: ANIME) {
                        id
                        idMal
                        title {
                            romaji
                            english
                        }
                        coverImage {
                            large
                        }
                        averageScore
                        episodes
                        format
                        status
                        genres
                    }
                }
            }
        `;

        const data = await fetchAniList(query, { page, perPage });

        if (!data || !data.Page) {
            return [];
        }

        return data.Page.media;
    },
};

export default anilistService;
