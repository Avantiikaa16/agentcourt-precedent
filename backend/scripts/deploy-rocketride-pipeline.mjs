// Starts a persistent (ttl: 0 = no timeout) instance of the "agentcourt-executor"
// pipeline, reading its real config straight from RocketRide's account store
// so we never hand-reconstruct it (that's what caused the earlier "Class
// IEndpoint is missing" error -- headless configs built from scratch were
// missing the real `provider: "webhook"` source component).
//
// Run this if the RocketRide webhook ever starts returning 400s again
// (their infra restarted, task got reaped, etc): `npm run rocketride:deploy`
import { RocketRideClient } from "rocketride";
import { readFileSync } from "fs";

const env = readFileSync(".env", "utf8");
const apiKey = env.match(/ROCKETRIDE_API_KEY=(.*)/)[1].trim();
const client = new RocketRideClient({ env: { ROCKETRIDE_APIKEY: apiKey } });

try {
  await client.connect();
  const pipeFile = await client.fsReadJson(".projects/agentcourt-executor.pipe");

  // Drop the orphaned llm_gemini_1 node left over from earlier editing -- it's
  // unconnected and incomplete (formDataValid: false), not part of the real graph.
  pipeFile.components = pipeFile.components.filter((c) => c.id !== "llm_gemini_1");

  // getTaskToken throws (rather than returning null) when nothing is
  // currently running -- that's the expected state after RocketRide's infra
  // reaps an idle task, not a real failure, so it shouldn't abort the deploy.
  let existingToken;
  try {
    existingToken = await client.getTaskToken({ projectId: pipeFile.project_id, source: "webhook_1" });
  } catch (e) {
    console.log("No existing task running (expected if it was reaped):", e.message);
  }
  if (existingToken) {
    await client.terminate(existingToken);
    console.log("Terminated stale task:", existingToken);
  }

  const result = await client.use({ pipeline: pipeFile, source: "webhook_1", ttl: 0 });
  console.log("Persistent task started (ttl: 0, no timeout):");
  console.log(JSON.stringify(result, null, 2));
  console.log("\nWebhook token/publicToken should match ROCKETRIDE_WEBHOOK_KEY in .env --");
  console.log("if they don't, update .env with the publicToken shown above.");
} catch (e) {
  console.error("ERROR:", e.message);
  process.exit(1);
} finally {
  await client.disconnect();
}
