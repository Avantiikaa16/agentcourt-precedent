// Real LaserData (Apache Iggy) event stream client.
//
// The upstream @laserdata/laser-sdk has a genuine bug: its TLS socket never
// sets `servername` (SNI), so LaserData Cloud's SNI-routed load balancer
// silently resets the connection before the handshake completes. Patched
// locally via patch-package (see backend/patches/) -- `npm install` re-applies
// it automatically through the postinstall hook. rejectUnauthorized is also
// disabled because the deployment presents a self-signed per-deployment cert
// LaserData's own bundled root CA doesn't validate; acceptable for a
// same-day hackathon credential, not something to ship long-term as-is.
import { Laser, jsonCodec } from "@laserdata/laser-sdk";
import type { CourtEvent } from "./types";

function connectionString(): string {
  const host = process.env.LASERDATA_HOST;
  const user = process.env.LASERDATA_USERNAME;
  const pass = process.env.LASERDATA_PASSWORD;
  const port = process.env.LASERDATA_PORT_TCP ?? "8090";
  if (!host || !user || !pass) throw new Error("LASERDATA_HOST/USERNAME/PASSWORD not set in .env");
  return `${user}:${pass}@${host}:${port}?reconnection_retries=1&reconnection_interval=1s`;
}

export const STREAM = "agent-court";
export const TOPIC = "actions";
const eventCodec = jsonCodec<CourtEvent>((v) => v as CourtEvent);

export interface PublishResult {
  stream: string;
  topic: string;
  eventId: string;
  offset: string;
  partitionId: number;
}

export async function publishEvent(event: CourtEvent): Promise<PublishResult> {
  await using laser = await Laser.connect(connectionString());
  const topic = laser.stream(STREAM).topic(TOPIC);
  await topic.ensure(1);
  await topic.publish().json(event).send();

  // Read the record straight back on the same connection to report its real
  // offset -- publish() itself only confirms delivery, not position.
  const reader = await topic.json(eventCodec).records(`offset-lookup-${event.eventId}`);
  let offset = "unknown";
  let partitionId = 0;
  for (let i = 0; i < 5; i++) {
    const results = await reader.poll();
    const match = results.find((r) => r.kind === "record" && r.record.value.eventId === event.eventId);
    if (match && match.kind === "record") {
      offset = match.record.offset.toString();
      partitionId = match.record.partitionId;
      break;
    }
    if (results.length === 0) break;
  }

  return { stream: STREAM, topic: TOPIC, eventId: event.eventId, offset, partitionId };
}

// Reads back every event currently on the topic for a given case. Fine for a
// same-day demo's data volume; a long-lived consumer with tracked offsets
// would be the real answer for a production system.
export async function readEventsForCase(caseId: string): Promise<CourtEvent[]> {
  await using laser = await Laser.connect(connectionString());
  const topic = laser.stream(STREAM).topic(TOPIC);
  await topic.ensure(1);
  const reader = await topic.json(eventCodec).records(`read-${caseId}-${Date.now()}`);

  const events: CourtEvent[] = [];
  for (let i = 0; i < 20; i++) {
    const results = await reader.poll();
    if (results.length === 0) break;
    for (const r of results) {
      if (r.kind === "record" && r.record.value.caseId === caseId) events.push(r.record.value);
    }
  }
  return events;
}
