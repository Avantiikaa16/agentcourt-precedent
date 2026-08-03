"use client";

import { useState } from "react";
import { runGoldenDemo, approveCase, denyCase } from "@/lib/api";
import type { CaseRecord } from "@/lib/types";
import { DocketPanel } from "@/components/DocketPanel";
import { CourtroomPanel } from "@/components/CourtroomPanel";
import { EvidenceGraphPanel } from "@/components/EvidenceGraphPanel";
import { FuturesPanel } from "@/components/FuturesPanel";
import { VerdictExecutionPanel } from "@/components/VerdictExecutionPanel";
import { SponsorBar } from "@/components/SponsorBar";
import { TrialProgress } from "@/components/TrialProgress";

export default function Home() {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [trialRunning, setTrialRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = cases.find((c) => c.caseId === selectedCaseId);
  const hasExecutedCase = cases.some((c) => c.status === "executed");

  async function handleRunDemo() {
    setBusy(true);
    setTrialRunning(true);
    setError(null);
    try {
      const record = await runGoldenDemo();
      setCases((prev) => [record, ...prev]);
      setSelectedCaseId(record.caseId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to run demo");
    } finally {
      setBusy(false);
      setTrialRunning(false);
    }
  }

  async function handleApprove() {
    if (!selected) return;
    setBusy(true);
    try {
      const updated = await approveCase(selected.caseId, "judge-demo-user");
      setCases((prev) => prev.map((c) => (c.caseId === updated.caseId ? updated : c)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to approve");
    } finally {
      setBusy(false);
    }
  }

  async function handleDeny() {
    if (!selected) return;
    setBusy(true);
    try {
      const updated = await denyCase(selected.caseId);
      setCases((prev) => prev.map((c) => (c.caseId === updated.caseId ? updated : c)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to deny");
    } finally {
      setBusy(false);
    }
  }

  function handleReset() {
    setCases([]);
    setSelectedCaseId(undefined);
    setError(null);
  }

  return (
    <div className="min-h-screen p-6 md:p-8 flex flex-col gap-6 max-w-[1400px] mx-auto">
      <header className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-zinc-900/10 dark:border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-3xl leading-none">⚖️</span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              AgentCourt <span className="text-amber-600 dark:text-amber-400">Precedent</span>
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Every risky AI action goes on trial, and every verdict becomes precedent.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            disabled={busy || cases.length === 0}
            className="rounded-full border border-zinc-300 dark:border-zinc-700 px-4 py-2.5 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all disabled:opacity-40 disabled:pointer-events-none"
          >
            Reset Demo
          </button>
          <button
            onClick={handleRunDemo}
            disabled={busy}
            className="rounded-full bg-gradient-to-r from-amber-600 to-amber-500 text-white px-5 py-2.5 text-sm font-semibold shadow-sm hover:shadow-md hover:from-amber-500 hover:to-amber-400 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {busy ? "Running trial…" : hasExecutedCase ? "Try Similar Action Again" : "Run Golden Demo"}
          </button>
        </div>
      </header>

      <SponsorBar caseRecord={selected} />

      <TrialProgress active={trialRunning} />

      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 px-3 py-2 text-sm">
          {error} — is the backend running on :3001?
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <DocketPanel cases={cases} selectedCaseId={selectedCaseId} onSelect={setSelectedCaseId} />
        <CourtroomPanel courtroom={selected?.courtroom} />
        <EvidenceGraphPanel precedents={selected?.precedents ?? []} />
        <FuturesPanel futures={selected?.futures ?? []} />
        <div className="lg:col-span-2">
          <VerdictExecutionPanel caseRecord={selected} onApprove={handleApprove} onDeny={handleDeny} busy={busy} />
        </div>
      </div>
    </div>
  );
}
