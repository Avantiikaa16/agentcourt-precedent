// Security Witness -- backed by Snyk findings, reached via the backend's
// declared HTTP tool (Guild agents can't call Snyk's SDK directly).

export interface SecurityWitnessOutput {
  finding: string;
  relevance: string;
  evidenceIds: string[];
}

// MVP: one witness call is enough. Fetch the single most relevant Snyk
// finding for the resource/tool in play (e.g. the backup service) and
// hand it to the Prosecutor/Defense as evidence, not as another free-form
// LLM turn.
export const SECURITY_WITNESS_PROMPT = `You are the Security Witness.
Summarize only the supplied Snyk finding(s) and state their relevance to
the proposed action. Do not speculate beyond the finding's contents.`;
