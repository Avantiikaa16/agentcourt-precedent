// Parameterized Cypher for the FalkorDB precedent graph.
// Wire these up with the FalkorDB Node client once the connection string
// from app.falkordb.cloud is in .env (FALKORDB_URL).

export const CREATE_CASE = `
MERGE (a:Agent {id: $agentId})
MERGE (t:Tool {name: $tool})
CREATE (c:Case {
  id: $caseId,
  status: 'OPEN',
  createdAt: $timestamp
})
CREATE (x:Action {
  id: $actionId,
  environment: $environment,
  reason: $reason
})
MERGE (a)-[:REQUESTED]->(x)
MERGE (x)-[:USES]->(t)
MERGE (x)-[:OPENED]->(c)
`;

// This is the query that has to show up on screen during the demo --
// it's the "memory changed motion" proof.
export const FIND_PRECEDENT = `
MATCH (current:Case {id: $caseId})<-[:OPENED]-(action:Action)-[:USES]->(tool)
MATCH (past:Case)<-[:OPENED]-(pastAction:Action)-[:USES]->(tool)
MATCH (past)-[:PRODUCED]->(verdict:Verdict)
MATCH (verdict)-[:AUTHORIZED|REJECTED*0..1]->(execution)
OPTIONAL MATCH (execution)-[:PRODUCED]->(outcome:Outcome)
WHERE past.id <> current.id
RETURN past, pastAction, verdict, outcome
ORDER BY past.createdAt DESC
LIMIT 5
`;

export const RECORD_OUTCOME_AS_PRECEDENT = `
MATCH (e:Execution {id: $executionId})
CREATE (o:Outcome {id: $outcomeId, description: $description})
CREATE (p:Precedent {id: $precedentId, lesson: $lesson})
MERGE (e)-[:PRODUCED]->(o)
MERGE (o)-[:BECAME]->(p)
`;
