'use client'
import { useState }   from 'react'
import { Wifi, WifiOff, ExternalLink, Brain, Cpu } from 'lucide-react'
import { useStore }   from '@/lib/store'
import { AGENTS }     from '@/lib/data'
import { Button }     from '@/components/ui/button'
import { cn }         from '@/lib/utils'

export function Topbar() {
  const { realMode, setRealMode, gatewayUrl, setGatewayUrl, gatewayOk, platform, liveAgents } = useStore()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState(gatewayUrl)
  const agents  = (realMode && liveAgents) ? liveAgents : AGENTS
  const visible = platform === 'all' ? agents : agents.filter(a => a.platform === platform)
  const online  = visible.filter(a => a.status === 'online' || a.status === 'busy').length

  return (
    <header className="h-11 bg-card border-b border-border flex items-center justify-between px-4 shrink-0 select-none">
      {/* Left: traffic lights + brand */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold tracking-[0.12em] text-foreground uppercase">NEVGO HQ</span>
          <span className="text-muted-foreground text-xs">·</span>
          <span className="flex items-center gap-1 text-xs text-indigo-400">
            <Brain size={10} /> Brain
          </span>
          <span className="text-muted-foreground text-xs">+</span>
          <span className="flex items-center gap-1 text-xs text-emerald-400">
            <Cpu size={10} /> Nervous
          </span>
          <span className="text-muted-foreground text-xs">·</span>
          <span className="text-xs font-medium text-muted-foreground">{online}/{visible.length} active</span>
        </div>
      </div>

      {/* Center: gateway */}
      <div className="flex items-center gap-2">
        <button onClick={() => setEditing(!editing)}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono border transition-all bg-input',
            gatewayOk ? 'border-emerald-500/30 text-emerald-500' : 'border-border text-muted-foreground'
          )}>
          {gatewayOk ? <Wifi size={11} /> : <WifiOff size={11} />}
          {editing ? (
            <input autoFocus className="bg-transparent outline-none text-foreground w-48 text-xs"
              value={draft} onChange={e => setDraft(e.target.value)}
              onBlur={() => { setGatewayUrl(draft); setEditing(false) }}
              onKeyDown={e => { if (e.key === 'Enter') { setGatewayUrl(draft); setEditing(false) } }} />
          ) : <span>{gatewayUrl}</span>}
        </button>
        <Button variant="secondary" size="sm" onClick={() => setRealMode(!realMode)}>
          {realMode ? 'Disconnect' : 'Connect'}
        </Button>
        <a href={gatewayUrl} target="_blank" rel="noopener noreferrer"
          className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors">
          <ExternalLink size={12} />
        </a>
      </div>

      {/* Right: mock/live toggle */}
      <div className="flex items-center gap-2">
        <span className={cn('text-xs font-semibold', !realMode ? 'text-foreground' : 'text-muted-foreground')}>Mock</span>
        <button onClick={() => setRealMode(!realMode)}
          className={cn('relative w-9 h-5 rounded-full transition-all border',
            realMode ? 'bg-emerald-500 border-emerald-500/40' : 'bg-secondary border-border')}>
          <span className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200',
            realMode ? 'left-4' : 'left-0.5')} />
        </button>
        <span className={cn('text-xs font-semibold', realMode ? 'text-emerald-500' : 'text-muted-foreground')}>Live</span>
      </div>
    </header>
  )
}
