'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { BellRing, AlertTriangle, CheckCircle2, Power, Pause, Play, XCircle } from 'lucide-react'
import { AGENTS, DOMAIN_STATUS } from '@/lib/data'

interface Alert {
  id: string; level: 'critical' | 'warning' | 'info'
  title: string; detail: string; source: string; ts: string; resolved: boolean
}

const MOCK_ALERTS: Alert[] = [
  { id: 'a1', level: 'warning',  title: 'Nevgo latency spike',      detail: 'Latency 1200ms — threshold 800ms', source: 'nevgo-mgr',   ts: '11:00', resolved: false },
  { id: 'a2', level: 'info',     title: 'Cron job failed once',     detail: 'nevgo-monitor@11:00 failed',       source: 'cron',        ts: '11:00', resolved: false },
  { id: 'a3', level: 'critical', title: 'Imagents workers all idle', detail: '0/2 workers active',               source: 'imagents-mgr',ts: '10:45', resolved: true  },
  { id: 'a4', level: 'info',     title: 'Token velocity +12%',      detail: '21.8K tokens today vs 19.4K avg',  source: 'system',      ts: '10:00', resolved: true  },
]

const LEVEL_CONFIG = {
  critical: { badge: 'bg-red-500/10 text-red-400 border-red-500/20',      dot: 'bg-red-400',    icon: XCircle       },
  warning:  { badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20', dot: 'bg-amber-400',  icon: AlertTriangle },
  info:     { badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',    dot: 'bg-blue-400',   icon: CheckCircle2  },
}

export function AlertCenterView() {
  const { realMode, setRealMode } = useStore()
  const [alerts, setAlerts] = useState(MOCK_ALERTS)
  const [killActive, setKillActive] = useState(false)
  const active = alerts.filter(a => !a.resolved)

  function resolve(id: string) {
    setAlerts(a => a.map(x => x.id === id ? { ...x, resolved: true } : x))
  }

  function killSwitch() {
    setKillActive(k => !k)
    if (!killActive) setRealMode(false)
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-5 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold tracking-tight">Alert Center</h1>
            <p className="text-xs text-muted-foreground">{active.length} active alerts</p>
          </div>
          {/* Kill Switch */}
          <button onClick={killSwitch}
            className={cn('flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold transition-all',
              killActive
                ? 'bg-red-500 border-red-500 text-white animate-pulse'
                : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20')}>
            <Power size={14} />
            {killActive ? 'SYSTEM PAUSED' : 'KILL SWITCH'}
          </button>
        </div>

        {/* Kill switch warning */}
        {killActive && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 flex items-center gap-3">
            <AlertTriangle size={16} className="text-red-400 shrink-0" />
            <div>
              <p className="text-sm font-bold text-red-400">System Paused</p>
              <p className="text-xs text-muted-foreground">Semua agent dan OpenClaw connection dihentikan. Klik Kill Switch lagi untuk resume.</p>
            </div>
          </div>
        )}

        {/* Quick controls */}
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Quick Controls</p>
          <div className="grid grid-cols-4 gap-2">
            {AGENTS.filter(a => a.level !== 'worker').slice(0, 4).map(agent => (
              <div key={agent.id} className="rounded-lg border border-border bg-card p-3 surface-card">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">{agent.emoji}</span>
                  <span className="text-xs font-semibold text-foreground truncate">{agent.alias}</span>
                </div>
                <div className="flex gap-1">
                  <button className="flex-1 flex items-center justify-center py-1 rounded bg-secondary border border-border text-muted-foreground hover:text-foreground transition-all">
                    <Pause size={10} />
                  </button>
                  <button className="flex-1 flex items-center justify-center py-1 rounded bg-secondary border border-border text-muted-foreground hover:text-foreground transition-all">
                    <Play size={10} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active alerts */}
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
            Active Alerts ({active.length})
          </p>
          <div className="space-y-2">
            {active.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-6 text-center">
                <CheckCircle2 size={20} className="text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">All clear — no active alerts</p>
              </div>
            ) : (
              active.map(alert => {
                const cfg = LEVEL_CONFIG[alert.level]
                return (
                  <div key={alert.id} className="rounded-xl border border-border bg-card p-4 surface-card flex items-start gap-3">
                    <span className={cn('w-2 h-2 rounded-full shrink-0 mt-1.5', cfg.dot)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn('text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border', cfg.badge)}>
                          {alert.level}
                        </span>
                        <span className="text-xs font-semibold text-foreground">{alert.title}</span>
                        <span className="text-[10px] text-muted-foreground font-mono ml-auto">{alert.ts}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{alert.detail}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Source: {alert.source}</p>
                    </div>
                    <button onClick={() => resolve(alert.id)}
                      className="shrink-0 px-2.5 py-1 rounded-md bg-secondary border border-border text-[10px] text-muted-foreground hover:text-foreground transition-all">
                      Resolve
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Resolved */}
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
            Resolved ({alerts.filter(a => a.resolved).length})
          </p>
          <div className="space-y-2">
            {alerts.filter(a => a.resolved).map(alert => {
              const cfg = LEVEL_CONFIG[alert.level]
              return (
                <div key={alert.id} className="rounded-xl border border-border/40 bg-card/50 p-3 flex items-center gap-3 opacity-50">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  <span className="text-xs text-muted-foreground truncate">{alert.title}</span>
                  <span className="text-[10px] text-muted-foreground font-mono ml-auto">{alert.ts}</span>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
