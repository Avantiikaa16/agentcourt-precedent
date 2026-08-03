import { createFalkorClient } from "./client";
import type { ActionRequest, Verdict } from "../events/types";

// This is what actually makes "memory changed motion" true: after an
// approved execution, write the case + outcome back into FalkorDB as a new
// Precedent. The next getPrecedentsForTool() call for the same tool will
// then return this case alongside the seeded one -- proving the graph
// compounds across runs, not just replays the same seed forever.
function esc(s: string): string {
  return s.replace(/'/g, "\\'");
}

export async function recordOutcomeAsPrecedent(params: {
  caseId: string;
  action: ActionRequest;
  verdict: Verdict;
  executionResult: string;
}): Promise<void> {
  const { caseId, action, verdict, executionResult } = params;
  const lesson = `Case ${caseId}: ${verdict.reasoningSummary}`;

  const query = `
MERGE (a:Agent {id: '${esc(action.agentId)}'})
MERGE (t:Tool {name: '${esc(action.tool)}'})
CREATE (c:Case {id: '${esc(caseId)}', status: 'CLOSED', createdAt: '${new Date().toISOString()}'})
CREATE (x:Action {id: '${esc(caseId)}-action', environment: '${esc(action.environment)}', reason: '${esc(action.reason)}'})
MERGE (a)-[:REQUESTED]->(x)
MERGE (x)-[:USES]->(t)
MERGE (x)-[:OPENED]->(c)
CREATE (v:Verdict {recommendation: '${esc(verdict.recommendation)}', riskScore: ${verdict.riskScore}, confidence: ${verdict.confidence}})
MERGE (c)-[:PRODUCED]->(v)
CREATE (e:Execution {id: '${esc(caseId)}-exec', status: 'COMPLETED'})
MERGE (v)-[:AUTHORIZED]->(e)
CREATE (o:Outcome {id: '${esc(caseId)}-outcome', description: '${esc(executionResult)}'})
MERGE (e)-[:PRODUCED]->(o)
CREATE (p:Precedent {id: '${esc(caseId)}-precedent', lesson: '${esc(lesson)}'})
MERGE (o)-[:BECAME]->(p)
`;

  const client = createFalkorClient();
  await client.connect();
  try {
    await client.sendCommand(["GRAPH.QUERY", "agentcourt", query]);
  } finally {
    await client.quit();
  }
}
