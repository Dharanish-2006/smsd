const TZ = "Asia/Kolkata"

export const istTime = (ms: number) =>
  new Date(ms).toLocaleTimeString("en-GB", {
    timeZone: TZ,
    hourCycle: "h23",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })

export const istHm = (ms: number) =>
  new Date(ms).toLocaleTimeString("en-GB", {
    timeZone: TZ,
    hourCycle: "h23",
    hour: "2-digit",
    minute: "2-digit",
  })

export const istDay = (ms: number) =>
  new Date(ms).toLocaleDateString("en-GB", {
    timeZone: TZ,
    day: "2-digit",
    month: "short",
  })

export const istDate = (ms: number) =>
  new Date(ms).toLocaleDateString("en-GB", {
    timeZone: TZ,
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

export const istStamp = (ms: number) => `${istDay(ms)}, ${istHm(ms)}`

export const istDayKey = (ms: number) =>
  new Date(ms).toLocaleDateString("en-CA", { timeZone: TZ })

export const istHour = (ms: number) =>
  parseInt(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: TZ,
      hourCycle: "h23",
      hour: "2-digit",
    }).format(ms),
    10,
  )

export const fmtDuration = (sec: number) => {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  return `${h.toLocaleString("en-IN")} h ${m} min`
}

export const fmt = (v: number, d = 2) =>
  v.toLocaleString("en-IN", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  })

export const fmtPhone = (digits: string) =>
  `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`

export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const esc = (v: string | number) => {
    const s = String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const blob = new Blob([rows.map((r) => r.map(esc).join(",")).join("\n")], {
    type: "text/csv;charset=utf-8",
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
