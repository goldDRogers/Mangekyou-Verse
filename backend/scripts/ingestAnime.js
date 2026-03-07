const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const { slugify, sleep } = require('../utils/ingestHelper');

const prisma = new PrismaClient();

async function ingestAnime() {
    console.log("🌌 Manifesting Jikan Anime Node...");

    for (let page = 1; page <= 5; page++) { // Adjust pages for full sync (e.g., 50+)
        try {
            const { data } = await axios.get(`https://api.jikan.moe/v4/anime?page=${page}`);

            for (const anime of data.data) {
                const slug = slugify(anime.title);

                await prisma.show.upsert({
                    where: { slug },
                    update: { rating: anime.score }, // Update score if already exists
                    create: {
                        externalId: anime.mal_id.toString(),
                        title: anime.title,
                        slug,
                        type: 'ANIME',
                        description: anime.synopsis || "Plot manifest unavailable.",
                        posterUrl: anime.images.jpg.large_image_url,
                        year: anime.year,
                        rating: anime.score,
                        genres: anime.genres.map(g => g.name),
                        source: 'JIKAN',
                        status: anime.status
                    }
                });
                console.log(`✅ Synced: ${anime.title}`);
            }

            console.log(`✅ Synced Page ${page}`);
            await sleep(1000); // Jikan Rate Limit protection
        } catch (e) {
            console.error(`Sync Interrupted on page ${page}:`, e.message);
            // If error is 429 (Too Many Requests), wait longer
            if (e.response && e.response.status === 429) {
                console.warn("Rate limit hit. Waiting 5s...");
                await sleep(5000);
                page--; // Retry this page
            }
        }
    }
}

ingestAnime()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
