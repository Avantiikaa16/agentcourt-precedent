import { randomUUID } from "node:crypto";
import type { ActionProposedPayload, ActionRequest, CourtEvent } from "../events/types";

// Cheap deterministic first-pass risk score, before the trial even starts.
// This is NOT the Judge's score -- it just decides whether to bother with
// a full trial vs. auto-approving trivially safe calls.
function initialRiskScore(request: ActionRequest): number {
  let score = 0;

  if (request.environment === "production") score += 40;
  if (/delete|drop|truncate/i.test(request.tool)) score += 35;
  if (!("backupId" in request.arguments)) score += 15;

  return Math.min(score, 100);
}

function canonicalize(request: ActionRequest): ActionRequest {
  return {
    ...request,
    tool: request.tool.trim().toLowerCase(),
    arguments: request.arguments,
  };
}

export interface ProposeResult {
  caseId: string;
  status: "pending" | "approved" | "modified" | "denied";
  event: CourtEvent<ActionProposedPayload>;
}

// Checkpoint 1 target: this function producing one event that lands in
// LaserData is the very first thing that should work end-to-end.
export function proposeAction(rawRequest: ActionRequest): ProposeResult {
  const request = canonicalize(rawRequest);
  const caseId = `case-${randomUUID().slice(0, 8)}`;
  const riskScoreInitial = initialRiskScore(request);

  const event: CourtEvent<ActionProposedPayload> = {
    eventId: `evt-${randomUUID().slice(0, 8)}`,
    eventType: "action.proposed",
    caseId,
    timestamp: new Date().toISOString(),
    actor: { type: "agent", id: request.agentId },
    payload: { ...request, caseId, riskScoreInitial },
    schemaVersion: 1,
  };

  // TODO once LaserData creds exist: publish `event` to the agent-court
  // stream's "actions" topic instead of just returning it.

  return { caseId, status: "pending", event };
}
