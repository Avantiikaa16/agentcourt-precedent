import type { ActionRequest, BailiffDecision, Verdict } from "../events/types";
import type { FutureOutcome } from "../simulator/counterfactual";

// In-memory case store. Fine for a hackathon demo (single process, single
// day). If this needs to survive a restart, that's what FalkorDB is for --
// don't build a second persistence layer under time pressure.

export interface CourtroomOutput {
  prosecutor: { charges: Array<{ title: string; severity: number; evidenceIds: string[] }>; recommendedDisposition: string };
  defense: { objective: string; proposedSafeguards: string[]; leastDangerousAlternative: string };
  judge: Verdict;
  source: "guild" | "placeholder"; // "placeholder" must never appear in the final demo run
}

export interface PrecedentRef {
  caseId: string;
  lesson: string;
}

export interface CaseRecord {
  caseId: string;
  status: "pending" | "trial" | "modification_required" | "human_review" | "approved" | "denied" | "executed";
  action: ActionRequest;
  createdAt: string;
  precedents: PrecedentRef[];
  futures: FutureOutcome[];
  courtroom?: CourtroomOutput;
  bailiff?: BailiffDecision;
  approvedBy?: string;
  actionHash?: string;
  executionReceipt?: {
    tool: string;
    result: string;
    executedAt: string;
    mode: "real" | "simulated"; // never presented identically to a real success -- see routes/index.ts approve handler
    rocketride?: { objectId: string; status: string };
  };
  laserdata?: { connected: boolean; stream?: string; topic?: string; lastEventId?: string; offset?: string };
}

const cases = new Map<string, CaseRecord>();

export function saveCase(record: CaseRecord) {
  cases.set(record.caseId, record);
  return record;
}

export function getCase(caseId: string): CaseRecord | undefined {
  return cases.get(caseId);
}

export function listCases(): CaseRecord[] {
  return Array.from(cases.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
