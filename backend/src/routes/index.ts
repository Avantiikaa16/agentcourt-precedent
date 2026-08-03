import { createHash } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { proposeAction } from "../gateway/actionGateway";
import { decide } from "../bailiff/bailiff";
import { simulateFutures, goldenDemoWorld } from "../simulator/counterfactual";
import { runTrial } from "../trial/runTrial";
import { getCase, listCases, saveCase } from "../store/caseStore";
import { executeViaRocketRide } from "../executor/rocketrideClient";
import { recordOutcomeAsPrecedent } from "../graph/recordOutcome";
import { readEventsForCase } from "../events/laserdataClient";
import type { ActionRequest, Verdict } from "../events/types";

const goldenDemoAction: ActionRequest = {
  agentId: "cleanup-agent",
  sessionId: "run-204",
  tool: "database.delete",
  arguments: { table: "customers", where: "last_active_at < '2024-01-01'" },
  reason: "Remove inactive customer records",
  environment: "production",
};

export async function registerRoutes(app: FastifyInstance) {
  app.post<{ Body: ActionRequest }>("/api/actions/propose", async (req, reply) => {
    const result = proposeAction(req.body);
    return reply.send(result);
  });

  // The dashboard's main entrypoint: runs precedents (real FalkorDB) +
  // simulator (real) + courtroom (placeholder until Guild is wired, see
  // trial/runTrial.ts) + Bailiff (real) as one case, ready to render.
  app.post<{ Body: { action?: ActionRequest } }>("/api/dev/run-golden-demo", async (req, reply) => {
    const action = req.body?.action ?? goldenDemoAction;
    const record = await runTrial(action);
    // Ties the approval token to the exact action reviewed -- if the action
    // changes after this point, the hash changes and any prior approval is
    // invalid. Recomputed fresh per trial, never reused across cases.
    record.actionHash = `sha256:${createHash("sha256").update(JSON.stringify(record.action)).digest("hex")}`;
    saveCase(record);
    return reply.send(record);
  });

  app.post<{ Body: { action: ActionRequest; verdict: Verdict } }>(
    "/api/dev/bailiff-check",
    async (req, reply) => {
      const decision = decide(req.body.action, req.body.verdict);
      return reply.send(decision);
    }
  );

  app.get("/api/dev/simulate-golden-demo", async (_req, reply) => {
    return reply.send(simulateFutures(goldenDemoWorld));
  });

  app.get("/api/cases", async (_req, reply) => {
    return reply.send(listCases());
  });

  app.get<{ Params: { caseId: string } }>("/api/cases/:caseId", async (req, reply) => {
    const record = getCase(req.params.caseId);
    if (!record) return reply.code(404).send({ error: "case not found" });
    return reply.send(record);
  });

  app.get<{ Params: { caseId: string } }>("/api/cases/:caseId/precedents", async (req, reply) => {
    const record = getCase(req.params.caseId);
    if (!record) return reply.code(404).send({ error: "case not found" });
    return reply.send(record.precedents);
  });

  // Human approval step. Execution genuinely fires the deployed RocketRide
  // pipeline (agentcourt-executor: Webhook -> Gemini -> Answers) -- see
  // executor/rocketrideClient.ts. Falls back to a sandbox-only receipt if
  // the pipeline call fails, so a demo never hard-stops on a network blip.
  app.post<{ Params: { caseId: string }; Body: { approvedBy: string } }>(
    "/api/cases/:caseId/approve",
    async (req, reply) => {
      const record = getCase(req.params.caseId);
      if (!record) return reply.code(404).send({ error: "case not found" });

      record.approvedBy = req.body.approvedBy;
      record.status = "executed";

      const result = `Soft-deleted ${goldenDemoWorld.inactiveRows} rows (sandbox) -- reversible`;
      try {
        const rr = await executeViaRocketRide({
          tool: "database.soft-delete",
          action: record.action,
          safeguards: record.bailiff?.requirements ?? [],
        });
        record.executionReceipt = {
          tool: "database.soft-delete",
          result,
          executedAt: rr.triggeredAt,
          mode: "real",
          rocketride: { objectId: rr.objectId, status: rr.status },
        };
      } catch (err) {
        // Visible, not silent: mode: "simulated" tells the UI to say so
        // explicitly rather than showing this identically to a real run.
        req.log.warn({ err }, "RocketRide execution failed, falling back to sandbox-only receipt");
        record.executionReceipt = { tool: "database.soft-delete", result, executedAt: new Date().toISOString(), mode: "simulated" };
      }

      // Write the outcome back into FalkorDB as a new Precedent -- this is
      // what makes the "memory changed motion" replay real: the next case
      // for this tool will cite this outcome alongside the seeded one.
      if (record.courtroom) {
        try {
          await recordOutcomeAsPrecedent({
            caseId: record.caseId,
            action: record.action,
            verdict: record.courtroom.judge,
            executionResult: result,
          });
        } catch (err) {
          req.log.warn({ err }, "Failed to record outcome as precedent in FalkorDB");
        }
      }

      saveCase(record);
      return reply.send(record);
    }
  );

  app.post<{ Params: { caseId: string } }>("/api/cases/:caseId/deny", async (req, reply) => {
    const record = getCase(req.params.caseId);
    if (!record) return reply.code(404).send({ error: "case not found" });
    record.status = "denied";
    saveCase(record);
    return reply.send(record);
  });

  const notImplemented = async (_req: unknown, reply: { code: (n: number) => { send: (b: unknown) => unknown } }) =>
    reply.code(501).send({ error: "not implemented yet" });

  app.get<{ Params: { caseId: string } }>("/api/cases/:caseId/events", async (req, reply) => {
    try {
      const events = await readEventsForCase(req.params.caseId);
      return reply.send(events);
    } catch (err) {
      req.log.warn({ err }, "LaserData read failed");
      return reply.code(503).send({ error: "LaserData unavailable", events: [] });
    }
  });
  app.get("/api/cases/:caseId/graph", notImplemented);
  app.post("/api/cases/:caseId/modify", notImplemented);
  app.post("/api/executions/:executionId/run", notImplemented);
  app.get("/api/executions/:executionId/receipt", notImplemented);
  app.post("/api/tools/database/dry-run", notImplemented);
  app.post("/api/tools/database/backup", notImplemented);
  app.post("/api/tools/database/soft-delete", notImplemented);
}
