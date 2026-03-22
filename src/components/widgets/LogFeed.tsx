'use client'
import { useState } from 'react'
import { Filter } from 'lucide-react'
import { LOGS, AGENTS } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const PFX: Record<string, string> = { success: '✓', info: 'ℹ', warning: '⚠', error: '✕', action: '→' }
const AGENT_COLORS: Record<string, string> = {
  aria: 'bg-blue-500', 'tiktok-mgr': 'bg-violet-500', 'trend-scout': 'bg-violet-400',
  'content-ideator': 'bg-amber-500', scheduler: 'bg-amber-400', publisher: 'bg-emerald-500',
  'nevgo-mgr': 'bg-teal-500', 'imagents-mgr': 'bg-indigo-500',
}

export function LogFeed({ maxItems = 20 }: { maxItems?: number }) {
  const [filter, setFilter] = useState('all')
  const entries = (filter === 'all' ? LOGS : LOGS.filter(e => e.agent === filter)).slice(0, maxItems)
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3 flex-wrap shrink-0">
        <Filter size={12} className="text-muted-foreground" />
        {['all', ...AGENTS.map(a => a.id)].map(f => (
          <Button key={f} variant={filter === f ? 'default' : 'ghost'} size="sm"
            onClick={() => setFilter(f)} className="h-7 text-xs px-2.5">
            {f === 'all' ? 'All' : (AGENTS.find(a => a.id === f)?.alias || f)}
          </Button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto space-y-1">
        {entries.map(e => (
          <div key={e.id} className="flex items-start gap-3 px-3 py-2.5 rounded-md hover:bg-secondary/50 transition-colors group">
            <div className={cn('w-1.5 h-1.5 rounded-full mt-1.5 shrink-0', AGENT_COLORS[e.agent] || 'bg-muted-foreground')} />
            <span className="text-xs font-mono text-muted-foreground shrink-0 w-16 mt-0.5">{e.time}</span>
            <span className="text-xs font-bold shrink-0 w-3 mt-0.5 text-muted-foreground">{PFX[e.type]}</span>
            <span className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors flex-1">{e.msg}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
