// Mirrors backend/src/store/caseStore.ts + events/types.ts.
// Keep these two in sync by hand -- a shared package is overkill for a
// one-day hackathon build.

export interface ActionRequest {
  agentId: string;
  sessionId: string;
  tool: string;
  arguments: Record<string, unknown>;
  reason: string;
  environment: "production" | "staging" | "sandbox";
}

export interface FutureOutcome {
  option: "approve" | "deny" | "modify";
  expectedResult: string;
  rowsRemoved: number;
  reversible: boolean;
  brokenServices: string[];
}

export interface PrecedentRef {
  caseId: string;
  lesson: string;
}

export interface Verdict {
  recommendation: "APPROVE" | "MODIFY" | "DENY";
  riskScore: number;
  confidence: number;
  reasoningSummary: string;
  requiredSafeguards: string[];
  citedEvidenceIds: string[];
}

export interface CourtroomOutput {
  prosecutor: {
    charges: Array<{ title: string; severity: number; evidenceIds: string[] }>;
    recommendedDisposition: string;
  };
  defense: {
    objective: string;
    proposedSafeguards: string[];
    leastDangerousAlternative: string;
  };
  judge: Verdict;
  source: "guild" | "placeholder";
}

export interface BailiffDecision {
  status: "APPROVED" | "MODIFICATION_REQUIRED" | "HUMAN_REVIEW_REQUIRED" | "DENIED";
  reason?: string;
  requirements?: string[];
}

export type CaseStatus =
  | "pending"
  | "trial"
  | "modification_required"
  | "human_review"
  | "approved"
  | "denied"
  | "executed";

export interface CaseRecord {
  caseId: string;
  status: CaseStatus;
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
    mode: "real" | "simulated";
    rocketride?: { objectId: string; status: string };
  };
  laserdata?: { connected: boolean; stream?: string; topic?: string; lastEventId?: string; offset?: string };
}
