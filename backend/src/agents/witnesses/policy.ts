// Policy Witness -- backed by Linkup search results from trusted domains,
// reached via the backend's declared HTTP tool.

export interface PolicyWitnessOutput {
  policy: string;
  applicability: "REQUIRES_HUMAN_REVIEW" | "PROHIBITED" | "PERMITTED";
  sourceUrl: string;
  evidenceId: string;
}

export const POLICY_WITNESS_PROMPT = `You are the Policy Witness.
Summarize only the supplied Linkup search result(s) about relevant policy
or regulation. Always include the source URL. Do not invent policy text
that isn't in the supplied source.`;
