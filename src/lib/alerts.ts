import { PARAMS } from "./params"
import type { Alert, MachineState, Severity, Threshold } from "./types"

function breach(value: number, limit: number | null, dir: "below" | "above") {
  if (limit === null) return false
  return dir === "below" ? value < limit : value > limit
}

export function evaluate(
  machines: MachineState[],
  thresholds: Threshold[],
  prev: Map<string, Alert>,
  now: number,
): Map<string, Alert> {
  const next = new Map<string, Alert>()
  const live = new Set<string>()
  const thresholdIds = new Set(thresholds.map((t) => t.id))

  for (const t of thresholds) {
    const meta = PARAMS[t.param]
    for (const m of machines) {
      if (t.machineId !== "all" && t.machineId !== m.def.id) continue
      const value = meta.get(m, now)
      if (value === null) continue
      let severity: Severity | null = null
      let limit = 0
      if (breach(value, t.critical, meta.dir)) {
        severity = "critical"
        limit = (t.critical as number)
      } else if (breach(value, t.warning, meta.dir)) {
        severity = "warning"
        limit = (t.warning as number)
      }
      if (!severity) continue
      const key = `${t.id}:${m.def.id}`
      live.add(key)
      const old = prev.get(key)
      next.set(key, {
        key,
        thresholdId: t.id,
        machineId: m.def.id,
        machineName: m.def.name,
        plant: m.def.plant,
        param: t.param,
        severity,
        status: "active",
        reading: value,
        limit,
        since: old && old.status === "active" ? old.since : now,
      })
    }
  }

  for (const [key, old] of prev) {
    if (live.has(key) || !thresholdIds.has(old.thresholdId)) continue
    next.set(
      key,
      old.status === "active"
        ? { ...old, status: "recovered", recoveredAt: now }
        : old,
    )
  }

  // keep only the 20 most recent recoveries
  const recovered = [...next.values()]
    .filter((a) => a.status === "recovered")
    .sort((a, b) => (b.recoveredAt ?? 0) - (a.recoveredAt ?? 0))
  for (const a of recovered.slice(20)) next.delete(a.key)
  return next
}

const RANK = { critical: 0, warning: 1 }
export function sortAlerts(list: Alert[]): Alert[] {
  return list.slice().sort((a, b) => {
    if (a.status !== b.status) return a.status === "active" ? -1 : 1
    if (a.status === "active") {
      return RANK[a.severity] - RANK[b.severity] || b.since - a.since
    }
    return (b.recoveredAt ?? 0) - (a.recoveredAt ?? 0)
  })
}
