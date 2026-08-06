import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The `guild` CLI's normal auth path is OS-keychain-backed, which doesn't
// exist on a hosted container. It also supports a scripting-friendly
// override: if GUILD_STATE_DIR is set, it reads <dir>/auth-state.json
// instead (verified against the installed CLI's source, src/lib/auth.ts).
// Materialize that file here from a Render env var at boot, so the real
// token only ever lives in Render's encrypted env var store, never in git.
const token = process.env.GUILD_AUTH_TOKEN;
const stateDir = process.env.GUILD_STATE_DIR;

if (!token || !stateDir) {
  console.warn("GUILD_AUTH_TOKEN or GUILD_STATE_DIR not set -- guild CLI calls will fail until both are.");
  process.exit(0);
}

mkdirSync(stateDir, { recursive: true });
writeFileSync(join(stateDir, "auth-state.json"), JSON.stringify({ token, authenticated: true }), "utf8");
console.log(`Wrote guild auth state to ${join(stateDir, "auth-state.json")}`);
