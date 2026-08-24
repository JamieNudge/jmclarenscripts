import type { MetadataRoute } from 'next';
import { listPublishedPosts } from '@/lib/blog-server';
import { goalLabPublicBase } from '@/lib/hub-football-routes';

export const revalidate = 86400;
export const runtime = 'nodejs';

const HUB_PATHS = [
  '/',
  '/blog',
  '/about',
  '/contact',
  '/fixtures',
  '/methodology',
  '/research-algorithm-selections',
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = goalLabPublicBase();
  const posts = await listPublishedPosts();

  const hub: MetadataRoute.Sitemap = HUB_PATHS.map((path) => ({
    url: path === '/' ? base : `${base}${path}`,
    changeFrequency: path === '/' || path === '/fixtures' ? 'daily' : 'weekly',
    priority: path === '/' ? 1 : path === '/blog' ? 0.8 : 0.6,
  }));

  const articles: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: post.updatedAt || post.publishedAt || undefined,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...hub, ...articles];
}
