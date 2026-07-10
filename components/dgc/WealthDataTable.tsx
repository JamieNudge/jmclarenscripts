'use client';

import { Fragment, useMemo, useState } from 'react';
import type { StatCell, WealthSnapshotRow } from '@/lib/dgc/wealth-data/schema';
import { formatStatValue, shareBucketSum } from '@/lib/dgc/wealth-data/schema';
import {
  COLUMN_KEYS,
  COLUMN_LABELS,
  confidenceBadgeClass,
} from '@/lib/dgc/wealth-data/export-utils';

function CellDetail({ cell, label }: { cell: StatCell; label: string }) {
  if (cell.value === null) {
    return (
      <div className="rounded-lg border border-[var(--dgc-border-soft)] bg-[var(--dgc-hover)] p-3 text-sm">
        <p className="font-medium text-[var(--dgc-text)]">{label}</p>
        <p className="mt-1 text-[var(--dgc-text-soft)]">N/A</p>
        {cell.methodologyNote ? (
          <p className="mt-2 text-xs leading-relaxed text-[var(--dgc-text-soft)]">{cell.methodologyNote}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--dgc-border-soft)] bg-[var(--dgc-hover)] p-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-medium text-[var(--dgc-text)]">{label}</p>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ring-1 ${confidenceBadgeClass(cell.confidence)}`}
        >
          {cell.confidence}
        </span>
      </div>
      <p className="mt-1 text-lg font-semibold text-[var(--dgc-text)]">{formatStatValue(cell)}</p>
      {cell.observationYear && cell.observationYear !== undefined ? (
        <p className="mt-1 text-xs text-[var(--dgc-text-soft)]">
          Observation year: {cell.observationYear}
          {cell.isInterpolated ? ' (interpolated or nearest year)' : ''}
        </p>
      ) : null}
      {cell.definition ? (
        <p className="mt-2 text-xs leading-relaxed text-[var(--dgc-text-soft)]">{cell.definition}</p>
      ) : null}
      {cell.methodologyNote ? (
        <p className="mt-1 text-xs leading-relaxed text-[var(--dgc-text-soft)]">{cell.methodologyNote}</p>
      ) : null}
      {cell.source ? (
        <p className="mt-2 text-xs text-[var(--dgc-text-soft)]">
          Source:{' '}
          <a
            href={cell.source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-200 underline hover:text-sky-100"
          >
            {cell.source.name}
          </a>
          {cell.source.tableOrSeries ? ` — ${cell.source.tableOrSeries}` : ''}
        </p>
      ) : null}
    </div>
  );
}

export default function WealthDataTable({ rows }: { rows: WealthSnapshotRow[] }) {
  const [expandedYear, setExpandedYear] = useState<number | null>(null);
  const sorted = useMemo(() => [...rows].sort((a, b) => a.reportYear - b.reportYear), [rows]);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-2xl border border-[var(--dgc-border)] bg-[var(--dgc-panel)]">
        <table className="min-w-[1100px] w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--dgc-border-soft)] text-xs uppercase tracking-wide text-[var(--dgc-text-soft)]">
              <th className="px-3 py-3">Year</th>
              <th className="px-3 py-3">Tier</th>
              {COLUMN_KEYS.map((key) => (
                <th key={key} className="px-3 py-3">
                  {COLUMN_LABELS[key]}
                </th>
              ))}
              <th className="px-3 py-3">Share sum</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => {
              const sum = shareBucketSum(row);
              const isOpen = expandedYear === row.reportYear;
              return (
                <Fragment key={row.reportYear}>
                  <tr
                    className="border-b border-[var(--dgc-border-soft)] hover:bg-[var(--dgc-hover)] cursor-pointer"
                    onClick={() =>
                      setExpandedYear(isOpen ? null : row.reportYear)
                    }
                  >
                    <td className="px-3 py-2.5 font-semibold text-[var(--dgc-text)]">{row.reportYear}</td>
                    <td className="px-3 py-2.5 text-[var(--dgc-text-soft)]">{row.tier}</td>
                    {COLUMN_KEYS.map((key) => (
                      <td key={key} className="px-3 py-2.5 text-[var(--dgc-text)]">
                        {formatStatValue(row[key])}
                      </td>
                    ))}
                    <td className="px-3 py-2.5 text-[var(--dgc-text-soft)]">
                      {sum !== null ? `${sum.toFixed(1)}%` : '—'}
                    </td>
                  </tr>
                  {isOpen ? (
                    <tr className="border-b border-[var(--dgc-border-soft)] bg-[var(--dgc-elevated)]">
                      <td colSpan={COLUMN_KEYS.length + 3} className="px-4 py-4">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--dgc-text-soft)]">
                          Sources &amp; notes — {row.reportYear}
                        </p>
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                          {COLUMN_KEYS.map((key) => (
                            <CellDetail key={key} cell={row[key]} label={COLUMN_LABELS[key]} />
                          ))}
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="rounded-lg border border-[var(--dgc-border)] bg-[var(--dgc-hover)] px-3 py-2 text-sm text-[var(--dgc-text-soft)]">
        Click a row to expand source citations and methodology notes for each field.
      </p>
    </div>
  );
}
