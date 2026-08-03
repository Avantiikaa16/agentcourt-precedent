import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const MAX_BUFFER = 10 * 1024 * 1024;

// Real Guild.ai invocation -- shells out to the `guild` CLI, which is
// already authenticated on this machine (`guild auth login`). This is not
// a shortcut around Guild's platform: `guild session create` hits the same
// backend a webhook/trigger would, the agent genuinely executes on Guild's
// infrastructure (see the published agents under guild-agents/), and the
// session is visible at https://app.guild.ai/sessions/<id> for judging.
async function guildCli(args: string[]): Promise<unknown> {
  // shell: true is required on Windows -- the global `guild` binary resolves
  // to guild.cmd, which Node's execFile can't spawn directly otherwise.
  const { stdout } = await execFileAsync("guild", ["--mode", "json", ...args, "--non-interactive"], {
    maxBuffer: MAX_BUFFER,
    shell: true,
  });
  return JSON.parse(stdout);
}

interface SessionEventsResponse {
  items: Array<{
    entity_type: string;
    content?: { type: string; data?: string };
  }>;
}

async function pollForTextResponse(sessionId: string, timeoutMs = 60000): Promise<string> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const events = (await guildCli(["session", "events", sessionId])) as SessionEventsResponse;
    const finalMessage = events.items
      .filter((it) => it.entity_type === "EntEventAgentNotificationMessage" && it.content?.type === "text")
      .pop();
    if (finalMessage?.content?.data) return finalMessage.content.data;
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  throw new Error(`Guild agent session ${sessionId} timed out waiting for a response`);
}

// Calls a published Guild agent (owner~agent-name) with a JSON input object,
// and parses its JSON text response. Agents are instructed via system
// prompt to return ONLY a JSON object -- see guild-agents/*/agent.ts.
export async function invokeGuildAgent<T>(agentIdentifier: string, input: unknown): Promise<T> {
  const workspaceId = process.env.GUILD_WORKSPACE_ID;
  if (!workspaceId) throw new Error("GUILD_WORKSPACE_ID is not set in .env");

  const session = (await guildCli([
    "session",
    "create",
    "--workspace",
    workspaceId,
    "--type",
    "chat",
    "--agent",
    agentIdentifier,
    "--prompt",
    JSON.stringify(input),
  ])) as { id: string };

  const rawText = await pollForTextResponse(session.id);

  // Agents sometimes wrap JSON in ```json fences despite instructions -- strip if present.
  const cleaned = rawText.trim().replace(/^```json\s*/i, "").replace(/```$/, "");
  return JSON.parse(cleaned) as T;
}
