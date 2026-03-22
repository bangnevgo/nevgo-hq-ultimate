'use client'
import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import {
  GitBranch, MessageSquare, Brain, Zap,
  CheckCircle2, AlertCircle, ChevronRight,
  Clock, User, Cpu, RotateCcw,
} from 'lucide-react'

interface TraceStep {
  id: string
  ts: string
  actor: 'user' | 'openclaw' | 'hermes'
  type: 'receive' | 'think' | 'decide' | 'execute' | 'deliver'
  label: string
  detail: string
  meta?: Record<string, string>
  latency?: number
}

interface Trace {
  id: string
  ts: string
  input: string
  channel: string
  decision: string
  skill: string | null
  status: 'complete' | 'failed' | 'pending'
  totalMs: number
  steps: TraceStep[]
}

const MOCK_TRACES: Trace[] = [
  {
    id: 'tr-001', ts: '21:03:12', input: 'harga berapa kak?',
    channel: 'WhatsApp', decision: 'close_sale', skill: 'closing_sales',
    status: 'complete', totalMs: 487,
    steps: [
      { id: 's1', ts: '21:03:12.000', actor: 'user',     type: 'receive',  label: 'Message received',    detail: 'harga berapa kak?', meta: { channel: 'WhatsApp', userId: 'user_881' } },
      { id: 's2', ts: '21:03:12.043', actor: 'openclaw', type: 'think',    label: 'Sent to Hermes',      detail: 'POST /hermes/think', meta: { agentId: 'aria', sessionKey: 'wa-881' } },
      { id: 's3', ts: '21:03:12.355', actor: 'hermes',   type: 'decide',   label: 'Decision made',       detail: 'close_sale — confidence 0.89', meta: { skill: 'closing_sales', memory: 'user pernah tanya harga' }, latency: 312 },
      { id: 's4', ts: '21:03:12.380', actor: 'openclaw', type: 'execute',  label: 'Executing action',    detail: 'send_message via WhatsApp', meta: { action: 'send_message' } },
      { id: 's5', ts: '21:03:12.487', actor: 'openclaw', type: 'deliver',  label: 'Delivered',           detail: 'Harga 100rb kak, mau lanjut?', meta: { status: '200 OK' } },
    ]
  },
  {
    id: 'tr-002', ts: '21:01:55', input: 'ada masalah dengan akun saya',
    channel: 'Telegram', decision: 'escalate', skill: 'escalation_handler',
    status: 'complete', totalMs: 623,
    steps: [
      { id: 's1', ts: '21:01:55.000', actor: 'user',     type: 'receive', label: 'Message received',  detail: 'ada masalah dengan akun saya', meta: { channel: 'Telegram', userId: 'user_442' } },
      { id: 's2', ts: '21:01:55.051', actor: 'openclaw', type: 'think',   label: 'Sent to Hermes',    detail: 'POST /hermes/think' },
      { id: 's3', ts: '21:01:55.489', actor: 'hermes',   type: 'decide',  label: 'Decision made',     detail: 'escalate — confidence 0.43', meta: { skill: 'escalation_handler', reason: 'problem signal detected' }, latency: 438 },
      { id: 's4', ts: '21:01:55.510', actor: 'openclaw', type: 'execute', label: 'Escalating',        detail: 'notify_operator + send_ack' },
      { id: 's5', ts: '21:01:55.623', actor: 'openclaw', type: 'deliver', label: 'Delivered',         detail: 'Kami akan segera bantu kak...' },
    ]
  },
  {
    id: 'tr-003', ts: '20:58:30', input: 'mau daftar dong',
    channel: 'WhatsApp', decision: 'guide_onboard', skill: 'onboarding_guide',
    status: 'complete', totalMs: 341,
    steps: [
      { id: 's1', ts: '20:58:30.000', actor: 'user',     type: 'receive', label: 'Message received', detail: 'mau daftar dong', meta: { channel: 'WhatsApp', userId: 'user_229' } },
      { id: 's2', ts: '20:58:30.038', actor: 'openclaw', type: 'think',   label: 'Sent to Hermes',   detail: 'POST /hermes/think' },
      { id: 's3', ts: '20:58:30.279', actor: 'hermes',   type: 'decide',  label: 'Decision made',    detail: 'guide_onboard — confidence 0.91', meta: { skill: 'onboarding_guide' }, latency: 241 },
      { id: 's4', ts: '20:58:30.301', actor: 'openclaw', type: 'execute', label: 'Executing',        detail: 'send_onboarding_flow' },
      { id: 's5', ts: '20:58:30.341', actor: 'openclaw', type: 'deliver', label: 'Delivered',        detail: 'Halo kak! Ini langkah daftarnya...' },
    ]
  },
]

