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
      <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
        <p className="font-medium text-white">{label}</p>
        <p className="mt-1 text-white/80">N/A</p>
        {cell.methodologyNote ? (
          <p className="mt-2 text-xs leading-relaxed text-white/85">{cell.methodologyNote}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-medium text-white">{label}</p>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ring-1 ${confidenceBadgeClass(cell.confidence)}`}
        >
          {cell.confidence}
        </span>
      </div>
      <p className="mt-1 text-lg font-semibold text-white">{formatStatValue(cell)}</p>
      {cell.observationYear && cell.observationYear !== undefined ? (
        <p className="mt-1 text-xs text-white/85">
          Observation year: {cell.observationYear}
          {cell.isInterpolated ? ' (interpolated or nearest year)' : ''}
        </p>
      ) : null}
      {cell.definition ? (
        <p className="mt-2 text-xs leading-relaxed text-white/90">{cell.definition}</p>
      ) : null}
      {cell.methodologyNote ? (
        <p className="mt-1 text-xs leading-relaxed text-white/85">{cell.methodologyNote}</p>
      ) : null}
      {cell.source ? (
        <p className="mt-2 text-xs text-white/90">
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
      <div className="overflow-x-auto rounded-2xl border border-white/15 bg-[#1b1b1d]">
        <table className="min-w-[1100px] w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-white/80">
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
                    className="border-b border-white/5 hover:bg-white/5 cursor-pointer"
                    onClick={() =>
                      setExpandedYear(isOpen ? null : row.reportYear)
                    }
                  >
                    <td className="px-3 py-2.5 font-semibold text-white">{row.reportYear}</td>
                    <td className="px-3 py-2.5 text-white/90">{row.tier}</td>
                    {COLUMN_KEYS.map((key) => (
                      <td key={key} className="px-3 py-2.5 text-white">
                        {formatStatValue(row[key])}
                      </td>
                    ))}
                    <td className="px-3 py-2.5 text-white/85">
                      {sum !== null ? `${sum.toFixed(1)}%` : '—'}
                    </td>
                  </tr>
                  {isOpen ? (
                    <tr className="border-b border-white/10 bg-[#141416]">
                      <td colSpan={COLUMN_KEYS.length + 3} className="px-4 py-4">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/85">
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
      <p className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/90">
        Click a row to expand source citations and methodology notes for each field.
      </p>
    </div>
  );
}
