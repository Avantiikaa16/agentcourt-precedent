import type { CaseStatus } from "./types";

// Color rules from the architecture doc:
// Red = proposed unsafe action, Amber = human review, Blue = modified,
// Green = safely executed, Gray = denied.
export function statusColor(status: CaseStatus): { bg: string; text: string; label: string } {
  switch (status) {
    case "pending":
    case "trial":
      return { bg: "bg-red-100 dark:bg-red-950", text: "text-red-700 dark:text-red-300", label: "Proposed" };
    case "human_review":
      return { bg: "bg-amber-100 dark:bg-amber-950", text: "text-amber-700 dark:text-amber-300", label: "Human Review" };
    case "modification_required":
      return { bg: "bg-blue-100 dark:bg-blue-950", text: "text-blue-700 dark:text-blue-300", label: "Modified" };
    case "approved":
    case "executed":
      return { bg: "bg-green-100 dark:bg-green-950", text: "text-green-700 dark:text-green-300", label: status === "executed" ? "Executed" : "Approved" };
    case "denied":
      return { bg: "bg-zinc-200 dark:bg-zinc-800", text: "text-zinc-700 dark:text-zinc-300", label: "Denied" };
  }
}
