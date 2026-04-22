import { ADSENSE_SCRIPT_LOADED_EVENT } from '@/lib/adsense-script-events';
import { applyToEveryCmpIframe } from '@/lib/google-cmp-iframe';

/**
 * Google Funding Choices / IAB TCF. The TCF bar text is usually **inside a cross-origin iframe**;
 * see `google-cmp-iframe` for `src` + layout matching. This module also handles `.fc-consent-root`,
 * in-document text when present, open shadow trees, and re-pins on mutations / timers.
 */

const THROTTLE_MS = 80;
const PRIVACY_SETTINGS_LINK = /privacy\s+and\s+cookie\s+settings/i;
const CMP_DISCLOSURE = /Managed by Google|IAB TCF|CMP ID/i;

let observer: MutationObserver | null = null;
let throttled = false;
let raf = 0;

function applyToConsentRoot(el: HTMLElement) {
  const s = el.style;
  s.setProperty('position', 'fixed', 'important');
  s.setProperty('inset', '0', 'important');
  s.setProperty('top', '0', 'important');
  s.setProperty('right', '0', 'important');
  s.setProperty('bottom', '0', 'important');
  s.setProperty('left', '0', 'important');
  s.setProperty('width', '100%', 'important');
  s.setProperty('min-height', '100dvh', 'important');
  s.setProperty('box-sizing', 'border-box', 'important');
  s.setProperty('margin', '0', 'important');
  s.setProperty('display', 'flex', 'important');
  s.setProperty('flex-direction', 'column', 'important');
  s.setProperty('justify-content', 'flex-end', 'important');
  s.setProperty('align-items', 'center', 'important');
  s.setProperty('z-index', '2147483000', 'important');
  s.setProperty('pointer-events', 'auto', 'important');
}

function applyToFundingIframe(el: HTMLIFrameElement) {
  const s = el.style;
  s.setProperty('position', 'fixed', 'important');
  s.setProperty('inset', 'auto 0 0 0', 'important');
  s.setProperty('left', '0', 'important');
  s.setProperty('right', '0', 'important');
  s.setProperty('bottom', '0', 'important');
  s.setProperty('top', 'auto', 'important');
  s.setProperty('width', '100%', 'important');
  s.setProperty('max-width', '100vw', 'important');
  s.setProperty('height', 'auto', 'important');
  s.setProperty('margin', '0', 'important');
  s.setProperty('transform', 'none', 'important');
  s.setProperty('z-index', '2147483646', 'important');
}

function applyFixedOrStickyBarToBottom(el: HTMLElement) {
  const s = el.style;
  s.setProperty('position', 'fixed', 'important');
  s.setProperty('top', 'auto', 'important');
  s.setProperty('bottom', '0', 'important');
  s.setProperty('left', '0', 'important');
  s.setProperty('right', '0', 'important');
  s.setProperty('width', '100%', 'important');
  s.setProperty('max-width', '100vw', 'important');
  s.setProperty('margin', '0', 'important');
  s.setProperty('box-sizing', 'border-box', 'important');
  s.setProperty('z-index', '2147483645', 'important');
}

/**
 * Google often uses `z-index` in the 2147… range. Narrow full-width layers at the very top
 * (not full-viewport) are good candidates; avoids fighting full-screen `fc-` backdrops.
 */
function pinNarrowTop2147ZLayers() {
  if (typeof window === 'undefined' || !document.body) return;
  const vh = window.innerHeight;
  const vw = window.innerWidth;
  for (const el of Array.from(document.querySelectorAll<HTMLElement>('*'))) {
    const st = getComputedStyle(el);
    if (st.position !== 'fixed') continue;
    const r = el.getBoundingClientRect();
    if (r.top > 22) continue;
    if (r.width < vw * 0.75) continue;
    if (r.height < 18) continue;
    if (r.height > Math.min(400, vh * 0.5)) continue;
    const z = parseInt(st.zIndex, 10) || 0;
    if (z < 2145000000) continue;
    applyFixedOrStickyBarToBottom(el);
  }
}

