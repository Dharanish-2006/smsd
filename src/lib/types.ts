export type Param = "powerFactor" | "avgCurrent" | "activePower" | "freshness"
export type Severity = "critical" | "warning"
export type Direction = "below" | "above"
export type MachineStatus = "on" | "off" | "unknown"

export interface MachineDef {
  id: string
  name: string
  plant: string
  cardImage: string
  railImage: string
  ratedKw: number
  baseKw: number
  basePf: number
  baseTotalKwh: number
  baseRuntimeHrs: number
  schedule: (hour: number) => boolean
}

export interface TrendPoint {
  t: number
  pf: number
  current: number
  kw: number
}

export interface MachineState {
  def: MachineDef
  on: boolean
  updatedAt: number
  kw: number
  pf: number
  kvar: number
  kva: number
  current: number
  loadFactor: number
  totalKwh: number
  totalKvarh: number
  totalKvah: number
  runKwh: number
  runStart: number | null
  lastStop: number | null
  runSec: number
  todaySec: number
  totalRuntimeSec: number
  pfRunSum: number
  pfRunN: number
  dayKey: string
  hourlyKwh: number[]
  /** 1 = ran, 0 = off, 2 = hour not reached yet */
  hourOn: (0 | 1 | 2)[]
  trend: TrendPoint[]
}

export interface Threshold {
  id: string
  param: Param
  machineId: string | "all"
  warning: number | null
  critical: number | null
}

export interface Alert {
  key: string
  thresholdId: string
  machineId: string
  machineName: string
  plant: string
  param: Param
  severity: Severity
  status: "active" | "recovered"
  reading: number
  limit: number
  since: number
  recoveredAt?: number
}

export interface PhoneEntry {
  id: string
  digits: string
  label: string
}

export interface User {
  id: string
  username: string
  fullName: string
  email: string
  mobile: string
  role: "admin" | "user"
  status: "active" | "pending"
  passHash: string
}
