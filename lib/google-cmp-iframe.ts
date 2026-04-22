/**
 * Google’s IAB TCF / Funding Choices UIs are often cross-origin iframes. “Privacy and cookie
 * settings” is drawn *inside* the child document, so the parent can’t use text queries—only
 * `src` and layout. This module broadens `src` matching and adds a tight geometry check for
 * a full-width strip at the top on Google ad/consent hosts.
 */

const CMP_BY_SRC = new RegExp(
  [
    'fundingchoices',
    'fundingchoicesmessages',
    'consent\\.google',
    'privacy-sandbox',
    'googlefc',
    'messageinjection',
  ].join('|'),
  'i',
);

const GOOGLE_NET = /google|gstatic|doubleclick|googlesyndication|pagead|googletag|tpc/i;

function iframeSrc(iframe: HTMLIFrameElement): string {
  return (iframe.getAttribute('src') ?? iframe.src ?? '').trim();
}

export function isGoogleCmpByIframeSrc(iframe: HTMLIFrameElement): boolean {
  return CMP_BY_SRC.test(iframeSrc(iframe));
}

/**
 * Top-of-viewport, near–full width, modest height, Google-serving `src` only. Avoids moving
 * narrow/side iframes (e.g. vertical ad rail).
 */
/**
 * True when Google’s usual overlay `z-index` (2147…) and the iframe is pinned to the top — common
 * for the TCF / consent message even when `src` doesn’t match the regex list yet.
 */
export function isExtremeZIndexTopGoogleIframe(iframe: HTMLIFrameElement): boolean {
  const src = iframeSrc(iframe);
  if (!src || !GOOGLE_NET.test(src)) return false;
  const z = parseInt(getComputedStyle(iframe).zIndex, 10) || 0;
  if (z < 2146000000) return false;
  return iframe.getBoundingClientRect().top < 36;
}

export function isLikelyGoogleTopCmpStrip(iframe: HTMLIFrameElement, vw = 0, vh = 0): boolean {
  if (typeof window === 'undefined') return false;
  const w = vw || window.innerWidth;
  const h = vh || window.innerHeight;
  const src = iframeSrc(iframe);
  if (!src || !GOOGLE_NET.test(src)) return false;
  if (isGoogleCmpByIframeSrc(iframe) || isExtremeZIndexTopGoogleIframe(iframe)) return true;
  const r = iframe.getBoundingClientRect();
  if (r.top > 14) return false;
  if (r.width < w * 0.88) return false;
  if (r.height < 36 || r.height > 320) return false;
  if (r.height > h * 0.45) return false;
  return true;
}

export function applyToEveryCmpIframe(
  root: Document | ShadowRoot | Element,
  apply: (el: HTMLIFrameElement) => void,
  vw?: number,
  vh?: number,
): void {
  root
    .querySelectorAll<HTMLIFrameElement>('iframe')
    .forEach((iframe) => {
      if (
        isGoogleCmpByIframeSrc(iframe) ||
        isExtremeZIndexTopGoogleIframe(iframe) ||
        isLikelyGoogleTopCmpStrip(iframe, vw, vh)
      ) {
        apply(iframe);
      }
    });
}
