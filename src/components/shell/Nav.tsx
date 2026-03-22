'use client'
import {
  LayoutDashboard, Bot, Clock, Activity, Coins,
  TrendingUp, School, Cpu, FileText, Terminal,
  Settings, Globe, Send, ExternalLink, Plus,
  Wifi, WifiOff, MessageCircle, ScanSearch,
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { AGENTS }   from '@/lib/data'
import { cn }       from '@/lib/utils'

const NAV_MAIN = [
  { id: 'overview',    icon: LayoutDashboard, label: 'Overview'    },
  { id: 'agents',      icon: Bot,             label: 'Agents'      },
  { id: 'cron-jobs',   icon: Clock,           label: 'Cron Jobs'   },
  { id: 'activity',    icon: Activity,        label: 'Activity'    },
  { id: 'token-usage', icon: Coins,           label: 'Token Usage' },
]

const NAV_DOMAINS = [
  { id: 'tiktok',   icon: TrendingUp, label: 'TikTok Pipeline', health: 'ok'      as const },
  { id: 'nevgo',    icon: School,     label: 'Nevgo Institute',  health: 'warning' as const },
  { id: 'imagents', icon: Cpu,        label: 'Imagents AI',      health: 'ok'      as const },
]

const NAV_SYSTEM = [
  { id: 'logs',      icon: FileText,   label: 'Logs'      },
  { id: 'inspector', icon: ScanSearch, label: 'Inspector' },
  { id: 'command',   icon: Terminal,   label: 'Command'   },
  { id: 'settings',  icon: Settings,   label: 'Settings'  },
]

const EXTERNAL = [
  { label: 'OpenClaw Control', href: 'http://127.0.0.1:18790', icon: Globe },
  { label: 'Telegram',         href: 'https://t.me',           icon: Send  },
]

const HEALTH_DOT = {
  ok:      'bg-emerald-400',
  warning: 'bg-amber-400 animate-blink',
  down:    'bg-red-400 animate-blink',
} as const

interface NavProps { onChatOpen: () => void }

export function Nav({ onChatOpen }: NavProps) {
  const { view, setView, gatewayOk } = useStore()
  const activeCount = AGENTS.filter(a => a.status === 'online' || a.status === 'busy').length

  return (
    <aside className="w-54 shrink-0 bg-card border-r border-border flex flex-col overflow-hidden">
      <div className="flex h-16 items-center gap-3 border-b border-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground shrink-0">
          <span className="text-sm font-black text-background">N</span>
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground tracking-tight">NEVGO HQ</div>
          <div className="text-xs text-muted-foreground">Agent Control Center</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1 block">Main</span>
        {NAV_MAIN.map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setView(id)}
            className={cn('w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors relative',
              view === id ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground')}>
            <Icon size={16} className="shrink-0" />{label}
            {view === id && <div className="absolute right-2 w-1 h-1 rounded-full bg-primary" />}
          </button>
        ))}

        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1 block mt-4">Domains</span>
        {NAV_DOMAINS.map(({ id, icon: Icon, label, health }) => (
          <button key={id} onClick={() => setView(id)}
            className={cn('w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors relative',
              view === id ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground')}>
            <Icon size={16} className="shrink-0" />
            <span className="flex-1 text-left truncate">{label}</span>
            <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', HEALTH_DOT[health])} />
          </button>
        ))}
        <button onClick={() => {}}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs border border-dashed border-border text-muted-foreground hover:bg-accent/50 transition-colors">
          <Plus size={12} />Add domain
        </button>

        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1 block mt-4">System</span>
        {NAV_SYSTEM.map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setView(id)}
            className={cn('w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors relative',
              view === id ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground')}>
            <Icon size={16} className="shrink-0" />{label}
            {view === id && <div className="absolute right-2 w-1 h-1 rounded-full bg-primary" />}
          </button>
        ))}

        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1 block mt-4">External</span>
        {EXTERNAL.map(({ label, href, icon: Icon }) => (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer"
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors group">
            <Icon size={16} className="shrink-0" />
            <span className="flex-1 truncate">{label}</span>
            <ExternalLink size={11} className="opacity-0 group-hover:opacity-50 transition-opacity shrink-0" />
          </a>
        ))}
      </nav>

      <div className="border-t border-border">
        <div className="px-3 py-2.5 border-b border-border">
          <button onClick={onChatOpen}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-foreground/5 hover:bg-foreground/10 border border-border hover:border-foreground/20 transition-all group">
            <span className="text-base leading-none shrink-0">🎯</span>
            <div className="flex-1 text-left min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">Chat dengan Sisca</p>
              <p className="text-[10px] text-muted-foreground truncate">Direktur · Online</p>
            </div>
            <MessageCircle size={13} className="text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
          </button>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border">
          {gatewayOk ? <Wifi size={13} className="text-emerald-400 shrink-0" /> : <WifiOff size={13} className="text-muted-foreground shrink-0" />}
          <span className={cn('text-xs font-medium flex-1', gatewayOk ? 'text-emerald-400' : 'text-muted-foreground')}>
            {gatewayOk ? 'Gateway connected' : 'Gateway offline'}
          </span>
          {gatewayOk && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-blink shrink-0" />}
        </div>
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-foreground">B</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">Bang Nding</p>
            <p className="text-xs text-muted-foreground truncate">Studio Ding</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs font-semibold text-foreground">{activeCount}/{AGENTS.length}</p>
            <p className="text-xs text-muted-foreground">active</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
