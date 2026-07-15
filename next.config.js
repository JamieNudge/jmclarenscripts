/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  async redirects() {
    return [
      { source: '/best-picks', destination: '/football-predictions', permanent: true },
      { source: '/best-picks/:path*', destination: '/football-predictions/:path*', permanent: true },
      // GoalLab V2 preview paths → canonical (cutover)
      { source: '/football-predictions/v2', destination: '/football-predictions', permanent: true },
      {
        source: '/football-predictions/v2/fixtures',
        destination: '/football-predictions/fixtures',
        permanent: true,
      },
      {
        source: '/football-predictions/v2/fixtures/:fixtureId',
        destination: '/football-predictions/fixtures/:fixtureId',
        permanent: true,
      },
      {
        source: '/football-predictions/v2/research',
        destination: '/football-predictions/research-algorithm-selections',
        permanent: true,
      },
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


