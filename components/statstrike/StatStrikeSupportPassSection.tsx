'use client';

import { useSearchParams } from 'next/navigation';
import { StatStrikeCreatePassPanel } from '@/components/statstrike/StatStrikeCreatePassPanel';

export function StatStrikeSupportPassSection() {
  return <StatStrikeCreatePassPanel />;
}

export function StatStrikePassSuccessSection() {
  const params = useSearchParams();
  const claim = params.get('claim');
  return <StatStrikeCreatePassPanel autoClaimKey={claim} variant="status" />;
}
