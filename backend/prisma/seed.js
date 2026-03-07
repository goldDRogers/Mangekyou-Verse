const { PrismaClient } = require('@prisma/client');
const { slugify } = require('../utils/ingestHelper');
const prisma = new PrismaClient();

const manualShows = [
    {
        title: "Doraemon (India Redub)",
        description: "The classic 2005 era redub favored by regional fans in India. Includes Hindi dubs.",
        type: "CARTOON",
        posterUrl: "https://upload.wikimedia.org/wikipedia/en/c/c8/Doraemon_volume_1_cover.jpg",
        year: 2005,
        rating: 8.5,
        genres: ["Comedy", "Sci-Fi", "Kids"],
        region: "India",
        source: "MANUAL",
        status: "Ongoing"
    },
    {
        title: "Kiteretsu Daihyakka",
        description: "Classic sci-fi invention series by Fujiko F. Fujio, focusing on Kiteretsu's inventions.",
        type: "CARTOON",
        posterUrl: "https://upload.wikimedia.org/wikipedia/en/6/63/Kiteretsu_Daihyakka_vol_1.jpg",
        year: 1988,
        rating: 7.9,
        genres: ["Sci-Fi", "Comedy", "Slice of Life"],
        region: "Japan",
        source: "MANUAL",
        status: "Completed"
    },
    {
        title: "Shaktimaan (Animated)",
        description: "The animated node of India's legendary superhero Shaktimaan.",
        type: "CARTOON",
        posterUrl: "https://m.media-amazon.com/images/M/MV5BNMjExOTYzODMtMzY1MC00M2JlLTk4MzEtMGIzYmVlMzIyZTI3XkEyXkFqcGdeQXVyOTc5MDI5NjE@._V1_.jpg",
        year: 2011,
        rating: 6.5,
        genres: ["Action", "Superhero"],
        region: "India",
        source: "MANUAL",
        status: "Completed"
    }
];

async function main() {
    console.log("✍️  Seeding Manual Entries...");

    for (const show of manualShows) {
        const slug = slugify(show.title);

        await prisma.show.upsert({
            where: { slug },
            update: {},
            create: {
                ...show,
                slug
            }
        });
        console.log(`✅ Seeded: ${show.title}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
