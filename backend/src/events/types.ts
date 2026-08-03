// LaserData event contracts for the "agent-court" stream.
// Topics: actions | trials | approvals | executions | outcomes
// Partition by caseId so events within a case stay ordered.

export type EventType =
  | "action.proposed"
  | "trial.started"
  | "evidence.collected"
  | "agent.argument.submitted"
  | "verdict.recommended"
  | "bailiff.blocked"
  | "approval.requested"
  | "approval.granted"
  | "action.modified"
  | "execution.started"
  | "execution.completed"
  | "execution.failed"
  | "case.closed";

export interface CourtEvent<TPayload = Record<string, unknown>> {
  eventId: string;
  eventType: EventType;
  caseId: string;
  timestamp: string; // ISO 8601
  actor: {
    type: "agent" | "human" | "system";
    id: string;
  };
  payload: TPayload;
  schemaVersion: 1;
}

export interface ActionRequest {
  agentId: string;
  sessionId: string;
  tool: string;
  arguments: Record<string, unknown>;
  reason: string;
  environment: "production" | "staging" | "sandbox";
}

export interface ActionProposedPayload extends ActionRequest {
  caseId: string;
  riskScoreInitial: number;
}

export interface BailiffDecision {
  status: "APPROVED" | "MODIFICATION_REQUIRED" | "HUMAN_REVIEW_REQUIRED" | "DENIED";
  reason?: string;
  requirements?: string[];
}

export interface Verdict {
  recommendation: "APPROVE" | "MODIFY" | "DENY";
  riskScore: number;
  confidence: number;
  reasoningSummary: string;
  requiredSafeguards: string[];
  citedEvidenceIds: string[];
}
