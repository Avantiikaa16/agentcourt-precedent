import type { Verdict } from "../events/types";
import type { DefenseOutput } from "./defense";
import type { ProsecutorOutput } from "./prosecutor";

export const JUDGE_SYSTEM_PROMPT = `The Judge receives arguments, evidence and simulations.

Do not decide based on rhetoric or argument length.

Evaluate:
1. Evidence quality
2. Reversibility
3. Blast radius
4. Policy compliance
5. Historical outcomes
6. Availability of safer alternatives

Return an advisory verdict. You cannot authorize execution.`;

export interface JudgeInput {
  prosecutor: ProsecutorOutput;
  defense: DefenseOutput;
  simulatedFutures: unknown; // FutureOutcome[] from simulator/counterfactual.ts
  citedPrecedents: Array<{ id: string; lesson: string }>;
}

// Output shape matches Verdict in events/types.ts exactly -- the Judge's
// structured output IS the Verdict that gets published as
// "verdict.recommended" and handed to the Bailiff.
export type JudgeOutput = Verdict;
