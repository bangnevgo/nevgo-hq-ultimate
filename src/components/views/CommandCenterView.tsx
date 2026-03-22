'use client'
import { useStore } from '@/lib/store'
import { AGENTS, KPI, DOMAIN_STATUS, BOARD_TASKS } from '@/lib/data'
import { WeeklyDonut } from '@/components/widgets/Charts'
import { cn } from '@/lib/utils'
import {
  Brain, Cpu, Bot, CheckCircle2, Zap, AlertTriangle,
  Circle, ArrowRight, Power, Activity,
} from 'lucide-react'

const STATUS_DOT: Record<string, string> = {
  online:  'bg-emerald-400',
  busy:    'bg-indigo-400 animate-pulse',
  idle:    'bg-zinc-600',
  offline: 'bg-zinc-700',
  crashed: 'bg-red-400',
}
const TIER_BADGE: Record<string, string> = {
  urgent:  'text-red-400 bg-red-500/10 border-red-500/20',
  semi:    'text-amber-400 bg-amber-500/10 border-amber-500/20',
  routine: 'text-muted-foreground bg-secondary border-border',
}
const TASK_BAR: Record<string, string> = {
  done: 'bg-emerald-500', running: 'bg-indigo-500',
  queued: 'bg-zinc-700', pending: 'bg-zinc-700', failed: 'bg-red-500',
}
const HEALTH_BADGE: Record<string, string> = {
  ok:      'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  warning: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  down:    'text-red-400 bg-red-500/10 border-red-500/20',
}

export function CommandCenterView() {
  const { realMode, liveAgents, setView } = useStore()
  const agents = (realMode && liveAgents) ? liveAgents : AGENTS
  const activeAgents = agents.filter(a => a.status === 'online' || a.status === 'busy')
  const busyAgents   = agents.filter(a => a.status === 'busy')

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-5 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-tight">Command Center</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Brain · Nervous System · Unified Control</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border',
              activeAgents.length > 0
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-secondary border-border text-muted-foreground')}>
              <Activity size={11} />
              {activeAgents.length} agents active
            </span>
          </div>
        </div>

        {/* Brain + Nervous split */}
        <div className="grid grid-cols-2 gap-4">

          {/* BRAIN — Hermes */}
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/[0.03] p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <Brain size={13} className="text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">BRAIN</p>
                  <p className="text-[10px] text-indigo-400">Hermes · Reasoning Engine</p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded border bg-indigo-500/10 border-indigo-500/20 text-indigo-400">
                {realMode ? 'LIVE' : 'MOCK'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                { label: 'Memory',    value: '142 entries' },
                { label: 'Skills',    value: '8 loaded'    },
                { label: 'Decisions', value: '28 today'    },
                { label: 'Avg Latency', value: '312ms'     },
              ].map(({ label, value }) => (
                <div key={label} className="bg-secondary/40 rounded-lg p-2.5">
                  <p className="text-[10px] text-muted-foreground">{label}</p>
                  <p className="text-xs font-bold text-foreground font-mono">{value}</p>
                </div>
              ))}
            </div>
            <div className="space-y-1">
              {[
                { label: 'Decision Trace', id: 'decision-trace', color: 'text-indigo-400' },
                { label: 'Think Sandbox',  id: 'think-sandbox',  color: 'text-indigo-400' },
                { label: 'Memory Explorer',id: 'memory',         color: 'text-indigo-400' },
              ].map(item => (
                <button key={item.id} onClick={() => setView(item.id)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/10 transition-all group">
                  <span className="text-xs text-muted-foreground group-hover:text-foreground">{item.label}</span>
                  <ArrowRight size={11} className="text-indigo-400/50 group-hover:text-indigo-400" />
                </button>
              ))}
            </div>
          </div>

          {/* NERVOUS — OpenClaw */}
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Cpu size={13} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">NERVOUS SYSTEM</p>
                  <p className="text-[10px] text-emerald-400">OpenClaw · Executor</p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded border bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                {KPI.agentsRunning.active}/{KPI.agentsRunning.total}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                { label: 'Channels',  value: '3 active'   },
                { label: 'Crons',     value: `${KPI.cronSuccessToday.success}/${KPI.cronSuccessToday.total}` },
                { label: 'Queue',     value: '3 pending'  },
                { label: 'Tokens',    value: KPI.tokenVelocity.today },
              ].map(({ label, value }) => (
                <div key={label} className="bg-secondary/40 rounded-lg p-2.5">
                  <p className="text-[10px] text-muted-foreground">{label}</p>
                  <p className="text-xs font-bold text-foreground font-mono">{value}</p>
                </div>
              ))}
            </div>
            <div className="space-y-1">
              {[
                { label: 'Channel Inbox', id: 'inbox',     color: 'text-emerald-400' },
                { label: 'Cron Manager',  id: 'cron-jobs', color: 'text-emerald-400' },
                { label: 'Agents',        id: 'agents',    color: 'text-emerald-400' },
              ].map(item => (
                <button key={item.id} onClick={() => setView(item.id)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 transition-all group">
                  <span className="text-xs text-muted-foreground group-hover:text-foreground">{item.label}</span>
                  <ArrowRight size={11} className="text-emerald-400/50 group-hover:text-emerald-400" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active Now */}
        {busyAgents.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Active Now</p>
            <div className="grid grid-cols-2 gap-2">
              {busyAgents.map(agent => (
                <div key={agent.id} className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5 surface-card">
                  <span className="text-base shrink-0">{agent.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{agent.alias}</p>
                    <p className="text-[10px] text-indigo-400 truncate">{agent.task ?? 'Working…'}</p>
                  </div>
                  <span className={cn('w-2 h-2 rounded-full shrink-0', STATUS_DOT[agent.status])} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Domain Health */}
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Domain Health</p>
          <div className="grid grid-cols-3 gap-2">
            {DOMAIN_STATUS.map(d => (
              <div key={d.id} className="rounded-lg border border-border bg-card p-3 surface-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-foreground truncate">{d.label}</span>
                  <span className={cn('text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border', HEALTH_BADGE[d.health])}>
                    {d.health}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <div>
                    <p className="text-[9px] text-muted-foreground">Workers</p>
                    <p className="text-xs font-mono font-bold text-foreground">{d.workersActive}/{d.workersTotal}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground">Latency</p>
                    <p className={cn('text-xs font-mono font-bold', (d.latencyMs ?? 0) > 800 ? 'text-amber-400' : 'text-foreground')}>
                      {d.latencyMs}ms
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Task Board + Weekly */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Task Board</p>
            {BOARD_TASKS.map(task => (
              <div key={task.id} className="rounded-lg border border-border bg-card px-3 py-2.5 surface-card flex items-center gap-3">
                <span className={cn('text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border shrink-0', TIER_BADGE[task.tier])}>
                  {task.tier}
                </span>
                <span className="flex-1 text-xs text-foreground truncate">{task.title}</span>
                <div className="w-20 shrink-0">
                  <div className="h-1 bg-secondary rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full', TASK_BAR[task.status])} style={{ width: `${task.progress}%` }} />
                  </div>
                  <p className="text-[9px] text-muted-foreground mt-0.5 text-right">{task.progress}%</p>
                </div>
              </div>
            ))}
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Weekly</p>
            <WeeklyDonut />
          </div>
        </div>

      </div>
    </div>
  )
}
