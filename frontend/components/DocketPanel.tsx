import type { CaseRecord } from "@/lib/types";
import { statusColor } from "@/lib/statusColor";
import { Panel } from "./Panel";

export function DocketPanel({
  cases,
  selectedCaseId,
  onSelect,
}: {
  cases: CaseRecord[];
  selectedCaseId?: string;
  onSelect: (caseId: string) => void;
}) {
  return (
    <Panel title="⚖ Live Docket" accent="amber">
      {cases.length === 0 && (
        <p className="text-sm text-zinc-500 dark:text-zinc-500">No cases yet. Run the golden demo to open one.</p>
      )}
      <ul className="flex flex-col gap-2">
        {cases.map((c) => {
          const color = statusColor(c.status);
          const isSelected = c.caseId === selectedCaseId;
          return (
            <li key={c.caseId}>
              <button
                onClick={() => onSelect(c.caseId)}
                className={`w-full text-left rounded-lg border px-3 py-2.5 text-sm transition-all ${
                  isSelected
                    ? "border-amber-500 bg-amber-500/5 shadow-sm"
                    : "border-zinc-200 dark:border-zinc-800 hover:border-amber-400/60 hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{c.caseId}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${color.bg} ${color.text}`}>
                    {color.label}
                  </span>
                </div>
                <div className="mt-1 font-medium text-zinc-700 dark:text-zinc-300">
                  {c.action.tool} <span className="font-normal text-zinc-500">on {c.action.environment}</span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
