import { createClient } from "redis";
import { readFileSync } from "fs";

const envText = readFileSync(".env", "utf8");
const url = envText.match(/FALKORDB_URL=(.*)/)[1].trim();

const cypherRaw = readFileSync("src/graph/schema.cypher", "utf8");
const cypher = cypherRaw
  .split("\n")
  .filter((line) => !line.trim().startsWith("//"))
  .join("\n")
  .trim();

const client = createClient({ url });
await client.connect();
try {
  const result = await client.sendCommand(["GRAPH.QUERY", "agentcourt", cypher]);
  console.log("SEED OK:", JSON.stringify(result, null, 2));

  const check = await client.sendCommand([
    "GRAPH.QUERY",
    "agentcourt",
    "MATCH (p:Precedent) RETURN p.id, p.lesson",
  ]);
  console.log("PRECEDENT CHECK:", JSON.stringify(check, null, 2));
} catch (e) {
  console.error("SEED FAILED:", e.message);
  process.exit(1);
} finally {
  await client.quit();
}
