import { createFalkorClient } from "./client";
import type { PrecedentRef } from "../store/caseStore";

// Real FalkorDB query -- no mocking here, this is one of the four
// mandated techs and it's already proven to work against the live instance.
// ORDER BY createdAt DESC is load-bearing, not cosmetic: without it, a demo
// with more than 5 accumulated precedents can silently drop the case just
// created, breaking the entire "memory changed motion" replay proof.
const PRECEDENTS_FOR_TOOL = `
MATCH (t:Tool {name: $tool})<-[:USES]-(:Action)-[:OPENED]->(c:Case)
MATCH (c)-[:PRODUCED]->(:Verdict)-[:AUTHORIZED]->(:Execution)-[:PRODUCED]->(:Outcome)-[:BECAME]->(p:Precedent)
RETURN c.id AS caseId, p.lesson AS lesson, c.createdAt AS createdAt
ORDER BY c.createdAt DESC
LIMIT 5
`;

export async function getPrecedentsForTool(tool: string): Promise<PrecedentRef[]> {
  const client = createFalkorClient();
  await client.connect();
  try {
    // FalkorDB doesn't support query params over GRAPH.QUERY the same way
    // parameterized Cypher files do in graph/queries.ts -- inline safely
    // here since `tool` is always our own canonicalized string, never raw
    // user input reaching this function unvalidated.
    const query = PRECEDENTS_FOR_TOOL.replace("$tool", `'${tool}'`);
    const raw = (await client.sendCommand(["GRAPH.QUERY", "agentcourt", query])) as unknown[];

    const rows = (raw[1] as unknown[][]) ?? [];
    return rows.map((row) => ({ caseId: String(row[0]), lesson: String(row[1]) }));
  } finally {
    await client.quit();
  }
}