const ACTOR_CONFIG = {
  user:     { label: 'User',     color: 'text-zinc-300',    bg: 'bg-zinc-800 border-zinc-700',     icon: User    },
  openclaw: { label: 'OpenClaw', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: Cpu     },
  hermes:   { label: 'Hermes',   color: 'text-indigo-400',  bg: 'bg-indigo-500/10 border-indigo-500/20',   icon: Brain   },
}
const DECISION_BADGE: Record<string, string> = {
  close_sale:    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  escalate:      'bg-amber-500/10 text-amber-400 border-amber-500/20',
  guide_onboard: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  reply:         'bg-zinc-500/10 text-zinc-400 border-zinc-700',
}
const STATUS_BADGE: Record<string, string> = {
  complete: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  failed:   'bg-red-500/10 text-red-400 border-red-500/20',
  pending:  'bg-amber-500/10 text-amber-400 border-amber-500/20',
}

export function DecisionTraceView() {
  const { liveLogs } = useStore()
  const [selected, setSelected] = useState<Trace>(MOCK_TRACES[0])
  const [traces, setTraces] = useState<Trace[]>(MOCK_TRACES)

  return (
    <div className="flex h-full overflow-hidden">

      {/* LEFT: trace list */}
      <div className="w-72 shrink-0 border-r border-border flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <GitBranch size={14} className="text-indigo-400" />
            <span className="text-sm font-semibold">Decision Trace</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Full journey per message</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {traces.map(trace => (
            <button key={trace.id} onClick={() => setSelected(trace)}
              className={cn('w-full text-left px-4 py-3 border-b border-border/40 last:border-0 transition-colors',
                selected.id === trace.id ? 'bg-accent' : 'hover:bg-accent/50')}>
              <div className="flex items-center justify-between mb-1">
                <span className={cn('text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border', DECISION_BADGE[trace.decision] ?? 'bg-secondary border-border text-muted-foreground')}>
                  {trace.decision}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">{trace.ts}</span>
              </div>
              <p className="text-xs text-foreground truncate font-mono">"{trace.input}"</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-muted-foreground">{trace.channel}</span>
                <span className="text-[10px] text-muted-foreground">·</span>
                <span className="text-[10px] text-muted-foreground font-mono">{trace.totalMs}ms</span>
                {trace.skill && (
                  <>
                    <span className="text-[10px] text-muted-foreground">·</span>
                    <span className="text-[10px] text-indigo-400">⚡ {trace.skill}</span>
                  </>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT: trace detail */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-5 py-3 border-b border-border shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold font-mono">"{selected.input}"</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn('text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border', STATUS_BADGE[selected.status])}>
                  {selected.status}
                </span>
                <span className={cn('text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border', DECISION_BADGE[selected.decision] ?? 'bg-secondary border-border text-muted-foreground')}>
                  {selected.decision}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">{selected.totalMs}ms total</span>
                <span className="text-[10px] text-muted-foreground">· {selected.channel}</span>
              </div>
            </div>
            <button className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
              <RotateCcw size={13} />
            </button>
          </div>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="relative">
            {/* vertical line */}
            <div className="absolute left-[22px] top-3 bottom-3 w-px bg-border" />

            <div className="space-y-4">
              {selected.steps.map((step, i) => {
                const cfg = ACTOR_CONFIG[step.actor]
                const Icon = cfg.icon
                const isLast = i === selected.steps.length - 1
                return (
                  <div key={step.id} className="flex gap-4 relative">
                    {/* icon */}
                    <div className={cn('w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 z-10', cfg.bg)}>
                      <Icon size={14} className={cfg.color} />
                    </div>

                    {/* content */}
                    <div className="flex-1 min-w-0 pb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn('text-xs font-bold', cfg.color)}>{cfg.label}</span>
                        <span className="text-xs font-semibold text-foreground">{step.label}</span>
                        {step.latency && (
                          <span className="flex items-center gap-1 text-[10px] text-indigo-400 font-mono ml-auto">
                            <Clock size={9} />{step.latency}ms
                          </span>
                        )}
                      </div>
                      <div className="bg-secondary/40 border border-border/60 rounded-lg px-3 py-2">
                        <p className="text-xs font-mono text-foreground/80">{step.detail}</p>
                        {step.meta && (
                          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                            {Object.entries(step.meta).map(([k, v]) => (
                              <div key={k} className="flex items-center gap-1.5">
                                <span className="text-[10px] text-muted-foreground">{k}:</span>
                                <span className="text-[10px] font-mono text-foreground/70 truncate">{v}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground font-mono mt-1">{step.ts}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Final status */}
            <div className={cn('ml-15 mt-2 rounded-lg border px-3 py-2 flex items-center gap-2',
              selected.status === 'complete'
                ? 'bg-emerald-500/5 border-emerald-500/20'
                : 'bg-red-500/5 border-red-500/20')}>
              {selected.status === 'complete'
                ? <CheckCircle2 size={13} className="text-emerald-400" />
                : <AlertCircle  size={13} className="text-red-400" />}
              <span className={cn('text-xs font-semibold', selected.status === 'complete' ? 'text-emerald-400' : 'text-red-400')}>
                {selected.status === 'complete' ? `Journey complete — ${selected.totalMs}ms end-to-end` : 'Journey failed'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
