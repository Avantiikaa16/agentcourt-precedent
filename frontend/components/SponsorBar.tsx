import type { CaseRecord } from "@/lib/types";

type SponsorStatus = "real" | "simulated" | "unavailable";

const STATUS_STYLE: Record<SponsorStatus, string> = {
  real: "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300",
  simulated: "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300",
  unavailable: "bg-zinc-500/10 border-zinc-500/20 text-zinc-500",
};

const STATUS_DOT: Record<SponsorStatus, string> = {
  real: "bg-emerald-500",
  simulated: "bg-amber-500",
  unavailable: "bg-zinc-400",
};

const STATUS_LABEL: Record<SponsorStatus, string> = {
  real: "REAL",
  simulated: "SIMULATED",
  unavailable: "UNAVAILABLE",
};

function Chip({ status, label, detail }: { status: SponsorStatus; label: string; detail: string }) {
  return (
    <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium border ${STATUS_STYLE[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} />
      <span className="font-semibold">{label}</span>
      <span className="opacity-70">{STATUS_LABEL[status]}</span>
      <span className="opacity-80">{detail}</span>
    </div>
  );
}

export function SponsorBar({ caseRecord }: { caseRecord?: CaseRecord }) {
  const laserdataStatus: SponsorStatus = caseRecord?.laserdata?.connected
    ? "real"
    : caseRecord?.laserdata
      ? "simulated"
      : "unavailable";
  const falkordbStatus: SponsorStatus = (caseRecord?.precedents.length ?? 0) > 0 ? "real" : "unavailable";
  const guildStatus: SponsorStatus = caseRecord?.courtroom?.source === "guild" ? "real" : "unavailable";
  const rocketrideStatus: SponsorStatus =
    caseRecord?.executionReceipt?.mode === "real" ? "real" : caseRecord?.executionReceipt ? "simulated" : "unavailable";

  return (
    <div className="flex flex-wrap gap-2">
      <Chip
        status={laserdataStatus}
        label="LaserData"
        detail={
          caseRecord?.laserdata?.connected
            ? `${caseRecord.laserdata.stream}/${caseRecord.laserdata.topic} @${caseRecord.laserdata.offset}`
            : "no event"
        }
      />
      <Chip
        status={falkordbStatus}
        label="FalkorDB"
        detail={`${caseRecord?.precedents.length ?? 0} precedents`}
      />
      <Chip status={guildStatus} label="Guild" detail={guildStatus === "real" ? "3 agents" : "no session"} />
      <Chip
        status={rocketrideStatus}
        label="RocketRide"
        detail={caseRecord?.executionReceipt?.rocketride ? caseRecord.executionReceipt.rocketride.objectId.slice(0, 8) : "not executed"}
      />
    </div>
  );
}
