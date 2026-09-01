import type { MetadataRoute } from 'next';
import { goalLabPublicBase } from '@/lib/hub-football-routes';

export default function robots(): MetadataRoute.Robots {
  const base = goalLabPublicBase();
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/ads.txt', '/app-ads.txt'],
      disallow: ['/admin'],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
