'use client'
import React from 'react'
import { useStore } from '@/lib/store'
import { AGENTS, KPI, DOMAIN_STATUS, BOARD_TASKS, TOKEN_WEEKLY, WEEKLY_REPORT } from '@/lib/data'
import { LogFeed }  from '@/components/widgets/LogFeed'
import { Badge }    from '@/components/ui/badge'
import { cn }       from '@/lib/utils'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis } from 'recharts'
import { Bot, CheckCircle2, Zap, AlertTriangle, TrendingUp, School, Cpu, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import type { DomainStatus, BoardTask } from '@/lib/types'

const DOMAIN_ICON: Record<string, React.ElementType> = { tiktok: TrendingUp, nevgo: School, imagents: Cpu, system: Bot }
const HEALTH_COLORS = {
  ok:      { dot: 'bg-emerald-400',             badge: 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' },
  warning: { dot: 'bg-amber-400 animate-blink', badge: 'bg-amber-500/5 text-amber-400 border-amber-500/20'       },
  down:    { dot: 'bg-red-400 animate-blink',   badge: 'bg-red-500/5 text-red-400 border-red-500/20'             },
}
const TASK_BAR: Record<string, string> = {
  done: 'bg-emerald-500', running: 'bg-indigo-500', queued: 'bg-zinc-700', pending: 'bg-zinc-700', failed: 'bg-red-500',
}
const TIER_BADGE: Record<string, string> = {
  urgent: 'text-red-400 bg-red-500/10 border-red-500/20',
  semi:   'text-amber-400 bg-amber-500/10 border-amber-500/20',
  routine:'text-muted-foreground bg-secondary border-border',
}
const DONUT_DATA = [
  { name: 'Berhasil',    value: WEEKLY_REPORT.berhasil,   fill: '#34d399' },
  { name: 'On Progress', value: WEEKLY_REPORT.onProgress, fill: '#6366f1' },
  { name: 'Baru Mulai',  value: WEEKLY_REPORT.baruMulai,  fill: '#fbbf24' },
]
const TT_STYLE = {
  contentStyle: { backgroundColor: 'hsl(0 0% 11%)', border: '1px solid hsl(0 0% 20%)', borderRadius: '8px', fontSize: '12px', color: 'hsl(0 0% 48%)' },
}

function KpiCard({ label, value, sub, icon: Icon, accent }: { label:string; value:string; sub:string; icon:typeof Bot; accent:string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 surface-card flex items-start gap-3">
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', accent)}>
        <Icon size={15} className="text-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground uppercase tracking-wider label-caps">{label}</p>
        <p className="text-xl font-bold text-foreground mt-0.5 leading-none">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      </div>
    </div>
  )
}

export function OverviewView() {
  const { realMode, liveAgents } = useStore()
  const agents = (realMode && liveAgents) ? liveAgents : AGENTS

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-3">
          <KpiCard label="Agents Running" value={`${KPI.agentsRunning.active}/${KPI.agentsRunning.total}`}
            sub={`${KPI.agentsRunning.idle} idle · ${KPI.agentsRunning.crashed} crashed`}
            icon={Bot} accent="surface-icon" />
          <KpiCard label="Cron Today" value={`${KPI.cronSuccessToday.success}/${KPI.cronSuccessToday.total}`}
            sub={KPI.cronSuccessToday.lastFailed ?? 'All passed'} icon={CheckCircle2} accent="surface-icon" />
          <KpiCard label="Token Velocity" value={KPI.tokenVelocity.today}
            sub={KPI.tokenVelocity.change} icon={Zap} accent="surface-icon" />
          <KpiCard label="Active Alerts" value={String(KPI.activeAlerts.count)}
            sub={KPI.activeAlerts.lastAt ? `Last: ${KPI.activeAlerts.lastAt}` : 'No alerts'} icon={AlertTriangle} accent="surface-icon" />
        </div>

        {/* Domain Status */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Domain Status</p>
          <div className="grid grid-cols-3 gap-3">
            {DOMAIN_STATUS.map(d => {
              const Icon = DOMAIN_ICON[d.id]
              const hc   = HEALTH_COLORS[d.health]
              return (
                <div key={d.id} className="rounded-xl border border-border bg-card p-4 surface-card">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon size={14} className="text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{d.label}</span>
                    </div>
                    <span className={cn('text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border', hc.badge)}>
                      {d.health}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Workers', value: `${d.workersActive}/${d.workersTotal}` },
                      { label: 'Uptime',  value: d.uptimePct ? `${d.uptimePct}%` : '—' },
                      { label: 'Latency', value: d.latencyMs ? `${d.latencyMs}ms` : '—' },
                      { label: 'Tokens',  value: `${(d.tokensBurned/1000).toFixed(1)}k` },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-secondary/50 rounded-lg p-2">
                        <p className="text-[10px] text-muted-foreground">{label}</p>
                        <p className="text-xs font-semibold text-foreground font-mono">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Board + Weekly Report */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Task Board</p>
            <div className="space-y-2">
              {BOARD_TASKS.map(task => (
                <div key={task.id} className="rounded-xl border border-border bg-card p-3 surface-card flex items-center gap-3">
                  <span className={cn('text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border shrink-0', TIER_BADGE[task.tier])}>
                    {task.tier}
                  </span>
                  <span className="flex-1 text-sm text-foreground truncate">{task.title}</span>
                  <div className="w-24 shrink-0">
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className={cn('h-full rounded-full transition-all', TASK_BAR[task.status])} style={{ width: `${task.progress}%` }} />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5 text-right">{task.progress}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Weekly Report</p>
            <div className="rounded-xl border border-border bg-card p-4 surface-card">
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={DONUT_DATA} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value">
                    {DONUT_DATA.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip {...TT_STYLE} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {DONUT_DATA.map(d => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: d.fill }} />
                      <span className="text-xs text-muted-foreground">{d.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-foreground">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Live Log Feed */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recent Activity</p>
          <div className="rounded-xl border border-border bg-card p-4 surface-card h-64">
            <LogFeed maxItems={10} />
          </div>
        </div>

      </div>
    </div>
  )
}
