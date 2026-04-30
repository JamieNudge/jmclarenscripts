'use client';

import { useEffect, useState } from 'react';

/** True after the first client commit (false on server and first paint). */
export function useHasMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
