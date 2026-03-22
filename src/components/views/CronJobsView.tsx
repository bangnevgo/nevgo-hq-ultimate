'use client'
import { CRON_JOBS, AGENTS } from '@/lib/data'
import { cn } from '@/lib/utils'
import { Clock, CheckCircle2, XCircle, Loader2, Circle } from 'lucide-react'

const STATUS_CONFIG = {
  success: { icon: CheckCircle2, color: 'text-emerald-400', badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
  running: { icon: Loader2,      color: 'text-indigo-400',  badge: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'   },
  failed:  { icon: XCircle,      color: 'text-red-400',     badge: 'bg-red-500/10 border-red-500/20 text-red-400'             },
  pending: { icon: Circle,       color: 'text-zinc-400',    badge: 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400'          },
}

export function CronJobsView() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 py-4 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center">
            <Clock size={14} className="text-foreground" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight">Cron Jobs</h1>
            <p className="text-xs text-muted-foreground">{CRON_JOBS.length} scheduled jobs</p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-3">
          {CRON_JOBS.map(job => {
            const cfg   = STATUS_CONFIG[job.status]
            const agent = AGENTS.find(a => a.id === job.agentId)
            return (
              <div key={job.id} className="rounded-xl border border-border bg-card p-4 surface-card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <cfg.icon size={16} className={cn(cfg.color, job.status === 'running' && 'animate-spin')} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{job.label}</p>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">{job.schedule}</p>
                    </div>
                  </div>
                  <span className={cn('text-[10px] font-bold uppercase px-2 py-0.5 rounded border shrink-0', cfg.badge)}>
                    {job.status}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-3">
                  {[
                    { label: 'Agent',      value: agent?.alias ?? job.agentId },
                    { label: 'Last Run',   value: job.lastRun },
                    { label: 'Next Run',   value: job.nextRun ?? '—' },
                    { label: 'Success',    value: `${job.successRate}%` },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-secondary/50 rounded-lg p-2.5">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
                      <p className="text-xs font-semibold text-foreground font-mono">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
