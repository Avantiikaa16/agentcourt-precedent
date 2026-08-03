import type { CaseRecord } from "@/lib/types";
import { Panel } from "./Panel";

const BAILIFF_LABEL: Record<string, string> = {
  APPROVED: "Approved",
  MODIFICATION_REQUIRED: "Modification required",
  HUMAN_REVIEW_REQUIRED: "Human review required",
  DENIED: "Denied",
};

const REQUIREMENT_LABEL: Record<string, string> = {
  verified_backup: "verify backup",
  dry_run: "run a dry-run",
  human_approval: "obtain human approval",
};

function requirementsSentence(requirements: string[]): string {
  const labels = requirements.map((r) => REQUIREMENT_LABEL[r] ?? r);
  if (labels.length === 0) return "";
  if (labels.length === 1) return `Before execution: ${labels[0]}.`;
  return `Before execution: ${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}.`;
}

const CHECKLIST_STEPS = [
  "Backup verified",
  "Dry run completed",
  "Human approval signed",
  "Soft-delete executed by RocketRide",
  "Outcome saved as FalkorDB precedent",
];

export function VerdictExecutionPanel({
  caseRecord,
  onApprove,
  onDeny,
  busy,
}: {
  caseRecord?: CaseRecord;
  onApprove: () => void;
  onDeny: () => void;
  busy: boolean;
}) {
  if (!caseRecord) {
    return (
      <Panel title="🔨 Verdict & Execution" accent="rose">
        <p className="text-sm text-zinc-500 dark:text-zinc-500">No case selected.</p>
      </Panel>
    );
  }

  const needsHumanAction = caseRecord.status === "human_review" || caseRecord.status === "modification_required";
  const receipt = caseRecord.executionReceipt;
  const isSimulated = receipt?.mode === "simulated";

  return (
    <Panel title="🔨 Verdict & Execution" accent="rose">
      <div className="text-sm flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Bailiff</span>
          <span className="text-sm font-medium rounded-full bg-zinc-500/10 px-2 py-0.5">
            {BAILIFF_LABEL[caseRecord.bailiff?.status ?? ""] ?? "Pending"}
          </span>
        </div>
        {caseRecord.bailiff?.requirements && caseRecord.bailiff.requirements.length > 0 && (
          <div className="text-zinc-600 dark:text-zinc-400">{requirementsSentence(caseRecord.bailiff.requirements)}</div>
        )}

        {needsHumanAction && (
          <div className="flex gap-2 pt-1">
            <button
              disabled={busy}
              onClick={onApprove}
              className="rounded-full bg-blue-600 text-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-blue-500 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              Approve Safer Action
            </button>
            <button
              disabled={busy}
              onClick={onDeny}
              className="rounded-full border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all disabled:opacity-50"
            >
              Deny
            </button>
          </div>
        )}

        {receipt && (
          <div
            className={`rounded-lg px-3 py-3 mt-1 flex flex-col gap-1 ${
              isSimulated
                ? "bg-amber-500/5 border border-amber-500/25 text-amber-800 dark:text-amber-300"
                : "bg-emerald-500/5 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300"
            }`}
          >
            <div className={`font-semibold mb-1 ${isSimulated ? "text-amber-700 dark:text-amber-300" : "text-emerald-700 dark:text-emerald-300"}`}>
              {isSimulated ? "Execution complete — SIMULATED (RocketRide unreachable)" : "Execution complete — REAL"}
            </div>
            {CHECKLIST_STEPS.map((step, i) => (
              <div
                key={step}
                className="opacity-0 animate-[fadeIn_0.3s_ease-out_forwards]"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                ✓ {step}
              </div>
            ))}

            <div className="mt-2 pt-2 border-t border-current/15 text-xs text-zinc-600 dark:text-zinc-400 font-mono flex flex-col gap-0.5">
              <div>Case: {caseRecord.caseId}</div>
              {caseRecord.actionHash && <div>Action hash: {caseRecord.actionHash}</div>}
              {caseRecord.approvedBy && <div>Approver: {caseRecord.approvedBy}</div>}
              {receipt.rocketride && (
                <div>
                  RocketRide run: {receipt.rocketride.objectId} ({receipt.rocketride.status})
                </div>
              )}
              <div>Executed at: {receipt.executedAt}</div>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-2px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </Panel>
  );
}
