import { createClient } from "redis";

// FalkorDB speaks the Redis protocol; graph queries go through GRAPH.QUERY.
export function createFalkorClient() {
  const url = process.env.FALKORDB_URL;
  if (!url) throw new Error("FALKORDB_URL is not set in .env");
  return createClient({ url });
}

export async function runCypher(graphName: string, query: string, params: Record<string, unknown> = {}) {
  const client = createFalkorClient();
  await client.connect();
  try {
    return await client.sendCommand(["GRAPH.QUERY", graphName, query]);
  } finally {
    await client.quit();
  }
}
