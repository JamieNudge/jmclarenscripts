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
  async headers() {
    return [
      {
        source: '/football-predictions',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
      {
        source: '/football-predictions/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
      {
        source: '/api/and-another-thing',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
      {
        source: '/api/and-another-thing-live',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
    ];
  },
};

module.exports = nextConfig;


