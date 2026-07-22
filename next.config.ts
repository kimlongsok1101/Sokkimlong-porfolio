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
        // REPLACE with your actual Vercel project's deployed domain
        // or a wildcard for all subdomains under that domain.
        // For example: hostname: 'your-project-name.vercel.app',
        // Or using wildcard:
        hostname: '*.vercel.app', 
        port: '',
        pathname: '/projects/**', // Optional: strict restrict to this folder
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