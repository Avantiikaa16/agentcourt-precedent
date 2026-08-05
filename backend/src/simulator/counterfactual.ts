// Deterministic sandbox world state. An AI agent may narrate the result,
// but the state transition itself is calculated in code -- never simulate
// an actual destructive command against anything real.

export interface WorldState {
  customerRows: number;
  inactiveRows: number;
  dependentServices: string[];
  backupAvailable: boolean;
}

export interface FutureOutcome {
  option: "approve" | "deny" | "modify";
  expectedResult: string;
  rowsRemoved: number;
  reversible: boolean;
  brokenServices: string[];
}

export function simulateFutures(world: WorldState): FutureOutcome[] {
  return [
    {
      option: "approve",
      expectedResult: `${world.inactiveRows} records removed; support history breaks`,
      rowsRemoved: world.inactiveRows,
      reversible: false,
      brokenServices: world.dependentServices.includes("support") ? ["support"] : [],
    },
    {
      option: "deny",
      expectedResult: "No damage; storage problem remains",
      rowsRemoved: 0,
      reversible: true,
      brokenServices: [],
    },
    {
      option: "modify",
      expectedResult: world.backupAvailable
        ? `Backup used; ${world.inactiveRows} records soft-deleted; reversible`
        : `Backup created; ${world.inactiveRows} records soft-deleted; reversible`,
      rowsRemoved: 0, // soft-delete: rows flagged, not removed
      reversible: true,
      brokenServices: [],
    },
  ];
}

// Golden demo default world state -- matches the doc's scenario exactly.
export const goldenDemoWorld: WorldState = {
  customerRows: 5000,
  inactiveRows: 850,
  dependentServices: ["billing", "support", "analytics"],
  backupAvailable: false,
};

// For a custom action outside the golden demo's database-delete shape,
// there's no real WorldState to simulate against -- describe the three
// outcomes qualitatively from the action itself instead of inventing
// specific numbers that wouldn't be true for an arbitrary tool.
export function simulateGenericFutures(action: { tool: string; reason: string }): FutureOutcome[] {
  return [
    {
      option: "approve",
      expectedResult: `"${action.tool}" executes exactly as requested: ${action.reason}. No safety net if it's wrong.`,
      rowsRemoved: 0,
      reversible: false,
      brokenServices: [],
    },
    {
      option: "deny",
      expectedResult: "Action blocked; the underlying problem it was meant to solve remains unresolved.",
      rowsRemoved: 0,
      reversible: true,
      brokenServices: [],
    },
    {
      option: "modify",
      expectedResult: `A safer variant of "${action.tool}" runs with backup + dry-run safeguards first, fully reversible.`,
      rowsRemoved: 0,
      reversible: true,
      brokenServices: [],
    },
  ];
}
