export const dgcSiteConfig = {
  publicProductName: 'Field of Wealth',
  internalSlug: 'dgc',
  policySlug: 'dgc',
  pageTitle: 'Field of Wealth — Design Tool',
  pageDescription:
    'Interactive Field of Wealth partition designer for the poverty axis extension and target area layouts.',
  publicUrl:
    process.env.NEXT_PUBLIC_DGC_URL ??
    process.env.DGC_PUBLIC_URL ??
    'https://dgc.jmclarenscripts.vercel.app',
};

export const DEFAULT_DGC_HUB_HOSTS = 'dgc.jmclarenscripts.vercel.app';
