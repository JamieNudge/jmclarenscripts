'use client';

import { useSyncExternalStore } from 'react';

const QUERY = '(min-width: 1536px)';

function subscribe(onStoreChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener('change', onStoreChange);
  return () => mq.removeEventListener('change', onStoreChange);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

/** Matches Tailwind `2xl` breakpoint (1536px). Server snapshot is false. */
export function useIs2xl() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
