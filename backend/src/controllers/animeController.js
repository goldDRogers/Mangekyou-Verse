const scraperService = require('../services/scraperService');

// In-memory cache for demo purposes
let cache = {
    trending: null,
    search: {},
    details: {}
};

exports.searchAnime = async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.status(400).json({ error: 'Query parameter "q" is required' });
        }

        if (cache.search[query]) {
            return res.json(cache.search[query]);
        }

        const results = await scraperService.searchAnime(query);
        cache.search[query] = results;
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Failed to search anime' });
    }
};

exports.getAnimeDetails = async (req, res) => {
    try {
        const id = req.params.id;
        if (cache.details[id]) {
            return res.json(cache.details[id]);
        }

        const details = await scraperService.getAnimeDetails(id);
        cache.details[id] = details;
        res.json(details);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get anime details' });
    }
};

exports.getAnimeEpisodes = async (req, res) => {
    try {
        const id = req.params.id;
        const episodes = await scraperService.getAnimeEpisodes(id);
        res.json(episodes);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get episodes' });
    }
};

exports.getEpisodeSources = async (req, res) => {
    try {
        const { episodeId } = req.query;
        if (!episodeId) {
            return res.status(400).json({ error: 'Episode ID is required' });
        }
        const sources = await scraperService.getEpisodeSources(episodeId);
        res.json(sources);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get sources' });
    }
};

exports.getSpotlight = async (req, res) => {
    // In a real app, this would fetch from DB sorted by popularity/views
    // For now, returning premium curated data for the demo
    const spotlightData = [
        {
            id: "jujutsu-kaisen-2nd-season-18413",
            rank: 1,
            title: "Jujutsu Kaisen 2nd Season",
            description: "Sorcerers vs Curses. The past arc of Gojo Satoru and the Shibuya Incident.",
            poster: "https://upload.wikimedia.org/wikipedia/en/4/46/Jujutsu_Kaisen_Season_2_KV.jpg",
            banner: "https://images6.alphacoders.com/133/1330238.png",
            type: "TV",
            duration: "24m",
            quality: "HD"
        },
        {
            id: "one-piece-100",
            rank: 2,
            title: "One Piece",
            description: "Monkey D. Luffy refuses to let anyone or anything stand in the way of his quest to become the king of all pirates.",
            poster: "https://upload.wikimedia.org/wikipedia/en/9/90/One_Piece%2C_Volume_61_Cover_%28Japanese%29.jpg",
            banner: "https://images8.alphacoders.com/134/1344403.jpeg",
            type: "TV",
            duration: "24m",
            quality: "HD"
        },
        {
            id: "solo-leveling-18718",
            rank: 3,
            title: "Solo Leveling",
            description: "Ten years ago, 'the Gate' appeared and connected the real world with the realm of magic and monsters.",
            poster: "https://upload.wikimedia.org/wikipedia/en/9/9c/Solo_Leveling_Webtoon_Vol_1.jpg",
            banner: "https://images4.alphacoders.com/134/1346267.jpeg",
            type: "TV",
            duration: "24m",
            quality: "HD"
        },
        {
            id: "demon-slayer-kimetsu-no-yaiba-47",
            rank: 4,
            title: "Demon Slayer: Kimetsu no Yaiba",
            description: "It is the Taisho Period in Japan. Tanjiro, a kindhearted boy who sells charcoal for a living, finds his family slaughtered by a demon.",
            poster: "https://upload.wikimedia.org/wikipedia/en/0/09/Demon_Slayer_-_Kimetsu_no_Yaiba%2C_volume_1.jpg",
            banner: "https://images7.alphacoders.com/131/1314905.jpeg",
            type: "TV",
            duration: "24m",
            quality: "HD"
        }
    ];
    res.json(spotlightData);
};

exports.getTrending = async (req, res) => {
    // Mock trending data
    const trendingData = [
        { id: "sousou-no-frieren-18416", rank: 1, title: "Frieren: Beyond Journey's End", poster: "https://upload.wikimedia.org/wikipedia/en/d/d5/Frieren_anime_promotional_image.jpg" },
        { id: "mashle-2nd-season-18755", rank: 2, title: "Mashle: Magic and Muscles", poster: "https://upload.wikimedia.org/wikipedia/en/3/30/Mashle_volume_1_cover.jpg" },
        { id: "classroom-of-the-elite-3rd-season-18751", rank: 3, title: "Classroom of the Elite III", poster: "https://upload.wikimedia.org/wikipedia/en/2/25/Classroom_of_the_Elite_light_novel_volume_1_cover.jpg" },
        { id: "chainsaw-man-17406", rank: 4, title: "Chainsaw Man", poster: "https://upload.wikimedia.org/wikipedia/en/3/3b/Chainsaw_Man_Vol_1.png" },
        { id: "bleach-sennen-kessen-hen-17906", rank: 5, title: "Bleach: Thousand-Year Blood War", poster: "https://upload.wikimedia.org/wikipedia/en/7/72/Bleach_Vol._1.jpg" },
        { id: "blue-lock-17861", rank: 6, title: "Blue Lock", poster: "https://upload.wikimedia.org/wikipedia/en/3/3b/Blue_Lock_volume_1_cover.jpg" }
    ];
    res.json(trendingData);
};
