/**
 * Google Funding Choices / IAB TCF UIs are injected after AdSense loads. The CMP may render:
 * - `.fc-consent-root` (flex layout) or iframes under `fundingchoices`, and/or
 * - a separate **fixed top** white bar (“Privacy and cookie settings”, “Managed by Google. IAB TCF”)
 *   that is *not* covered by `.fc-consent-root` alone, so it keeps reappearing at the top until
 *   we relocate that specific fixed layer.
 * Not a Vercel “cache” issue: AdSense re-applies inline styles; we re-run on mutations + timer.
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
  s.setProperty('left', '0', 'important');
  s.setProperty('right', '0', 'important');
  s.setProperty('bottom', '0', 'important');
  s.setProperty('top', 'auto', 'important');
  s.setProperty('width', '100%', 'important');
  s.setProperty('max-width', '100vw', 'important');
  s.setProperty('z-index', '2147482999', 'important');
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
  s.setProperty('z-index', '2147483000', 'important');
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
  sr
    .querySelectorAll<HTMLIFrameElement>('iframe[src*="fundingchoices"]')
    .forEach((n) => applyToFundingIframe(n));
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

function pin() {
  document.querySelectorAll<HTMLElement>('.fc-consent-root').forEach(applyToConsentRoot);

  document
    .querySelectorAll<HTMLIFrameElement>('iframe[src*="fundingchoices"]')
    .forEach((el) => {
      applyToFundingIframe(el);
    });

  try {
    pinByPrivacyOrCmpText();
  } catch {
    /* ignore */
  }

  try {
    pinInOpenShadowRoots();
  } catch {
    /* ignore */
  }
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

export function initFundingChoicesBottomPin(): () => void {
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
  /* Re-apply: AdSense often rewrites inline styles on the same tick as paint. */
  intervalId = window.setInterval(schedulePin, 1500);
  return stopFundingChoicesBottomPin;
}

export function stopFundingChoicesBottomPin() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  if (intervalId != null) {
    clearInterval(intervalId);
    intervalId = null;
  }
  if (raf) {
    cancelAnimationFrame(raf);
    raf = 0;
  }
}
