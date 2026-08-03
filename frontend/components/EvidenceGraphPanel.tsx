"use client";

import { useState } from "react";
import type { PrecedentRef } from "@/lib/types";
import { Panel } from "./Panel";

// recordOutcome.ts writes lessons as "Case <id>: <full Judge reasoning>" --
// strip the redundant prefix (caseId is already the card's own label) and
// keep only the first sentence so stacked cards stay presentation-sized.
function condensedLesson(caseId: string, lesson: string): string {
  const stripped = lesson.startsWith(`Case ${caseId}:`) ? lesson.slice(`Case ${caseId}:`.length).trim() : lesson;
  const match = stripped.match(/^[^.!?]+[.!?]/);
  return match ? match[0].trim() : stripped;
}

const VISIBLE_COUNT = 3;

// This is the panel that has to visibly prove FalkorDB is load-bearing --
// these precedents come straight from graph/precedents.ts's live Cypher
// query, not a hardcoded list.
export function EvidenceGraphPanel({ precedents }: { precedents: PrecedentRef[] }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? precedents : precedents.slice(0, VISIBLE_COUNT);
  const hiddenCount = precedents.length - VISIBLE_COUNT;

  return (
    <Panel title="🕸 Evidence Graph (FalkorDB)" accent="emerald">
      {precedents.length === 0 && (
        <p className="text-sm text-zinc-500 dark:text-zinc-500">No precedent found for this tool yet.</p>
      )}
      <ul className="flex flex-col gap-1.5">
        {visible.map((p) => (
          <li
            key={p.caseId}
            className="rounded-lg bg-emerald-500/5 border border-emerald-500/15 px-3 py-2 text-sm"
          >
            <span className="font-mono text-xs text-emerald-700 dark:text-emerald-400">{p.caseId}</span>{" "}
            <span className="text-zinc-700 dark:text-zinc-300">{condensedLesson(p.caseId, p.lesson)}</span>
          </li>
        ))}
      </ul>
      {hiddenCount > 0 && (
        <button
          onClick={() => setShowAll((v) => !v)}
          className="text-xs text-emerald-700 dark:text-emerald-400 underline self-start"
        >
          {showAll ? "Show fewer" : `View all ${precedents.length} precedents`}
        </button>
      )}
      <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono bg-zinc-500/5 rounded px-2 py-1.5">
        MATCH (t:Tool)&lt;-[:USES]-(:Action)-[:OPENED]-&gt;(c:Case)...-&gt;(p:Precedent)
      </p>
    </Panel>
  );
}
