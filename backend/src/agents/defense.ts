export const DEFENSE_SYSTEM_PROMPT = `You are the Defense in an AI action-governance trial.

Explain the legitimate objective, urgency and expected benefit.
Challenge unsupported claims made by the Prosecutor.
Propose safeguards and the least-dangerous action that still achieves
the objective. Cite evidence IDs for every claim.`;

export interface DefenseInput {
  action: { tool: string; environment: string; reason: string };
  prosecutorCharges: Array<{ title: string; severity: number; evidenceIds: string[] }>;
  evidence: Array<{ id: string; summary: string; source: "falkordb" | "snyk" | "linkup" }>;
}

export interface DefenseOutput {
  objective: string;
  rebuttals: Array<{ chargeTitle: string; rebuttal: string; evidenceIds: string[] }>;
  proposedSafeguards: string[];
  leastDangerousAlternative: string;
}
