'use client'
import { create } from 'zustand'
import type { Agent, Platform, ToastItem, ToastType, LiveLogEntry } from './types'

const MAX_LOGS = 200

interface Store {
  view: string;       setView:      (v: string)   => void
  platform: Platform; setPlatform:  (p: Platform) => void
  realMode: boolean;  setRealMode:  (v: boolean)  => void
  gatewayUrl: string; setGatewayUrl:(v: string)   => void
  gatewayOk: boolean; setGatewayOk: (v: boolean)  => void
  useConvex: boolean; setUseConvex: (v: boolean)  => void
  convexUrl: string;  setConvexUrl: (v: string)   => void
  liveAgents: Agent[] | null; setLiveAgents:(a: Agent[] | null) => void
  liveLogs: LiveLogEntry[];
  pushLog: (entry: LiveLogEntry) => void
  clearLogs: () => void
  toasts: ToastItem[];
  toast: (msg: string, type?: ToastType) => void
}

export const useStore = create<Store>((set) => ({
  view: 'overview',   setView:      (v) => set({ view: v }),
  platform: 'all',    setPlatform:  (p) => set({ platform: p }),
  realMode: false,    setRealMode:  (v) => set({ realMode: v }),
  gatewayUrl: 'http://127.0.0.1:18790', setGatewayUrl: (v) => set({ gatewayUrl: v }),
  gatewayOk: false,   setGatewayOk: (v) => set({ gatewayOk: v }),
  useConvex: false,   setUseConvex: (v) => set({ useConvex: v }),
  convexUrl: '',      setConvexUrl: (v) => set({ convexUrl: v }),
  liveAgents: null,   setLiveAgents:(a) => set({ liveAgents: a }),
  liveLogs: [],
  pushLog: (entry) => set(s => ({ liveLogs: [entry, ...s.liveLogs].slice(0, MAX_LOGS) })),
  clearLogs: () => set({ liveLogs: [] }),
  toasts: [],
  toast: (msg, type = 'info') => {
    const id = Date.now()
    set(s => ({ toasts: [...s.toasts, { id, msg, type }] }))
    setTimeout(() => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), 4000)
  },
}))
