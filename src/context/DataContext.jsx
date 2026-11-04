import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, } from "react";
import { evaluate, sortAlerts } from "../lib/alerts";
import { load, save, uid } from "../lib/storage";
import { createInitial, MACHINES, PLANTS, tick } from "../lib/sim";
const TH_KEY = "smm.thresholds";
const PH_KEY = "smm.phones";
const TICK_MS = 2000;
const DEFAULT_THRESHOLDS = [
    {
        id: "t1",
        param: "powerFactor",
        machineId: "all",
        warning: 0.9,
        critical: 0.8,
    },
    {
        id: "t2",
        param: "avgCurrent",
        machineId: "sheller-1",
        warning: 38,
        critical: 45,
    },
    {
        id: "t3",
        param: "activePower",
        machineId: "all",
        warning: 28,
        critical: 32,
    },
    {
        id: "t4",
        param: "freshness",
        machineId: "all",
        warning: 120,
        critical: null,
    },
];
const DEFAULT_PHONES = [
    { id: "p1", digits: "9000000001", label: "Primary contact" },
    { id: "p2", digits: "9000000002", label: "Maintenance" },
];
const Ctx = createContext(null);
export function DataProvider({ children }) {
    const [plant, setPlant] = useState(PLANTS[0]);
    const [machines, setMachines] = useState(() => MACHINES.map((d) => createInitial(d, Date.now())));
    const [lastUpdate, setLastUpdate] = useState(() => Date.now());
    const [thresholds, setThresholds] = useState(() => load(TH_KEY, DEFAULT_THRESHOLDS));
    const [phones, setPhones] = useState(() => load(PH_KEY, DEFAULT_PHONES));
    const [alertMap, setAlertMap] = useState(new Map());
    const lastTick = useRef(Date.now());
    // Live feed. Swap this interval for a fetch/WebSocket to use a real API.
    useEffect(() => {
        const id = window.setInterval(() => {
            const now = Date.now();
            const dt = Math.min((now - lastTick.current) / 1000, 10);
            lastTick.current = now;
            setMachines((prev) => prev.map((m) => tick(m, now, dt)));
            setLastUpdate(now);
        }, TICK_MS);
        return () => window.clearInterval(id);
    }, []);
    useEffect(() => {
        setAlertMap((prev) => evaluate(machines, thresholds, prev, lastUpdate));
    }, [machines, thresholds, lastUpdate]);
    const saveThreshold = useCallback((t) => {
        setThresholds((prev) => {
            const next = t.id
                ? prev.map((x) => (x.id === t.id ? { ...t, id: t.id } : x))
                : [...prev, { ...t, id: uid() }];
            save(TH_KEY, next);
            return next;
        });
    }, []);
    const removeThreshold = useCallback((id) => {
        setThresholds((prev) => {
            const next = prev.filter((x) => x.id !== id);
            save(TH_KEY, next);
            return next;
        });
    }, []);
    const savePhone = useCallback((p) => {
        setPhones((prev) => {
            const next = p.id
                ? prev.map((x) => x.id === p.id ? { ...p, id: p.id } : x)
                : [...prev, { ...p, id: uid() }];
            save(PH_KEY, next);
            return next;
        });
    }, []);
    const removePhone = useCallback((id) => {
        setPhones((prev) => {
            const next = prev.filter((x) => x.id !== id);
            save(PH_KEY, next);
            return next;
        });
    }, []);
    const alerts = useMemo(() => sortAlerts([...alertMap.values()]), [alertMap]);
    const plantMachines = useMemo(() => machines.filter((m) => m.def.plant === plant), [machines, plant]);
    const value = {
        plants: PLANTS,
        plant,
        setPlant,
        machines: plantMachines,
        lastUpdate,
        alerts: alerts.filter((a) => a.plant === plant),
        activeAlertCount: alerts.filter((a) => a.plant === plant && a.status === "active").length,
        thresholds,
        saveThreshold,
        removeThreshold,
        phones,
        savePhone,
        removePhone,
    };
    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useData() {
    const c = useContext(Ctx);
    if (!c)
        throw new Error("useData must be used inside DataProvider");
    return c;
}
