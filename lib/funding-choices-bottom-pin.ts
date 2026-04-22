/**
 * Google Funding Choices / IAB TCF UIs are injected after AdSense loads. They sometimes use
 * full-viewport roots with the dialog aligned to the top, or re-apply inline `top` on updates.
 * CSS in globals.css is the first line of defense; this module re-enforces bottom placement
 * when nodes appear or change, without fighting React (runs only on ad-enabled routes).
 */

const THROTTLE_MS = 80;

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

function pin() {
  document.querySelectorAll<HTMLElement>('.fc-consent-root').forEach(applyToConsentRoot);

  document
    .querySelectorAll<HTMLIFrameElement>('iframe[src*="fundingchoices"]')
    .forEach((el) => {
      applyToFundingIframe(el);
    });
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
    attributeFilter: ['style', 'class', 'id'],
  });
  /* Occasional re-pins in case the CMP mutates in ways MutationObserver batching misses. */
  intervalId = window.setInterval(schedulePin, 4000);
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
