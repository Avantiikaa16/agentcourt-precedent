"use client";

import { useState } from "react";
import type { CourtroomOutput } from "@/lib/types";
import { Panel } from "./Panel";

function confidenceLabel(c: number): string {
  if (c >= 0.85) return "High";
  if (c >= 0.6) return "Medium";
  return "Low";
}

// Guild's LLM output is naturally verbose for a live courtroom card -- take
// just the first sentence as the headline, keep the rest behind a toggle.
function firstSentence(text: string): string {
  const match = text.match(/^[^.!?]+[.!?]/);
  return match ? match[0].trim() : text;
}

export function CourtroomPanel({ courtroom }: { courtroom?: CourtroomOutput }) {
  const [showFullReasoning, setShowFullReasoning] = useState(false);

  return (
    <Panel title="🏛 Courtroom" accent="violet">
      {!courtroom && <p className="text-sm text-zinc-500 dark:text-zinc-500">No trial run yet.</p>}
      {courtroom && (
        <div className="flex flex-col gap-3 text-sm">
          <span
            className={`self-start rounded-full px-2 py-0.5 text-xs font-medium ${
              courtroom.source === "guild"
                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                : "bg-yellow-200 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
            }`}
          >
            {courtroom.source === "guild" ? "● REAL — Guild.ai agents" : "SIMULATED — swap for real Guild.ai calls"}
          </span>

          <div className="rounded-lg bg-red-500/5 border border-red-500/15 p-3">
            <div className="font-semibold text-red-700 dark:text-red-300 mb-1">Prosecutor</div>
            {courtroom.prosecutor.charges.map((c, i) => (
              <div key={i} className="text-zinc-700 dark:text-zinc-300">
                {firstSentence(c.title)}
                <div className="text-xs text-zinc-500 mt-0.5">
                  Evidence: <span className="font-mono">{c.evidenceIds.join(", ") || "none"}</span> · Severity {c.severity}/100
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg bg-blue-500/5 border border-blue-500/15 p-3">
            <div className="font-semibold text-blue-700 dark:text-blue-300 mb-1">Defense</div>
            <div className="text-zinc-700 dark:text-zinc-300">
              <span className="text-zinc-500">Business need:</span> {firstSentence(courtroom.defense.objective)}
            </div>
            <div className="text-zinc-700 dark:text-zinc-300">
              <span className="text-zinc-500">Safer alternative:</span> {firstSentence(courtroom.defense.leastDangerousAlternative)}
            </div>
          </div>

          <div className="rounded-lg bg-amber-500/5 border border-amber-500/15 p-3">
            <div className="font-semibold text-amber-700 dark:text-amber-300 mb-1">Judge</div>
            <div className="text-zinc-800 dark:text-zinc-200 font-medium">Verdict: {courtroom.judge.recommendation}</div>
            <div className="text-zinc-700 dark:text-zinc-300">{firstSentence(courtroom.judge.reasoningSummary)}</div>
            <div className="text-xs text-zinc-500 mt-1">
              Risk {courtroom.judge.riskScore}/100 · Confidence: {confidenceLabel(courtroom.judge.confidence)}
            </div>
            <button
              onClick={() => setShowFullReasoning((v) => !v)}
              className="text-xs text-amber-700 dark:text-amber-400 underline mt-1"
            >
              {showFullReasoning ? "Hide full reasoning" : "View full reasoning"}
            </button>
            {showFullReasoning && (
              <div className="text-xs text-zinc-600 dark:text-zinc-400 italic mt-1">{courtroom.judge.reasoningSummary}</div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-zinc-500/5 border border-zinc-500/15 p-2.5 text-xs text-zinc-500">
              <div className="font-semibold text-zinc-600 dark:text-zinc-400">Snyk Security Witness</div>
              <div className="mt-0.5">UNAVAILABLE — not wired this build</div>
            </div>
            <div className="rounded-lg bg-zinc-500/5 border border-zinc-500/15 p-2.5 text-xs text-zinc-500">
              <div className="font-semibold text-zinc-600 dark:text-zinc-400">Linkup Policy Witness</div>
              <div className="mt-0.5">UNAVAILABLE — not wired this build</div>
            </div>
          </div>
        </div>
      )}
    </Panel>
  );
}
