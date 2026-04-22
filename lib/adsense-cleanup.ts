/**
 * Removes AdSense script tags and common Google consent / CMP nodes from the document.
 * Used when leaving ad-enabled routes so the portfolio home stays clean after client navigation.
 * Ongoing consent UI placement: AdSense → Privacy & messaging.
 */
export function stripAdSenseAndCmpArtifacts(): void {
  if (typeof document === 'undefined') return;

  document
    .querySelectorAll('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle"]')
    .forEach((el) => el.remove());

  document.querySelectorAll('ins.adsbygoogle').forEach((el) => el.remove());

  document
    .querySelectorAll(
      'iframe[src*="fundingchoices"], iframe[src*="consent.google"], iframe[src*="googlesyndication.com/pagead/js/adsbygoogle"]',
    )
    .forEach((el) => {
      el.parentElement?.remove();
    });

  document.querySelectorAll('[id^="google_ads_iframe_"]').forEach((el) => el.remove());

  for (const id of ['googlefcPresent', 'googlefcInactive', 'googlefcLoaded']) {
    document.getElementById(id)?.remove();
  }

  document.querySelectorAll('.fc-consent-root').forEach((el) => el.remove());

  try {
    Reflect.deleteProperty(window, 'adsbygoogle');
  } catch {
    /* ignore */
  }
}
