import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ConsumptionBars } from "../components/Charts"
import { AssetIcon, StatusBadge } from "../components/Icon"
import { ASSETS } from "../config"
import { useData } from "../context/DataContext"
import { fmt, fmtDuration } from "../lib/format"
import type { MachineState } from "../lib/types"

export const statusOf = (m: MachineState) =>
  Date.now() - m.updatedAt > 120000 ? "unknown" : m.on ? "on" : "off"

const todayKwh = (m: MachineState) => m.hourlyKwh.reduce((a, b) => a + b, 0)

function MachineCard({ m, onOpen }: { m: MachineState ;onOpen: () => void }) {
  const status = statusOf(m)
  const on = status === "on"
  const kwh = todayKwh(m)
  return (
    <button
      className="machine-card"
      aria-label={`Open ${m.def.name} process analysis`}
      onClick={onOpen}
    >
      <div className="machine-heading">
        <div className="machine-art">
          <img src={m.def.cardImage} alt="" />
          <span className={on ? "machine-dot on" : "machine-dot"} />
        </div>
        <div>
          <h3>{m.def.name}</h3>
          <StatusBadge status={status} />
        </div>
      </div>

      <div className="machine-stats">
        <div className="machine-stat">
          <span>Status</span>
          <StatusBadge status={status} />
        </div>
        <div className="machine-stat">
          <span className="stat-title">
            <b className="line-icon clock" />
            Runtime today
          </span>
          <strong>{m.todaySec > 0 ? fmtDuration(m.todaySec) : "--"}</strong>
        </div>
        <div className="machine-stat">
          <span className="stat-title">
            <b className="line-icon gauge" />
            Power Factor
          </span>
          <strong>{on ? fmt(m.pf) : "N/A"}</strong>
        </div>
        <div className="machine-stat">
          <span className="stat-title">
            <b className="line-icon layers" />
            Load Factor
          </span>
          <strong>{on ? Math.round(m.loadFactor) : 0} %</strong>
          <div className="load-track">
            <i style={{ width: `${on ? Math.min(m.loadFactor, 100) : 0}%` }} />
          </div>
        </div>
        <div className="machine-stat consumed">
          <span className="stat-title">
            <b className="bolt">ϟ</b>Power Consumed
          </span>
          <div className="consumed-value">
            <strong>{kwh > 0 ? `${fmt(kwh, 1)} kWh` : "-- kWh"}</strong>
            <ConsumptionBars muted={!on} />
          </div>
        </div>
      </div>
    </button>
  )
}

export default function DashboardPage() {
  const { machines, plant, plants, setPlant } = useData()
  const navigate = useNavigate()
  const [menu, setMenu] = useState(false)
  const total = machines.reduce((s, m) => s + todayKwh(m), 0)

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div>
            <h1>Dashboard</h1>
            <p>Today at a glance for the selected plant.</p>
          </div>
          <div className="hero-select">
            <span id="plant-label">SELECT PLANT</span>
            <button
              className="plant-select"
              aria-labelledby="plant-label"
              aria-haspopup="listbox"
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              <AssetIcon file="55464.svg" />
              <strong>{plant}</strong>
              <AssetIcon file="94c21.svg" size={20} />
            </button>
            {menu && (
              <div className="plant-menu" role="listbox">
                {plants.map((p) => (
                  <button
                    key={p}
                    role="option"
                    aria-selected={p === plant}
                    onClick={() => {
                      setPlant(p)
                      setMenu(false)
                    }}
                  >
                    {p} {p === plant && <span>Selected</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <img
          className="mill-art"
          src={`${ASSETS}/ae74d.svg`}
          alt="Rice mill illustration"
        />
      </section>

      <section className="primary-metrics" aria-label="Plant metrics">
        <article className="metric energy">
          <h2>POWER CONSUMED TODAY</h2>
          <div className="energy-value">
            <span className="energy-icon">ϟ</span>
            <strong>{Math.round(total).toLocaleString("en-IN")}</strong>
            <span>kWh</span>
            <ConsumptionBars />
          </div>
        </article>
      </section>

      <section className="machines">
        <div className="machines-header">
          <div>
            <h2>Machine overview</h2>
            <p>
              {plant} · {machines.length} machines · Select a machine to open
              Process Analysis
            </p>
          </div>
          <p>N/A = no valid reading. 0 % = machine is OFF.</p>
        </div>
        <div className="machine-list">
          {machines.map((m) => (
            <MachineCard
              key={m.def.id}
              m={m}
              onOpen={() => navigate(`/machines/${m.def.id}`)}
            />
          ))}
        </div>
      </section>
    </>
  )
}
