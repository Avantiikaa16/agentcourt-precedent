import type { CaseRecord } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function runGoldenDemo(): Promise<CaseRecord> {
  const res = await fetch(`${API_URL}/api/dev/run-golden-demo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error(`run-golden-demo failed: ${res.status}`);
  return res.json();
}

export async function listCases(): Promise<CaseRecord[]> {
  const res = await fetch(`${API_URL}/api/cases`);
  if (!res.ok) throw new Error(`list cases failed: ${res.status}`);
  return res.json();
}

export async function approveCase(caseId: string, approvedBy: string): Promise<CaseRecord> {
  const res = await fetch(`${API_URL}/api/cases/${caseId}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approvedBy }),
  });
  if (!res.ok) throw new Error(`approve failed: ${res.status}`);
  return res.json();
}

export async function denyCase(caseId: string): Promise<CaseRecord> {
  const res = await fetch(`${API_URL}/api/cases/${caseId}/deny`, { method: "POST" });
  if (!res.ok) throw new Error(`deny failed: ${res.status}`);
  return res.json();
}
