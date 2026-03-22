'use client'
import {
  Command, Radio, BellRing,
  Brain, GitBranch, FlaskConical, Database, Zap,
  MessageSquare, Bot, Clock, GitMerge,
  Coins, Terminal, Settings,
  Globe, Send, ExternalLink,
  Wifi, WifiOff, Power,
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { AGENTS }   from '@/lib/data'
import { cn }       from '@/lib/utils'

const NAV_JOINT = [
  { id: 'command-center', icon: Command,   label: 'Command Center' },
  { id: 'event-stream',   icon: Radio,     label: 'Event Stream'   },
  { id: 'alert-center',   icon: BellRing, label: 'Alert Center'   },
]

const NAV_BRAIN = [
  { id: 'decision-trace', icon: GitBranch,    label: 'Decision Trace'  },
  { id: 'think-sandbox',  icon: FlaskConical, label: 'Think Sandbox'   },
  { id: 'memory',         icon: Database,     label: 'Memory Explorer' },
  { id: 'skills',         icon: Zap,          label: 'Skill Manager'   },
]

const NAV_NERVOUS = [
  { id: 'inbox',    icon: MessageSquare, label: 'Channel Inbox' },
  { id: 'agents',   icon: Bot,           label: 'Agents'        },
  { id: 'cron-jobs',icon: Clock,         label: 'Cron Manager'  },
  { id: 'workflows',icon: GitMerge,      label: 'GitMerges'     },
]

const NAV_SYSTEM = [
  { id: 'token-usage', icon: Coins,    label: 'Token Usage' },
  { id: 'command',     icon: Terminal, label: 'Terminal'    },
  { id: 'settings',    icon: Settings, label: 'Settings'    },
]

const EXTERNAL = [
  { label: 'OpenClaw UI', href: 'http://127.0.0.1:18790', icon: Globe },
  { label: 'Telegram',    href: 'https://t.me',           icon: Send  },
]

interface NavProps { onChatOpen: () => void }

export function Nav({ onChatOpen }: NavProps) {
  const { view, setView, gatewayOk, realMode, setRealMode } = useStore()
  const activeCount = AGENTS.filter(a => a.status === 'online' || a.status === 'busy').length

  function NavItem({ id, icon: Icon, label }: { id: string; icon: React.ElementType; label: string }) {
    return (
      <button onClick={() => setView(id)}
        className={cn(
          'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors relative',
          view === id
            ? 'bg-accent text-accent-foreground font-medium'
            : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
        )}>
        <Icon size={15} className="shrink-0" />
        <span className="flex-1 text-left truncate">{label}</span>
        {view === id && <div className="w-1 h-1 rounded-full bg-primary shrink-0" />}
      </button>
    )
  }

  function Section({ label, children }: { label: string; children: React.ReactNode }) {
    return (
      <div className="mt-4 first:mt-0">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 py-1 block">
          {label}
        </span>
        {children}
      </div>
    )
  }

  return (
    <aside className="w-56 shrink-0 bg-card border-r border-border flex flex-col overflow-hidden">

      {/* Brand */}
      <div className="flex h-14 items-center gap-3 border-b border-border px-4 shrink-0">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground shrink-0">
          <span className="text-xs font-black text-background">N</span>
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold text-foreground tracking-tight">NEVGO HQ</div>
          <div className="text-[10px] text-muted-foreground">Brain + Nervous System</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        <Section label="Joint">
          {NAV_JOINT.map(i => <NavItem key={i.id} {...i} />)}
        </Section>
        <Section label="Brain · Hermes">
          {NAV_BRAIN.map(i => <NavItem key={i.id} {...i} />)}
        </Section>
        <Section label="Nervous · OpenClaw">
          {NAV_NERVOUS.map(i => <NavItem key={i.id} {...i} />)}
        </Section>
        <Section label="System">
          {NAV_SYSTEM.map(i => <NavItem key={i.id} {...i} />)}
        </Section>
        <Section label="External">
          {EXTERNAL.map(({ label, href, icon: Icon }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer"
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors group">
              <Icon size={15} className="shrink-0" />
              <span className="flex-1 truncate">{label}</span>
              <ExternalLink size={10} className="opacity-0 group-hover:opacity-50 shrink-0" />
            </a>
          ))}
        </Section>
      </nav>

      {/* Footer */}
      <div className="border-t border-border shrink-0">
        {/* Sisca chat */}
        <div className="px-3 py-2 border-b border-border">
          <button onClick={onChatOpen}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-foreground/5 hover:bg-foreground/10 border border-border hover:border-foreground/20 transition-all group">
            <span className="text-base shrink-0">🎯</span>
            <div className="flex-1 text-left min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">Chat Sisca</p>
              <p className="text-[10px] text-muted-foreground">Direktur · Online</p>
            </div>
            <MessageSquare size={12} className="text-muted-foreground group-hover:text-foreground shrink-0" />
          </button>
        </div>

        {/* Gateway + Kill Switch */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border">
          {gatewayOk
            ? <Wifi size={12} className="text-emerald-400 shrink-0" />
            : <WifiOff size={12} className="text-muted-foreground shrink-0" />}
          <span className={cn('text-xs flex-1 font-medium', gatewayOk ? 'text-emerald-400' : 'text-muted-foreground')}>
            {gatewayOk ? 'Connected' : 'Offline'}
          </span>
          <button
            onClick={() => setRealMode(!realMode)}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold border transition-all',
              realMode
                ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
            )}>
            <Power size={9} />
            {realMode ? 'LIVE' : 'MOCK'}
          </button>
        </div>

        {/* User */}
        <div className="flex items-center gap-2.5 px-4 py-3">
          <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-foreground">B</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">Bang Nding</p>
            <p className="text-[10px] text-muted-foreground">{activeCount}/{AGENTS.length} active</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
