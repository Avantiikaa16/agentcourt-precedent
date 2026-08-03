import type { ActionRequest, BailiffDecision, Verdict } from "../events/types";

// The Bailiff is ordinary policy code, not an LLM. The Judge can recommend;
// the Bailiff controls. Keep every rule here explainable in one sentence.
export function decide(request: ActionRequest, verdict: Verdict): BailiffDecision {
  if (request.environment === "production" && request.tool === "database.drop") {
    return { status: "DENIED", reason: "Production DROP is prohibited" };
  }

  if (request.tool === "database.delete" && !("backupId" in request.arguments)) {
    return {
      status: "MODIFICATION_REQUIRED",
      requirements: ["verified_backup", "dry_run", "human_approval"],
    };
  }

  if (verdict.riskScore >= 70) {
    return { status: "HUMAN_REVIEW_REQUIRED" };
  }

  return { status: "APPROVED" };
}
