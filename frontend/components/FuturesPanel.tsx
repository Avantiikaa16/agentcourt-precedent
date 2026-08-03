import type { FutureOutcome } from "@/lib/types";
import { Panel } from "./Panel";

const OPTION_STYLE: Record<FutureOutcome["option"], string> = {
  approve: "bg-red-500/5 border-red-500/25",
  deny: "bg-zinc-500/5 border-zinc-400/25",
  modify: "bg-blue-500/5 border-blue-500/25",
};

const OPTION_ICON: Record<FutureOutcome["option"], string> = {
  approve: "🔴",
  deny: "⚪",
  modify: "🔵",
};

export function FuturesPanel({ futures }: { futures: FutureOutcome[] }) {
  return (
    <Panel title="🔮 Possible Futures" accent="blue">
      {futures.length === 0 && <p className="text-sm text-zinc-500 dark:text-zinc-500">No simulation run yet.</p>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {futures.map((f) => (
          <div key={f.option} className={`rounded-lg border px-3 py-3 text-sm ${OPTION_STYLE[f.option]}`}>
            <div className="font-semibold capitalize flex items-center gap-1.5">
              <span className="text-xs">{OPTION_ICON[f.option]}</span> {f.option}
            </div>
            <div className="text-zinc-600 dark:text-zinc-400 mt-1">{f.expectedResult}</div>
            <div className="mt-2 text-xs text-zinc-500 font-medium">
              {f.reversible ? "✓ Reversible" : "✕ Irreversible"} · {f.rowsRemoved} permanently deleted
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
