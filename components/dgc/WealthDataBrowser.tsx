'use client';

import { getWealthDataset } from '@/lib/dgc/wealth-data';
import { datasetToCsv } from '@/lib/dgc/wealth-data/export-utils';
import { dgcSiteConfig } from '@/lib/dgc/site-config';
import WealthDataTable from '@/components/dgc/WealthDataTable';

function downloadBlob(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function WealthDataBrowser() {
  const dataset = getWealthDataset();

  return (
    <div className="min-h-screen bg-[#101012] text-white">
      <header className="border-b border-white/10 px-4 py-4 md:px-6">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">US Household Wealth Data</h1>
            <p className="text-sm text-white/85">
              {dgcSiteConfig.publicProductName} — historical statistics (1920–2025, every 5th year)
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <a href="/dgc" className="text-white/90 hover:text-white">
              ← Design tool
            </a>
            <a
              href={`/privacy/${dgcSiteConfig.policySlug}`}
              className="text-white/90 hover:text-white"
            >
              Privacy
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] space-y-6 px-4 py-6 md:px-6">
        <section className="rounded-2xl border border-white/15 bg-[#1b1b1d] p-4 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl space-y-2">
              <p className="text-xs uppercase tracking-wide text-white/75">
                Dataset version {dataset.version}
              </p>
              <p className="text-sm leading-relaxed text-white/90">{dataset.methodology}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  downloadBlob(
                    'us-household-wealth-data.json',
                    JSON.stringify(dataset, null, 2),
                    'application/json',
                  )
                }
                className="rounded-lg border border-white/20 px-3 py-2 text-sm text-white/95 hover:bg-white/10"
              >
                Download JSON
              </button>
              <button
                type="button"
                onClick={() =>
                  downloadBlob(
                    'us-household-wealth-data.csv',
                    datasetToCsv(dataset.rows),
                    'text/csv',
                  )
                }
                className="rounded-lg border border-white/20 px-3 py-2 text-sm text-white/95 hover:bg-white/10"
              >
                Download CSV
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/15 bg-[#1b1b1d] p-4 md:p-6">
          <details className="group">
            <summary className="cursor-pointer text-sm font-semibold text-white">
              Definitions — household wealth &amp; household
            </summary>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-white/90">
              <div>
                <h3 className="font-medium text-white">Household wealth</h3>
                <p className="mt-1">{dataset.definitions.householdWealth}</p>
              </div>
              <div>
                <h3 className="font-medium text-white">Household</h3>
                <p className="mt-1">{dataset.definitions.household}</p>
              </div>
            </div>
          </details>
        </section>

        <WealthDataTable rows={dataset.rows} />
      </main>
    </div>
  );
}
