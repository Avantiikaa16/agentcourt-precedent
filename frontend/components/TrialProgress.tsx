"use client";

import { useEffect, useState } from "react";

// Client-side approximation, not a real progress signal -- the backend call
// is one blocking HTTP request with no streaming. Timings are rough
// averages from real runs (Guild calls dominate: ~15s each, sequential).
// Framed as "in progress" narration, never a false "done" checkmark, since
// we have no actual per-step completion signal from the server.
const STAGES = [
  { at: 0, label: "Publishing action to LaserData…" },
  { at: 3, label: "Querying FalkorDB for precedent history…" },
  { at: 6, label: "Prosecutor building the case against this action…" },
  { at: 20, label: "Defense arguing the legitimate objective…" },
  { at: 35, label: "Judge weighing precedent, risk, and reversibility…" },
  { at: 50, label: "Deterministic Bailiff applying policy…" },
];

export function TrialProgress({ active }: { active: boolean }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!active) {
      setElapsed(0);
      return;
    }
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [active]);

  if (!active) return null;

  const stage = [...STAGES].reverse().find((s) => elapsed >= s.at) ?? STAGES[0];

  return (
    <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3 flex items-center gap-3">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
      </span>
      <span className="text-sm text-amber-800 dark:text-amber-300 font-medium flex-1">{stage.label}</span>
      <span className="text-xs text-zinc-500 font-mono">{elapsed}s</span>
    </div>
  );
}
