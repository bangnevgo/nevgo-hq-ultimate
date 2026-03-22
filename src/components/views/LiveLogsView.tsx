'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useStore }       from '@/lib/store'
import { cn }             from '@/lib/utils'
import type { LiveLogEntry, LiveLogSource } from '@/lib/types'
import { Radio, Filter, Trash2, Pause, Play, ChevronDown, ChevronRight } from 'lucide-react'

const MOCK_SOURCES: LiveLogSource[]  = ['user', 'hermes', 'openclaw']
const MOCK_PREVIEWS = {
  user:     ['harga berapa kak?', 'gimana cara daftar?', 'ada promo gak?', 'mau beli dong'],
  hermes:   ['decision: reply', 'decision: escalate', 'decision: close_sale', 'decision: ask_clarify'],
  openclaw: ['send_message executed', 'workflow triggered', 'action: notify_agent', 'cron tick processed'],
}
let mockSeq = 0
function makeMockLog(): LiveLogEntry {
  mockSeq++
  const source  = MOCK_SOURCES[mockSeq % 3]
  const event   = source === 'hermes' ? 'decision' : source === 'user' ? 'message' : 'action'
  const preview = MOCK_PREVIEWS[source][mockSeq % MOCK_PREVIEWS[source].length]
  return {
    id: `mock-${mockSeq}-${Date.now()}`, timestamp: new Date().toISOString(),
    source, event, preview,
    data: source === 'hermes'
      ? { decision: preview.replace('decision: ',''), reason: ['context match'], skill_used: 'closing_sales' }
      : { message: preview },
  }
}

const SOURCE_CONFIG = {
  user:     { label: 'User',     dot: 'bg-zinc-400',    row: '',                       text: 'text-zinc-300'    },
  hermes:   { label: 'Hermes',   dot: 'bg-indigo-400',  row: 'bg-indigo-500/[0.04]',  text: 'text-indigo-300'  },
  openclaw: { label: 'OpenClaw', dot: 'bg-emerald-400', row: 'bg-emerald-500/[0.04]', text: 'text-emerald-300' },
}
const EVENT_BADGE: Record<string, string> = {
  message:  'bg-zinc-800 text-zinc-400 border-zinc-700',
  decision: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  action:   'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  error:    'bg-red-500/10 text-red-400 border-red-500/20',
  info:     'bg-zinc-800 text-zinc-500 border-zinc-700',
}

function LogRow({ entry }: { entry: LiveLogEntry }) {
  const [expanded, setExpanded] = useState(false)
  const cfg = SOURCE_CONFIG[entry.source]
  const ts  = new Date(entry.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const hasData = Object.keys(entry.data).length > 0
  return (
    <div className={cn('border-b border-border/40 last:border-0', cfg.row)}>
      <button onClick={() => hasData && setExpanded(e => !e)}
        className={cn('w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
          hasData ? 'hover:bg-white/[0.03] cursor-pointer' : 'cursor-default')}>
        <span className="w-3 shrink-0 text-muted-foreground">
          {hasData ? (expanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />) : null}
        </span>
        <span className="font-mono text-[11px] text-muted-foreground shrink-0 w-20">{ts}</span>
        <span className="flex items-center gap-1.5 w-24 shrink-0">
          <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', cfg.dot)} />
          <span className={cn('text-xs font-medium', cfg.text)}>{cfg.label}</span>
        </span>
        <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded border uppercase tracking-wider shrink-0 w-20 text-center', EVENT_BADGE[entry.event])}>
          {entry.event}
        </span>
        <span className="flex-1 text-sm text-muted-foreground truncate">{entry.preview}</span>
      </button>
      {expanded && (
        <div className="px-4 pb-3 pt-0 ml-16">
          <pre className="text-[11px] font-mono text-muted-foreground bg-secondary/40 rounded-md p-3 overflow-x-auto border border-border/40 leading-relaxed">
            {JSON.stringify(entry.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

type FilterSource = LiveLogSource | 'all'

export function LiveLogsView() {
  const { liveLogs, pushLog, clearLogs, realMode, gatewayOk } = useStore()
  const [filter, setFilter] = useState<FilterSource>('all')
  const [paused, setPaused] = useState(false)
  const [count,  setCount]  = useState(0)
  const bottomRef  = useRef<HTMLDivElement>(null)
  const pauseRef   = useRef(false)
  pauseRef.current = paused

  useEffect(() => {
    if (realMode) return
    const intervals = [1800, 2400, 3100, 2200, 1500]
    let idx = 0; let timer: ReturnType<typeof setTimeout>
    function tick() {
      if (!pauseRef.current) { pushLog(makeMockLog()); setCount(c => c + 1) }
      idx++; timer = setTimeout(tick, intervals[idx % intervals.length])
    }
    timer = setTimeout(tick, 1200)
    return () => clearTimeout(timer)
  }, [realMode, pushLog])

  useEffect(() => { if (!paused) bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [liveLogs, paused])

  const filtered = filter === 'all' ? liveLogs : liveLogs.filter(e => e.source === filter)
  const FILTERS: { id: FilterSource; label: string }[] = [
    { id: 'all', label: 'All' }, { id: 'user', label: 'User' },
    { id: 'hermes', label: 'Hermes' }, { id: 'openclaw', label: 'OpenClaw' },
  ]

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 py-4 border-b border-border shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Radio size={14} className="text-emerald-400" />
              {(realMode ? gatewayOk : true) && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight">Live Logs</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {realMode ? (gatewayOk ? 'Connected · streaming' : 'Waiting for gateway…') : 'Mock mode · simulated stream'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-mono">{count} events</span>
            <button onClick={() => setPaused(p => !p)}
              className={cn('flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-all',
                paused ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-secondary border-border text-muted-foreground hover:text-foreground')}>
              {paused ? <><Play size={11} /> Resume</> : <><Pause size={11} /> Pause</>}
            </button>
            <button onClick={() => { clearLogs(); setCount(0) }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border border-border text-muted-foreground hover:text-foreground bg-secondary transition-all">
              <Trash2 size={11} /> Clear
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1 mt-3">
          <Filter size={11} className="text-muted-foreground mr-1" />
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={cn('px-2.5 py-1 rounded text-xs font-medium border transition-all',
                filter === f.id ? 'bg-foreground text-background border-foreground' : 'bg-transparent border-border text-muted-foreground hover:text-foreground hover:bg-accent')}>
              {f.label}
              {f.id !== 'all' && <span className="ml-1.5 text-[10px] opacity-60">{liveLogs.filter(e => e.source === f.id).length}</span>}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3 px-4 py-2 border-b border-border/60 shrink-0 bg-secondary/30">
        <span className="w-3 shrink-0" />
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider w-20 shrink-0">Time</span>
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider w-24 shrink-0">Source</span>
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider w-20 shrink-0">Event</span>
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex-1">Preview</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <Radio size={24} className="text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">{realMode ? 'Waiting for events…' : 'Starting stream…'}</p>
          </div>
        ) : (
          [...filtered].reverse().map(entry => <LogRow key={entry.id} entry={entry} />)
        )}
        <div ref={bottomRef} />
      </div>
      {paused && (
        <div className="shrink-0 bg-amber-500/10 border-t border-amber-500/20 px-4 py-2 flex items-center gap-2">
          <Pause size={11} className="text-amber-400" />
          <span className="text-xs text-amber-400 font-medium">Stream paused</span>
        </div>
      )}
    </div>
  )
}
