import { revalidatePath } from 'next/cache';

/** Bust cached Insights HTML after CMS writes. Layout type covers /blog and /blog/[slug]. */
export function revalidatePublishedBlogPaths(): void {
  revalidatePath('/blog', 'layout');
  revalidatePath('/sitemap.xml');
}
