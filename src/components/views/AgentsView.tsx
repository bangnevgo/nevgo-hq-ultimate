'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import { AGENTS }   from '@/lib/data'
import { cn }       from '@/lib/utils'
import { Badge }    from '@/components/ui/badge'
import { Bot, Circle } from 'lucide-react'

const STATUS_COLOR: Record<string, string> = {
  online:  'bg-emerald-400',
  busy:    'bg-indigo-400 animate-pulse',
  idle:    'bg-zinc-600',
  offline: 'bg-zinc-700',
  crashed: 'bg-red-400 animate-blink',
}
const STATUS_BADGE: Record<string, string> = {
  online:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  busy:    'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  idle:    'bg-zinc-500/10 text-zinc-500 border-zinc-500/20',
  offline: 'bg-zinc-800 text-zinc-600 border-zinc-700',
  crashed: 'bg-red-500/10 text-red-400 border-red-500/20',
}
const LEVEL_BADGE: Record<string, string> = {
  director: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  manager:  'bg-sky-500/10 text-sky-400 border-sky-500/20',
  worker:   'bg-zinc-500/10 text-zinc-500 border-zinc-700',
}

export function AgentsView() {
  const { realMode, liveAgents } = useStore()
  const [filter, setFilter] = useState<'all'|'online'|'busy'|'idle'|'offline'>('all')
  const agents = (realMode && liveAgents) ? liveAgents : AGENTS
  const filtered = filter === 'all' ? agents : agents.filter(a => a.status === filter)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 py-4 border-b border-border shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center">
              <Bot size={14} className="text-foreground" />
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight">Agents</h1>
              <p className="text-xs text-muted-foreground">{agents.filter(a=>a.status==='online'||a.status==='busy').length}/{agents.length} active</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {(['all','online','busy','idle','offline'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={cn('px-2.5 py-1 rounded text-xs font-medium border transition-all',
                  filter === f ? 'bg-foreground text-background border-foreground' : 'bg-transparent border-border text-muted-foreground hover:text-foreground hover:bg-accent')}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 gap-3">
          {filtered.map(agent => (
            <div key={agent.id} className="rounded-xl border border-border bg-card p-4 surface-card surface-card-hover">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-xl shrink-0">
                  {agent.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-foreground">{agent.alias}</span>
                    <span className={cn('text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border', STATUS_BADGE[agent.status])}>
                      <span className="flex items-center gap-1">
                        <Circle size={6} className={cn('fill-current', STATUS_COLOR[agent.status].split(' ')[0].replace('bg-','text-'))} />
                        {agent.status}
                      </span>
                    </span>
                    <span className={cn('text-[10px] font-medium uppercase px-1.5 py-0.5 rounded border', LEVEL_BADGE[agent.level])}>
                      {agent.level}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{agent.description}</p>
                  {agent.task && (
                    <p className="text-xs text-indigo-400 mt-1 truncate">▶ {agent.task}</p>
                  )}
                </div>
                <div className="shrink-0 text-right space-y-1">
                  <p className="text-xs font-mono text-muted-foreground">{agent.model}</p>
                  <p className="text-xs text-muted-foreground">↑ {agent.uptime}</p>
                  <p className="text-xs font-mono text-foreground/60">{agent.tokensToday.toLocaleString()} tok</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
