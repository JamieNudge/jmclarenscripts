'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { useGoalLabHubNav } from '@/components/hub/HubNavContext';
import { hubPublicHref } from '@/lib/hub-football-routes';

type Props = Omit<ComponentProps<typeof Link>, 'href'> & { href: string };

/**
 * Same as Next {@link Link} but maps `/football-predictions/...` → short hub paths on GoalLab so in-app navigations
 * keep clean URLs (canonical FP paths unchanged on the portfolio host).
 */
export function HubFootballLink({ href, ...rest }: Props) {
  const isHub = useGoalLabHubNav();
  return <Link href={hubPublicHref(href, isHub)} {...rest} />;
}
