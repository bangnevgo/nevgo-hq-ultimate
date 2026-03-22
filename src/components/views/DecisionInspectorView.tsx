'use client'
import { useState, useRef } from 'react'
import { useStore }         from '@/lib/store'
import { cn }               from '@/lib/utils'
import type { HermesDecision } from '@/lib/types'
import { Brain, Send, Loader2, ChevronRight, Clock, Zap, AlertCircle, RotateCcw, CheckCircle2, Hash } from 'lucide-react'

function getMockDecision(input: string): HermesDecision {
  const lower = input.toLowerCase()
  if (lower.includes('harga') || lower.includes('berapa') || lower.includes('price'))
    return { input, decision: 'close_sale', reason: ['Pricing query detected', 'skill closing_sales activated', 'User likely high-intent buyer'], skill_used: 'closing_sales', latency_ms: Math.floor(Math.random()*200)+180 }
  if (lower.includes('masalah') || lower.includes('error') || lower.includes('problem'))
    return { input, decision: 'escalate', reason: ['Problem signal detected', 'Confidence below threshold', 'Escalate to human operator'], skill_used: 'escalation_handler', latency_ms: Math.floor(Math.random()*150)+220 }
  if (lower.includes('daftar') || lower.includes('beli') || lower.includes('register'))
    return { input, decision: 'guide_onboard', reason: ['Purchase intent detected', 'Onboarding flow triggered'], skill_used: 'onboarding_guide', latency_ms: Math.floor(Math.random()*100)+250 }
  return { input, decision: 'reply', reason: ['General query', 'No specific skill triggered', 'Direct reply appropriate'], skill_used: null, latency_ms: Math.floor(Math.random()*200)+150 }
}

