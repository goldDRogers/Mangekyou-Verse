/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'cdn.myanimelist.net',
            },
            {
                protocol: 'https',
                hostname: 'myanimelist.net',
            },
            {
                protocol: 'https',
                hostname: 'image.tmdb.org',
            },
            {
                protocol: 'https',
                hostname: 'cdn.noitatnemucod.net',
            },
            {
                protocol: 'https',
                hostname: 's4.anilist.co',
            },
            {
                protocol: 'https',
                hostname: 'media.kitsu.io',
            },
            {
                protocol: 'https',
                hostname: 'ui-avatars.com',
            },
            {
                protocol: 'https',
                hostname: 'img.youtube.com',
            },
            {
                protocol: 'https',
                hostname: 'upload.wikimedia.org',
            }
        ],
        minimumCacheTTL: 60,
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://localhost:5001/api/:path*',
            },
            {
                source: '/auth/:path*',
                destination: 'http://localhost:5001/auth/:path*',
            },
        ];
    },
};

export default nextConfig;