/** IAB TCF / Privacy Settings link is often in the doc (not in iframe); the fixed top bar is an ancestor. */
function pinByPrivacyOrCmpText() {
  const seen = new WeakSet<HTMLElement>();

  for (const a of Array.from(
    document.querySelectorAll<HTMLElement>('a, button, [role="link"], [role="button"]'),
  )) {
    const text = a.textContent ?? '';
    if (!PRIVACY_SETTINGS_LINK.test(text)) continue;
    let el: HTMLElement | null = a;
    for (let i = 0; i < 24 && el; i++) {
      const st = getComputedStyle(el);
      if (st.position === 'fixed' || st.position === 'sticky') {
        if (!seen.has(el)) {
          seen.add(el);
          applyFixedOrStickyBarToBottom(el);
        }
        break;
      }
      el = el.parentElement;
    }
  }

  for (const start of Array.from(
    document.querySelectorAll<HTMLElement>('div,section,aside,span,header,footer'),
  )) {
    const t = start.textContent?.trim() ?? '';
    if (t.length < 15 || t.length > 700) continue;
    if (!CMP_DISCLOSURE.test(t)) continue;
    if (!/cookie|Privacy|CMP|consent/i.test(t)) continue;
    let el: HTMLElement | null = start;
    for (let i = 0; i < 24 && el; i++) {
      const st = getComputedStyle(el);
      if (st.position === 'fixed' || st.position === 'sticky') {
        if (!seen.has(el)) {
          seen.add(el);
          applyFixedOrStickyBarToBottom(el);
        }
        break;
      }
      el = el.parentElement;
    }
  }
}

/** Open shadow trees only; closed shadows cannot be styled from the page. */
function walkShadowTree(sr: ShadowRoot) {
  sr
    .querySelectorAll<HTMLElement>('.fc-consent-root')
    .forEach((n) => applyToConsentRoot(n));
  applyToEveryCmpIframe(sr, applyToFundingIframe);
  for (const el of Array.from(sr.querySelectorAll<HTMLElement>('*'))) {
    if (el.shadowRoot) {
      walkShadowTree(el.shadowRoot);
    }
  }
}

function pinInOpenShadowRoots() {
  for (const el of Array.from(document.querySelectorAll<HTMLElement>('*'))) {
    if (el.shadowRoot) {
      walkShadowTree(el.shadowRoot);
    }
  }
}

let pinCallCount = 0;

/** Fast path: only fc roots + CMP iframes + shadow. Safe to run every animation frame. */
function pinCore() {
  const vw = typeof window !== 'undefined' ? window.innerWidth : 0;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 0;

  document.querySelectorAll<HTMLElement>('.fc-consent-root').forEach(applyToConsentRoot);

  applyToEveryCmpIframe(document, applyToFundingIframe, vw, vh);

  try {
    pinInOpenShadowRoots();
  } catch {
    /* ignore */
  }
}

/** Full scan: text/ancestor walk + 2147z strip sweep. Keep off the per-frame rAF path. */
function pinHeavy() {
  pinCallCount += 1;
  try {
    pinByPrivacyOrCmpText();
  } catch {
    /* ignore */
  }
  if (pinCallCount % 3 === 0) {
    try {
      pinNarrowTop2147ZLayers();
    } catch {
      /* ignore */
    }
  }
}

function pin() {
  pinCore();
  pinHeavy();
}

function schedulePin() {
  if (throttled) return;
  throttled = true;
  if (raf) cancelAnimationFrame(raf);
  raf = requestAnimationFrame(() => {
    raf = 0;
    throttled = false;
    try {
      pin();
    } catch {
      /* ignore */
    }
  });
}

let intervalId: number | null = null;
let onAdsenseLoaded: (() => void) | null = null;
let burstRaf: number = 0;
const BURST_FRAMES = 180;

function startPinBurst() {
  let n = 0;
  const step = () => {
    try {
      pinCore();
    } catch {
      /* ignore */
    }
    n += 1;
    if (n < BURST_FRAMES) {
      burstRaf = requestAnimationFrame(step);
    } else {
      burstRaf = 0;
    }
  };
  if (burstRaf) {
    cancelAnimationFrame(burstRaf);
  }
  burstRaf = requestAnimationFrame(step);
}

export function initFundingChoicesBottomPin(): () => void {
  try {
    pin();
  } catch {
    /* ignore */
  }
  startPinBurst();
  schedulePin();
  if (typeof window === 'undefined' || !document.body) {
    return () => {};
  }
  observer = new MutationObserver(() => {
    window.setTimeout(schedulePin, THROTTLE_MS);
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class', 'id', 'src'],
  });
  onAdsenseLoaded = () => {
    startPinBurst();
    schedulePin();
  };
  window.addEventListener(ADSENSE_SCRIPT_LOADED_EVENT, onAdsenseLoaded);
  /* Re-apply: Google rewrites inline styles in tight loops. */
  intervalId = window.setInterval(schedulePin, 350);
  return stopFundingChoicesBottomPin;
}

export function stopFundingChoicesBottomPin() {
  if (onAdsenseLoaded) {
    window.removeEventListener(ADSENSE_SCRIPT_LOADED_EVENT, onAdsenseLoaded);
    onAdsenseLoaded = null;
  }
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  if (intervalId != null) {
    clearInterval(intervalId);
    intervalId = null;
  }
  if (burstRaf) {
    cancelAnimationFrame(burstRaf);
    burstRaf = 0;
  }
  if (raf) {
    cancelAnimationFrame(raf);
    raf = 0;
  }
  pinCallCount = 0;
}