const DECISION_STYLE: Record<string, { badge: string; icon: typeof CheckCircle2 }> = {
  reply:         { badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle2 },
  escalate:      { badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',       icon: AlertCircle  },
  guide_onboard: { badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',    icon: ChevronRight },
  close_sale:    { badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: Zap          },
  ask_clarify:   { badge: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',          icon: Hash         },
}
function getDecisionStyle(d: string) {
  return DECISION_STYLE[d] ?? { badge: 'bg-secondary text-muted-foreground border-border', icon: ChevronRight }
}

interface HistoryItem { ts: string; result: HermesDecision }

export function DecisionInspectorView() {
  const { gatewayUrl, realMode, gatewayOk } = useStore()
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState<HermesDecision | null>(null)
  const [error,   setError]   = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const inputRef = useRef<HTMLTextAreaElement>(null)

  async function runThink(text: string) {
    if (!text.trim() || loading) return
    setLoading(true); setError(null); setResult(null)
    const start = Date.now()
    if (!realMode || !gatewayOk) {
      await new Promise(r => setTimeout(r, getMockDecision(text).latency_ms ?? 300))
      const mock = getMockDecision(text)
      setResult(mock); setHistory(h => [{ ts: new Date().toLocaleTimeString('id-ID'), result: mock }, ...h].slice(0, 20))
      setLoading(false); return
    }
    try {
      const base = gatewayUrl.replace(/\/$/, '')
      const res  = await fetch(`${base}/hermes/think`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: text }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
      const data: HermesDecision = await res.json()
      data.latency_ms ??= Date.now() - start
      setResult(data); setHistory(h => [{ ts: new Date().toLocaleTimeString('id-ID'), result: data }, ...h].slice(0, 20))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally { setLoading(false) }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); runThink(input) }
  }

  const dStyle = result ? getDecisionStyle(result.decision) : null

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden border-r border-border">
        <div className="px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Brain size={14} className="text-indigo-400" />
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight">Decision Inspector</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {realMode && gatewayOk ? `POST ${gatewayUrl}/hermes/think` : realMode && !gatewayOk ? 'Gateway offline — mock fallback' : 'Mock mode · simulated Hermes'}
              </p>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-b border-border shrink-0">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Input</label>
          <div className="relative">
            <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
              placeholder="Ketik pesan user, lalu Enter untuk inspect…" rows={3}
              className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring font-mono" />
            <button onClick={() => runThink(input)} disabled={loading || !input.trim()}
              className={cn('absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all border',
                input.trim() && !loading ? 'bg-foreground text-background border-foreground hover:bg-foreground/90' : 'bg-secondary text-muted-foreground border-border cursor-not-allowed')}>
              {loading ? <><Loader2 size={11} className="animate-spin" /> Thinking…</> : <><Send size={11} /> Run</>}
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5">Enter to submit · Shift+Enter for newline</p>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading && (
            <div className="flex items-center gap-3 py-8 justify-center">
              <Loader2 size={16} className="animate-spin text-indigo-400" />
              <span className="text-sm text-muted-foreground">Hermes is thinking…</span>
            </div>
          )}
          {error && !loading && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={13} className="text-red-400 shrink-0" />
                <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Error</span>
              </div>
              <p className="text-sm text-red-300 font-mono">{error}</p>
              <p className="text-xs text-muted-foreground mt-2">Pastikan OpenClaw expose route <code className="bg-secondary px-1 rounded">/hermes/think</code></p>
            </div>
          )}
          {result && !loading && (
            <div className="space-y-4">
              <section>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Input</label>
                <div className="bg-secondary rounded-lg border border-border px-4 py-3 text-sm font-mono text-foreground/80">{result.input}</div>
              </section>
              <section>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Decision</label>
                <div className="flex items-center gap-3">
                  {dStyle && (
                    <span className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-bold uppercase tracking-wider', dStyle.badge)}>
                      <dStyle.icon size={13} />{result.decision}
                    </span>
                  )}
                  {result.latency_ms && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock size={10} />{result.latency_ms}ms
                    </span>
                  )}
                </div>
              </section>
              <section>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Reason</label>
                <ul className="space-y-1.5">
                  {result.reason.map((r, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <span className="w-4 h-4 rounded flex items-center justify-center bg-secondary border border-border shrink-0 mt-0.5">
                        <span className="text-[9px] font-bold">{i + 1}</span>
                      </span>{r}
                    </li>
                  ))}
                </ul>
              </section>
              {result.skill_used && (
                <section>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Skill Used</label>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-xs font-mono text-indigo-400">
                    <Zap size={10} />{result.skill_used}
                  </span>
                </section>
              )}
              <section>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Raw JSON</label>
                <pre className="bg-secondary/60 border border-border/60 rounded-lg p-3 text-[11px] font-mono text-muted-foreground overflow-x-auto leading-relaxed">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </section>
            </div>
          )}
          {!result && !loading && !error && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Brain size={20} className="text-indigo-400/60" />
              </div>
              <p className="text-sm text-muted-foreground">Ketik input di atas untuk inspect decision Hermes</p>
              <div className="flex flex-wrap gap-2 justify-center mt-1">
                {['harga berapa kak?', 'ada masalah nih', 'mau daftar dong'].map(ex => (
                  <button key={ex} onClick={() => { setInput(ex); setTimeout(() => runThink(ex), 0) }}
                    className="px-2.5 py-1 rounded-md bg-secondary border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-all font-mono">
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="w-72 shrink-0 flex flex-col overflow-hidden">
        <div className="px-4 py-4 border-b border-border shrink-0 flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">History</span>
          {history.length > 0 && (
            <button onClick={() => setHistory([])} className="text-muted-foreground hover:text-foreground transition-colors">
              <RotateCcw size={11} />
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {history.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-xs text-muted-foreground">No history yet</p>
            </div>
          ) : history.map((item, i) => {
            const ds = getDecisionStyle(item.result.decision)
            return (
              <button key={i} onClick={() => { setInput(item.result.input); setResult(item.result); setError(null) }}
                className="w-full text-left px-4 py-3 border-b border-border/40 last:border-0 hover:bg-accent/50 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className={cn('text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border', ds.badge)}>{item.result.decision}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">{item.ts}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate font-mono">{item.result.input}</p>
                {item.result.skill_used && <p className="text-[10px] text-indigo-400/70 mt-1 truncate">⚡ {item.result.skill_used}</p>}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
