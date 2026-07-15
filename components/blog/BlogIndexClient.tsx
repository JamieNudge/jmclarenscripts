'use client';

import Link from 'next/link';
import { usePublishedBlogCategories } from '@/hooks/usePublishedBlogCategories';
import { usePublishedBlogPosts } from '@/hooks/usePublishedBlogPosts';
import { resolveBlogCategoryLabel } from '@/lib/blog-category';
import { blogTextFontFamily } from '@/lib/fonts';

function BlogCardParts({
  categoryLine,
  title,
  excerpt,
  dateStr,
  titleAs,
  excerptTone = 'default',
}: {
  categoryLine: string | null;
  title: string;
  excerpt: string | null;
  dateStr: string;
  titleAs: 'h2' | 'h3';
  /** Hero overlay: slightly brighter excerpt on gradient */
  excerptTone?: 'default' | 'hero';
}) {
  const excerptCls =
    excerptTone === 'hero'
      ? 'text-sm text-[var(--hub-text-soft)] mt-2 leading-relaxed line-clamp-3'
      : 'text-sm text-[var(--hub-text-muted)] mt-2 leading-relaxed line-clamp-3';

  return (
    <>
      {categoryLine ? (
        <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-200/90 mb-2">{categoryLine}</p>
      ) : null}
      {titleAs === 'h2' ? (
        <h2 className="text-2xl font-bold leading-tight text-[var(--hub-text)] md:text-3xl md:leading-tight group-hover:text-[var(--hub-accent-link-hover)] transition-colors">
          {title}
        </h2>
      ) : (
        <h3 className="text-lg font-semibold leading-snug text-[var(--hub-text)] group-hover:text-[var(--hub-accent-link)] transition-colors">
          {title}
        </h3>
      )}
      {excerpt ? <p className={excerptCls}>{excerpt}</p> : null}
      <p className="text-xs text-[var(--hub-text-faint)] mt-2 tabular-nums">{dateStr}</p>
    </>
  );
}

export function BlogIndexClient() {
  const { posts, loading, err, configured } = usePublishedBlogPosts();
  const { labelBySlug } = usePublishedBlogCategories();

  if (!configured) {
    return (
      <p className="text-sm text-[var(--hub-text-soft)] leading-relaxed">
        Firebase is not configured — add keys in <code className="text-xs text-[var(--hub-text-muted)]">.env.local</code> to load
        posts here.
      </p>
    );
  }

  if (loading) {
    return <p className="text-sm text-[var(--hub-text-muted)]">Loading posts…</p>;
  }

  if (err) {
    return (
      <p className="text-sm text-red-300/90 leading-relaxed" role="alert">
        {err}
      </p>
    );
  }

  if (posts.length === 0) {
    return <p className="text-sm text-[var(--hub-text-muted)] italic">No posts yet — check back soon.</p>;
  }

  const hero = posts[0]!;
  const rest = posts.slice(1);
  const heroCategory = resolveBlogCategoryLabel(hero.categorySlug, labelBySlug);
  const heroDate = (hero.publishedAt ?? hero.updatedAt).slice(0, 10);

  return (
    <div className="space-y-10" style={{ fontFamily: blogTextFontFamily }}>
      {/* Featured */}
      <article>
        <Link
          href={`/blog/${hero.slug}`}
          className="group block rounded-2xl border border-[var(--hub-border-soft)] bg-[var(--hub-inset)] shadow-lg shadow-black/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 md:overflow-hidden"
        >
          {hero.headerImageUrl ? (
            <>
              {/*
                Mobile: stack image + text — overlay + overflow-hidden clipped multi-line titles.
                md+: gradient overlay on image (unchanged).
              */}
              <div className="flex flex-col md:hidden">
                <div className="aspect-[16/9] w-full overflow-hidden rounded-t-2xl bg-[var(--hub-inset)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={hero.headerImageUrl}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="rounded-b-2xl border-t border-[var(--hub-border-soft)] bg-[#0b1426] px-5 py-5">
                  <BlogCardParts
                    categoryLine={heroCategory}
                    title={hero.title}
                    excerpt={hero.excerpt || null}
                    dateStr={heroDate}
                    titleAs="h2"
                    excerptTone="default"
                  />
                  <p className="mt-4 text-sm font-medium text-amber-200/90 group-hover:text-amber-100">
                    Read article <span aria-hidden>→</span>
                  </p>
                </div>
              </div>
              <div className="relative hidden md:block">
                <div className="aspect-[21/9] min-h-[200px] max-h-[min(380px,48vh)] w-full bg-[var(--hub-inset)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={hero.headerImageUrl}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
                <div
                  className="absolute inset-0 bg-gradient-to-t from-[#0b1426] via-[#0b1426]/75 to-transparent"
                  aria-hidden
                />
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
                  <BlogCardParts
                    categoryLine={heroCategory}
                    title={hero.title}
                    excerpt={hero.excerpt || null}
                    dateStr={heroDate}
                    titleAs="h2"
                    excerptTone="hero"
                  />
                  <p className="mt-4 text-sm font-medium text-amber-200/90 group-hover:text-amber-100">
                    Read article <span aria-hidden>→</span>
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="p-6 md:p-10">
              <BlogCardParts
                categoryLine={heroCategory}
                title={hero.title}
                excerpt={hero.excerpt || null}
                dateStr={heroDate}
                titleAs="h2"
                excerptTone="default"
              />
              <p className="mt-5 text-sm font-medium text-amber-200/90 group-hover:text-amber-100">
                Read article <span aria-hidden>→</span>
              </p>
            </div>
          )}
        </Link>
      </article>

      {/* Grid */}
      {rest.length > 0 ? (
        <section aria-labelledby="blog-latest-heading">
          <h2
            id="blog-latest-heading"
            className="mb-6 text-center font-serif text-2xl font-semibold uppercase tracking-[0.12em] text-[var(--hub-text-soft)] md:text-left md:text-3xl"
          >
            Latest articles
          </h2>
          <ul className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {rest.map((p) => {
              const categoryLine = resolveBlogCategoryLabel(p.categorySlug, labelBySlug);
              const dateStr = (p.publishedAt ?? p.updatedAt).slice(0, 10);
              return (
                <li key={p.slug}>
                  <Link href={`/blog/${p.slug}`} className="group flex h-full flex-col">
                    {p.headerImageUrl ? (
                      <div className="mb-3 aspect-[16/9] overflow-hidden rounded-xl border border-[var(--hub-border-soft)] bg-[var(--hub-inset)]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.headerImageUrl}
                          alt=""
                          className="h-full w-full object-cover transition-opacity group-hover:opacity-95"
                        />
                      </div>
                    ) : null}
                    <BlogCardParts
                      categoryLine={categoryLine}
                      title={p.title}
                      excerpt={p.excerpt || null}
                      dateStr={dateStr}
                      titleAs="h3"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
