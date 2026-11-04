import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { hash, load, save, uid } from "../lib/storage"
import type { User } from "../lib/types"

const USERS_KEY = "smm.users"
const SESSION_KEY = "smm.session"

export interface RegisterInput {
  fullName: string
  username: string
  email: string
  mobile: string
  password: string
  role: "admin" | "user"
}

interface AuthCtx {
  ready: boolean
  user: User | null
  users: User[]
  login: (username: string, password: string) => Promise<string | null>
  register: (input: RegisterInput) => Promise<string | null>
  logout: () => void
  changePassword: (current: string, next: string) => Promise<string | null>
  approveUser: (id: string) => void
  rejectUser: (id: string) => void
}

const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([])
  const [sessionId, setSessionId] = useState<string | null>(() =>
    load<string | null>(SESSION_KEY, null),
  )
  const [ready, setReady] = useState(false)

  // Seed a default admin on first run.
  useEffect(() => {
    ;(async () => {
      let stored = load<User[]>(USERS_KEY, [])
      if (stored.length === 0) {
        stored = [
          {
            id: uid(),
            username: "admin",
            fullName: "Administrator",
            email: "",
            mobile: "",
            role: "admin",
            status: "active",
            passHash: await hash("admin123"),
          },
        ]
        save(USERS_KEY, stored)
      }
      setUsers(stored)
      setReady(true)
    })()
  }, [])

  const persist = useCallback((next: User[]) => {
    setUsers(next)
    save(USERS_KEY, next)
  }, [])

  const user = useMemo(
    () =>
      users.find((u) => u.id === sessionId && u.status === "active") ?? null,
    [users, sessionId],
  )

  const login = useCallback(
    async (username: string, password: string) => {
      const u = users.find(
        (x) => x.username.toLowerCase() === username.trim().toLowerCase(),
      )
      if (!u || u.passHash !== (await hash(password)))
        return "Wrong username or password."
      if (u.status === "pending")
        return "Your account is waiting for administrator approval."
      save(SESSION_KEY, u.id)
      setSessionId(u.id)
      return null
    },
    [users],
  )

  const register = useCallback(
    async (input: RegisterInput) => {
      if (
        users.some(
          (u) =>
            u.username.toLowerCase() === input.username.trim().toLowerCase(),
        )
      )
        return "That username is already taken."
      persist([
        ...users,
        {
          id: uid(),
          username: input.username.trim(),
          fullName: input.fullName.trim(),
          email: input.email.trim(),
          mobile: input.mobile,
          role: input.role,
          status: "pending",
          passHash: await hash(input.password),
        },
      ])
      return null
    },
    [users, persist],
  )

  const logout = useCallback(() => {
    save(SESSION_KEY, null)
    setSessionId(null)
  }, [])

  const changePassword = useCallback(
    async (current: string, next: string) => {
      if (!user) return "Not signed in."
      if (user.passHash !== (await hash(current)))
        return "Current password is incorrect."
      const passHash = await hash(next)
      persist(users.map((u) => (u.id === user.id ? { ...u, passHash } : u)))
      return null
    },
    [user, users, persist],
  )

  const approveUser = useCallback(
    (id: string) =>
      persist(users.map((u) => (u.id === id ? { ...u, status: "active" } : u))),
    [users, persist],
  )
  const rejectUser = useCallback(
    (id: string) => persist(users.filter((u) => u.id !== id)),
    [users, persist],
  )

  const value = useMemo(
    () => ({
      ready,
      user,
      users,
      login,
      register,
      logout,
      changePassword,
      approveUser,
      rejectUser,
    }),
    [
      ready,
      user,
      users,
      login,
      register,
      logout,
      changePassword,
      approveUser,
      rejectUser,
    ],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  const c = useContext(Ctx)
  if (!c) throw new Error("useAuth must be used inside AuthProvider")
  return c
}
