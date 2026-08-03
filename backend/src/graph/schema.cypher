// AgentCourt Precedent -- FalkorDB precedent graph schema + seed
// Run against a fresh graph: falkordb-cli or the FalkorDB Cloud browser console.
// Nodes: Agent, Case, Action, Tool, Resource, Environment, Argument, Evidence,
//        Policy, Vulnerability, Verdict, Human, Execution, Outcome, Precedent
//
// Relationships:
// (Agent)-[:REQUESTED]->(Action)
// (Action)-[:OPENED]->(Case)
// (Action)-[:USES]->(Tool)
// (Action)-[:AFFECTS]->(Resource)
// (Action)-[:TARGETS]->(Environment)
// (Case)-[:CONSIDERED]->(Evidence)
// (Evidence)-[:SUPPORTS]->(Argument)
// (Evidence)-[:CONTRADICTS]->(Argument)
// (Case)-[:CITED]->(Precedent)
// (Case)-[:PRODUCED]->(Verdict)
// (Verdict)-[:AUTHORIZED]->(Execution)
// (Human)-[:APPROVED]->(Execution)
// (Execution)-[:PRODUCED]->(Outcome)
// (Outcome)-[:BECAME]->(Precedent)
// (Policy)-[:GOVERNS]->(Tool)
// (Vulnerability)-[:AFFECTS]->(Resource)

// --- Seed: one prior case that becomes precedent -------------------------
MERGE (agent:Agent {id: 'cleanup-agent'})
MERGE (tool:Tool {name: 'database.delete'})
MERGE (resource:Resource {name: 'customers'})

CREATE (pastCase:Case {id: 'case-001', status: 'CLOSED', createdAt: '2026-07-01T10:00:00-07:00'})
CREATE (pastAction:Action {id: 'action-001', environment: 'production', reason: 'Remove inactive customer records'})
MERGE (agent)-[:REQUESTED]->(pastAction)
MERGE (pastAction)-[:USES]->(tool)
MERGE (pastAction)-[:AFFECTS]->(resource)
MERGE (pastAction)-[:OPENED]->(pastCase)

CREATE (pastVerdict:Verdict {recommendation: 'APPROVE', riskScore: 55, confidence: 0.7})
MERGE (pastCase)-[:PRODUCED]->(pastVerdict)

CREATE (pastExecution:Execution {id: 'exec-001', status: 'COMPLETED'})
MERGE (pastVerdict)-[:AUTHORIZED]->(pastExecution)

CREATE (pastOutcome:Outcome {id: 'outcome-001', description: 'Billing history integrity broke after hard delete'})
MERGE (pastExecution)-[:PRODUCED]->(pastOutcome)

CREATE (precedent:Precedent {id: 'precedent-12', lesson: 'Hard-deleting customer rows breaks billing history; require soft delete'})
MERGE (pastOutcome)-[:BECAME]->(precedent)

// --- Seed: the retention policy Linkup will surface -----------------------
CREATE (policy:Policy {id: 'policy-7', name: 'Customer record retention', requiresReview: true})
MERGE (policy)-[:GOVERNS]->(tool)
