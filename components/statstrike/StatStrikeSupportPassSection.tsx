'use client';

import { useSearchParams } from 'next/navigation';
import { StatStrikeCreatePassPanel } from '@/components/statstrike/StatStrikeCreatePassPanel';

export function StatStrikeSupportPassSection() {
  const params = useSearchParams();
  const claim = params.get('claim');
  const pass = params.get('pass');
  const autoClaimKey = pass === 'claimed' && claim ? claim : null;
  return <StatStrikeCreatePassPanel autoClaimKey={autoClaimKey} />;
}
