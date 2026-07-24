// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // If your project uses ESLint during builds, this might speed up builds:
  // eslint: { ignoreDuringBuilds: true },

  images: {
    // remotePatterns is the secure, modern way to configure this
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
      // IMPORTANT: Also allow localhost if you serve these locally during development
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000', // Update if you use a different port locally
        pathname: '/projects/**',
      },
    ],
  },
};

module.exports = nextConfig;