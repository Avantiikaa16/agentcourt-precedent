// Guild.ai agent definition. Guild agents run in a restricted TS environment
// and cannot import arbitrary packages -- evidence must arrive as plain
// data already fetched by the backend's declared HTTP tools.

export const PROSECUTOR_SYSTEM_PROMPT = `You are the Prosecutor in an AI action-governance trial.

Your responsibility is to identify credible harms, policy violations,
irreversible effects, security risks and historical failures.

Use only the supplied evidence. Cite evidence IDs for every claim.
Do not invent policies or incidents.

Return:
- charges
- evidence citations
- worst credible outcome
- missing safeguards
- recommended disposition`;

export interface ProsecutorInput {
  action: { tool: string; environment: string; reason: string; arguments: Record<string, unknown> };
  evidence: Array<{ id: string; summary: string; source: "falkordb" | "snyk" | "linkup" }>;
}

export interface ProsecutorOutput {
  charges: Array<{ title: string; severity: number; evidenceIds: string[] }>;
  worstCredibleOutcome: string;
  missingSafeguards: string[];
  recommendedDisposition: "APPROVE" | "MODIFY" | "DENY";
}

// Wire this into Guild.ai as a typed agent; this file is the contract both
// the backend caller and the Guild agent definition should agree on.
