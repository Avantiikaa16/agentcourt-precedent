"use client";

import { useState } from "react";
import type { ActionRequest } from "@/lib/types";

const EXAMPLES: Array<Pick<ActionRequest, "tool" | "reason" | "environment"> & { arguments: Record<string, unknown> }> = [
  {
    tool: "database.delete",
    reason: "Remove inactive customer records older than 1 year",
    environment: "production",
    arguments: { table: "customers", where: "last_active_at < '2024-01-01'" },
  },
  {
    tool: "database.drop",
    reason: "Drop the legacy analytics table to reclaim storage",
    environment: "production",
    arguments: { table: "analytics_legacy" },
  },
  {
    tool: "email.bulk-send",
    reason: "Send a promotional email to the entire user list",
    environment: "production",
    arguments: { audience: "all_users", template: "summer_promo" },
  },
  {
    tool: "s3.delete-bucket",
    reason: "Delete the staging backups bucket to cut storage costs",
    environment: "staging",
    arguments: { bucket: "app-staging-backups" },
  },
];

export function CustomActionForm({
  onSubmit,
  busy,
}: {
  onSubmit: (action: ActionRequest) => void;
  busy: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [tool, setTool] = useState("");
  const [reason, setReason] = useState("");
  const [environment, setEnvironment] = useState<ActionRequest["environment"]>("production");
  const [target, setTarget] = useState("");

  function fillExample(ex: (typeof EXAMPLES)[number]) {
    setTool(ex.tool);
    setReason(ex.reason);
    setEnvironment(ex.environment);
    setTarget(JSON.stringify(ex.arguments));
    setOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tool.trim() || !reason.trim()) return;

    let args: Record<string, unknown> = {};
    if (target.trim()) {
      try {
        args = JSON.parse(target);
      } catch {
        args = { detail: target.trim() };
      }
    }

    onSubmit({
      agentId: "custom-agent",
      sessionId: `run-${Date.now()}`,
      tool: tool.trim(),
      reason: reason.trim(),
      environment,
      arguments: args,
    });
  }

  return (
    <div className="rounded-xl border border-amber-500/25 bg-gradient-to-br from-amber-500/[0.04] to-transparent dark:from-amber-500/[0.06] p-4 flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between text-left"
      >
        <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          ✍️ Put your own action on trial
        </span>
        <span className="text-xs text-amber-700 dark:text-amber-400">{open ? "Hide" : "Try it"}</span>
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-1.5">
            {EXAMPLES.map((ex) => (
              <button
                key={ex.tool}
                type="button"
                onClick={() => fillExample(ex)}
                className="rounded-full border border-zinc-300 dark:border-zinc-700 px-2.5 py-1 text-xs text-zinc-600 dark:text-zinc-400 hover:border-amber-500/50 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
              >
                {ex.tool}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
            <input
              value={tool}
              onChange={(e) => setTool(e.target.value)}
              placeholder="Tool name, e.g. database.delete"
              className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
              required
            />
            <select
              value={environment}
              onChange={(e) => setEnvironment(e.target.value as ActionRequest["environment"])}
              className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="production">production</option>
              <option value="staging">staging</option>
              <option value="sandbox">sandbox</option>
            </select>
          </div>

          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="What is this action trying to do, and why?"
            rows={2}
            className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-amber-500"
            required
          />

          <input
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder='Optional arguments as JSON, e.g. {"table":"customers"}'
            className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
          />

          <button
            type="submit"
            disabled={busy || !tool.trim() || !reason.trim()}
            className="self-start rounded-full bg-gradient-to-r from-amber-600 to-amber-500 text-white px-4 py-2 text-sm font-semibold shadow-sm hover:shadow-md hover:from-amber-500 hover:to-amber-400 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {busy ? "Running trial…" : "Put it on trial"}
          </button>
        </form>
      )}
    </div>
  );
}
