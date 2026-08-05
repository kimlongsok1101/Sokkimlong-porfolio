// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'oaymlrersakgnekalfdi.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/projects/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/projects/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/projects/**',
      },
      // --- ADDED FOR DISCORD & SPOTIFY LANYARD IMAGES ---
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
      },
      {
        protocol: 'https',
        hostname: 'media.discordapp.net',
      },
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
      },
    ],
  },
};

module.exports = nextConfig;