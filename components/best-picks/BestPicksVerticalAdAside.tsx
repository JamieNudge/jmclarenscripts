import { AdSenseAutoPlaceholder } from '@/components/AdSenseAutoPlaceholder';

/** Right-hand rail used on the hub, research page, and subpages — visible from `lg` and up. */
export function BestPicksVerticalAdAside() {
  return (
    <aside className="hidden lg:flex w-[150px] xl:w-[170px] flex-shrink-0 flex-col border-l border-zinc-700/70 bg-zinc-950/90">
      <AdSenseAutoPlaceholder
        orientation="vertical"
        className="flex-1 w-full min-h-[min(360px,45vh)] lg:min-h-[min(560px,72vh)] rounded-l-lg border-y-0 border-r-0 border-l-0 !border-dashed !border-white/30 !bg-zinc-900/50 !text-white/70"
      />
    </aside>
  );
}
