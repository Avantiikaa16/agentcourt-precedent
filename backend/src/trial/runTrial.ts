import { randomUUID } from "node:crypto";
import type { ActionRequest, CourtEvent, Verdict } from "../events/types";
import { getPrecedentsForTool } from "../graph/precedents";
import { simulateFutures, simulateGenericFutures, goldenDemoWorld, type WorldState } from "../simulator/counterfactual";
import { decide } from "../bailiff/bailiff";
import { saveCase, type CaseRecord, type CourtroomOutput, type PrecedentRef } from "../store/caseStore";
import { invokeGuildAgent } from "../agents/guildClient";
import { publishEvent } from "../events/laserdataClient";
import type { ProsecutorOutput } from "../agents/prosecutor";
import type { DefenseOutput } from "../agents/defense";

// Real Guild.ai trial -- each call runs the corresponding published agent
// (guild-agents/{prosecutor,defense,judge}/) on Guild's platform via
// guildClient.ts. Sessions are visible at https://app.guild.ai/sessions/<id>.
async function runCourtroomTrial(
  action: ActionRequest,
  precedents: PrecedentRef[],
  futures: ReturnType<typeof simulateFutures>
): Promise<CourtroomOutput> {
  const baseInput = { action, precedents, futures };

  const prosecutor = await invokeGuildAgent<ProsecutorOutput>("avantika~agentcourt-prosecutor", baseInput);

  const defense = await invokeGuildAgent<DefenseOutput>("avantika~agentcourt-defense", {
    ...baseInput,
    prosecutor,
  });

  const judge = await invokeGuildAgent<Verdict>("avantika~agentcourt-judge", {
    ...baseInput,
    prosecutor,
    defense,
  });

  return { prosecutor, defense, judge, source: "guild" };
}

export async function runTrial(action: ActionRequest, world: WorldState = goldenDemoWorld): Promise<CaseRecord> {
  const caseId = `case-${randomUUID().slice(0, 8)}`;
  const createdAt = new Date().toISOString();

  const proposedEvent: CourtEvent = {
    eventId: `evt-${randomUUID().slice(0, 8)}`,
    eventType: "action.proposed",
    caseId,
    timestamp: createdAt,
    actor: { type: "agent", id: action.agentId },
    payload: { ...action },
    schemaVersion: 1,
  };
  let laserdata: CaseRecord["laserdata"];
  try {
    const pub = await publishEvent(proposedEvent);
    laserdata = { connected: true, stream: pub.stream, topic: pub.topic, lastEventId: pub.eventId, offset: pub.offset };
  } catch (err) {
    console.warn("LaserData publish failed, continuing without it:", (err as Error).message);
    laserdata = { connected: false };
  }

  const precedents = await getPrecedentsForTool(action.tool);
  // Numeric world-state simulation only makes sense for the golden demo's
  // database-delete shape; any other custom tool gets a qualitative
  // simulation derived from the action itself instead of fake row counts.
  const futures = action.tool.startsWith("database.") ? simulateFutures(world) : simulateGenericFutures(action);
  const courtroom = await runCourtroomTrial(action, precedents, futures);
  const bailiff = decide(action, courtroom.judge);

  const statusMap = {
    APPROVED: "approved",
    MODIFICATION_REQUIRED: "modification_required",
    HUMAN_REVIEW_REQUIRED: "human_review",
    DENIED: "denied",
  } as const;

  return saveCase({
    caseId,
    status: statusMap[bailiff.status],
    action,
    createdAt,
    precedents,
    futures,
    courtroom,
    laserdata,
    bailiff,
  });
}
