/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  async redirects() {
    return [
      { source: '/best-picks', destination: '/football-predictions', permanent: true },
      { source: '/best-picks/:path*', destination: '/football-predictions/:path*', permanent: true },
    ];
  },
};

module.exports = nextConfig;


