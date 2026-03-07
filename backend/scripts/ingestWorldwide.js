const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const { slugify, sleep } = require('../utils/ingestHelper');

const prisma = new PrismaClient();
const TMDB_KEY = process.env.TMDB_API_KEY;

if (!TMDB_KEY) {
    console.error("❌ CRITICAL: TMDB_API_KEY missing in .env. Skipping Worldwide Ingestion.");
    process.exit(1);
}

async function ingestWorldwide() {
    console.log("🌍 Manifesting Worldwide Cartoons & Movies...");

    // 1. Fetch TV Cartoons (Genre 16 = Animation)
    console.log("📺 Fetching TV Animation...");
    for (let page = 1; page <= 5; page++) {
        try {
            const url = `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_KEY}&with_genres=16&sort_by=popularity.desc&page=${page}&language=en-US`;
            const { data } = await axios.get(url);

            for (const show of data.results) {
                const slug = slugify(show.name);

                // Skip if already exists (e.g. from Jikan/Anime script)
                const existing = await prisma.show.findUnique({ where: { slug } });
                if (existing && existing.source === 'JIKAN') continue;

                await prisma.show.upsert({
                    where: { slug },
                    update: {},
                    create: {
                        externalId: show.id.toString(),
                        title: show.name,
                        slug,
                        type: 'CARTOON',
                        description: show.overview || "No synopsis available.",
                        posterUrl: `https://image.tmdb.org/t/p/w500${show.poster_path}`,
                        year: show.first_air_date ? parseInt(show.first_air_date.split('-')[0]) : null,
                        rating: show.vote_average,
                        genres: ["Animation"],
                        source: 'TMDB',
                        language: show.original_language,
                        status: "Released"
                    }
                });
                console.log(`✅ Synced Cartoon: ${show.name}`);
            }
            await sleep(500); // 500ms delay
        } catch (e) { console.error(`TV Sync Error Page ${page}:`, e.message); }
    }

    // 2. Fetch Animated Movies (Genre 16)
    console.log("🎬 Fetching Animated Movies...");
    for (let page = 1; page <= 5; page++) {
        try {
            const url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_KEY}&with_genres=16&sort_by=popularity.desc&page=${page}&language=en-US`;
            const { data } = await axios.get(url);

            for (const movie of data.results) {
                const slug = slugify(movie.title);

                const existing = await prisma.show.findUnique({ where: { slug } });
                if (existing && existing.source === 'JIKAN') continue;

                await prisma.show.upsert({
                    where: { slug },
                    update: {},
                    create: {
                        externalId: movie.id.toString(),
                        title: movie.title,
                        slug,
                        type: 'MOVIE', // Differentiate movies
                        description: movie.overview || "No synopsis available.",
                        posterUrl: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                        year: movie.release_date ? parseInt(movie.release_date.split('-')[0]) : null,
                        rating: movie.vote_average,
                        genres: ["Animation"],
                        source: 'TMDB',
                        language: movie.original_language,
                        status: "Released"
                    }
                });
                console.log(`✅ Synced Movie: ${movie.title}`);
            }
            await sleep(500);
        } catch (e) { console.error(`Movie Sync Error Page ${page}:`, e.message); }
    }
}

ingestWorldwide()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
