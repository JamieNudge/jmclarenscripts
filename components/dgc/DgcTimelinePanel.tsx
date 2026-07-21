'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { newLayerId } from '@/lib/dgc/document';
import { timelineFrame } from '@/lib/dgc/timeline';
import type { DgcDocumentController } from '@/lib/dgc/use-dgc-document';
import type { SavedYearState } from '@/lib/dgc/types';
import { getWealthDataset } from '@/lib/dgc/wealth-data';

const MIN_DURATION_SECONDS = 2;
const MAX_DURATION_SECONDS = 120;
const SCRUB_RESOLUTION = 1000;

export default function DgcTimelinePanel({
  controller,
}: {
  controller: DgcDocumentController;
}) {
  const states = controller.timelineStates;
  const [durationSeconds, setDurationSeconds] = useState(10);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [saveYearDraft, setSaveYearDraft] = useState('');
  const animationRef = useRef<number | null>(null);
  const lastTickRef = useRef<number | null>(null);
  const progressRef = useRef(0);
  progressRef.current = progress;

  const canAnimate = states.length >= 2;

  const showFrame = useCallback(
    (value: number) => {
      const frame = timelineFrame(controller.timelineStates, value);
      if (!frame) return;
      const yearLabel =
        frame.fromYear === frame.toYear
          ? String(frame.fromYear)
          : `${Math.round(frame.currentYear)} — animating ${frame.fromYear} → ${frame.toYear}`;
      controller.setTransientPreview({
        canvas: frame.canvas,
        layers: frame.layers,
        label: yearLabel,
      });
    },
    [controller],
  );

  const stopPlayback = useCallback(
    (clearPreview: boolean) => {
      setIsPlaying(false);
      lastTickRef.current = null;
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      if (clearPreview) {
        controller.setTransientPreview(null);
      }
    },
    [controller],
  );

  useEffect(() => {
    if (!isPlaying) return undefined;
    const tick = (time: number) => {
      const last = lastTickRef.current ?? time;
      lastTickRef.current = time;
      const delta = (time - last) / 1000 / Math.max(durationSeconds, MIN_DURATION_SECONDS);
      let next = progressRef.current + delta;
      if (next >= 1) {
        next = 1;
        setIsPlaying(false);
        lastTickRef.current = null;
      }
      setProgress(next);
      showFrame(next);
      if (next < 1) {
        animationRef.current = requestAnimationFrame(tick);
      }
    };
    animationRef.current = requestAnimationFrame(tick);
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      lastTickRef.current = null;
    };
  }, [durationSeconds, isPlaying, showFrame]);

  // Clear any transient preview when the panel unmounts.
  useEffect(() => {
    return () => controller.setTransientPreview(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePlayPause = () => {
    if (isPlaying) {
      stopPlayback(false);
      return;
    }
    if (!canAnimate) return;
    if (progress >= 1) {
      setProgress(0);
      showFrame(0);
    }
    setIsPlaying(true);
  };

  const handleScrub = (value: number) => {
    stopPlayback(false);
    const next = value / SCRUB_RESOLUTION;
    setProgress(next);
    showFrame(next);
  };

  const handleExitPlayback = () => {
    stopPlayback(true);
    setProgress(0);
  };

  const handleSaveCurrent = () => {
    const year = Number(saveYearDraft.trim());
    if (!Number.isFinite(year) || year < 1000 || year > 3000) return;
    stopPlayback(true);
    const dataset = getWealthDataset();
    const state: SavedYearState = {
      id: newLayerId(),
      year,
      label: String(year),
      datasetVersion: dataset.version,
      provenance: 'Saved from the current diagram',
      savedAt: new Date().toISOString(),
      canvas: structuredClone(controller.document.canvas),
      layers: structuredClone(controller.document.layers),
    };
    controller.saveTimelineState(state);
    setSaveYearDraft('');
  };

  const handleUpdateState = (state: SavedYearState) => {
    stopPlayback(true);
    controller.saveTimelineState({
      ...state,
      savedAt: new Date().toISOString(),
      provenance: 'Updated from the current diagram',
      canvas: structuredClone(controller.document.canvas),
      layers: structuredClone(controller.document.layers),
    });
  };

  const handleRestore = (state: SavedYearState) => {
    stopPlayback(true);
    setProgress(0);
    controller.restoreTimelineState(state.id);
  };

  const handleDelete = (state: SavedYearState) => {
    stopPlayback(true);
    controller.deleteTimelineState(state.id);
  };

  const spanLabel =
    states.length >= 2
      ? `${states[0].year} → ${states[states.length - 1].year} (${states[states.length - 1].year - states[0].year} years)`
      : null;

  return (
    <section className="space-y-3 rounded-2xl border border-[var(--dgc-border)] bg-[var(--dgc-panel)] p-4 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold text-[var(--dgc-text)]">Timeline</h2>
        {spanLabel ? (
          <span className="text-sm text-[var(--dgc-text-muted)]">{spanLabel}</span>
        ) : null}
      </div>

      {states.length === 0 ? (
        <p className="text-sm text-[var(--dgc-text-soft)]">
          No saved states yet. Apply a dataset year from the Historical Wealth Data panel (or set
          up the diagram manually), then save it here as a state. With two or more states you can
          animate the change between years.
        </p>
      ) : (
        <ul className="space-y-2">
          {states.map((state) => (
            <li
              key={state.id}
              className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--dgc-border-soft)] px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[var(--dgc-text)]">{state.label}</p>
                <p className="truncate text-xs text-[var(--dgc-text-muted)]" title={state.provenance}>
                  {state.provenance}
                </p>
              </div>
              <button
                type="button"
                className="rounded-lg border border-[var(--dgc-border)] px-2.5 py-1.5 text-xs text-[var(--dgc-text)] hover:bg-[var(--dgc-hover)]"
                onClick={() => handleRestore(state)}
              >
                Restore
              </button>
              <button
                type="button"
                className="rounded-lg border border-[var(--dgc-border)] px-2.5 py-1.5 text-xs text-[var(--dgc-text)] hover:bg-[var(--dgc-hover)]"
                onClick={() => handleUpdateState(state)}
                title="Replace this state with the current diagram"
              >
                Update
              </button>
              <button
                type="button"
                className="rounded-lg px-2.5 py-1.5 text-xs text-[var(--dgc-danger-text)] hover:bg-[var(--dgc-hover)]"
                onClick={() => handleDelete(state)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-2 border-t border-[var(--dgc-border-soft)] pt-3">
        <input
          className="w-24 rounded-lg border border-[var(--dgc-border)] bg-[var(--dgc-input)] px-3 py-2 text-sm text-[var(--dgc-text)]"
          value={saveYearDraft}
          inputMode="numeric"
          placeholder="Year"
          onChange={(event) => setSaveYearDraft(event.target.value)}
        />
        <button
          type="button"
          disabled={!saveYearDraft.trim()}
          onClick={handleSaveCurrent}
          className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Save current diagram as state
        </button>
        <span className="text-xs text-[var(--dgc-text-faint)]">
          Saving a year that already exists replaces that state.
        </span>
      </div>

      <div className="space-y-2 border-t border-[var(--dgc-border-soft)] pt-3">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={!canAnimate}
            onClick={handlePlayPause}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <label className="flex items-center gap-2 text-sm text-[var(--dgc-text-soft)]">
            Duration
            <input
              className="w-16 rounded-lg border border-[var(--dgc-border)] bg-[var(--dgc-input)] px-2 py-1.5 text-sm text-[var(--dgc-text)]"
              value={durationSeconds}
              inputMode="numeric"
              onChange={(event) => {
                const parsed = Number(event.target.value);
                if (Number.isFinite(parsed)) {
                  setDurationSeconds(
                    Math.min(Math.max(parsed, MIN_DURATION_SECONDS), MAX_DURATION_SECONDS),
                  );
                }
              }}
            />
            s
          </label>
          {controller.transientPreview ? (
            <button
              type="button"
              onClick={handleExitPlayback}
              className="rounded-lg border border-[var(--dgc-border)] px-3 py-2 text-sm text-[var(--dgc-text)] hover:bg-[var(--dgc-hover)]"
            >
              Exit playback
            </button>
          ) : null}
        </div>
        <input
          type="range"
          min={0}
          max={SCRUB_RESOLUTION}
          value={Math.round(progress * SCRUB_RESOLUTION)}
          disabled={!canAnimate}
          onChange={(event) => handleScrub(Number(event.target.value))}
          className="w-full accent-sky-500"
          aria-label="Timeline position"
        />
        {!canAnimate ? (
          <p className="text-xs text-[var(--dgc-text-faint)]">
            Save at least two states (different years) to enable playback.
          </p>
        ) : null}
      </div>
    </section>
  );
}
