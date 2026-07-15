import { AdSenseAutoPlaceholder } from '@/components/AdSenseAutoPlaceholder';

/** Right-hand rail used on the hub, research page, and subpages — visible from `lg` and up. */
export function BestPicksVerticalAdAside() {
  return (
    <aside className="hidden lg:flex w-[150px] xl:w-[170px] flex-shrink-0 flex-col border-l border-zinc-700/70 bg-[var(--hub-panel)]">
      <AdSenseAutoPlaceholder
        orientation="vertical"
        className="flex-1 w-full min-h-[min(360px,45vh)] lg:min-h-[min(560px,72vh)] rounded-l-lg border-y-0 border-r-0 border-l-0 !border-dashed !border-[var(--hub-border-strong)] !bg-[var(--hub-elevated)] !text-[var(--hub-text-soft)]"
      />
    </aside>
  );
}
