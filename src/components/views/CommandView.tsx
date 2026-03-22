'use client'
import { useState } from 'react'
import { Terminal, Send } from 'lucide-react'
import { useStore } from '@/lib/store'
import { AGENTS }   from '@/lib/data'
import { cn }       from '@/lib/utils'
import { useOpenClaw } from '@/hooks/useOpenClaw'

export function CommandView() {
  const { realMode, gatewayOk } = useStore()
  const { command } = useOpenClaw()
  const [agentId, setAgentId] = useState(AGENTS[0].id)
  const [input,   setInput]   = useState('')
  const [log,     setLog]     = useState<{role:'user'|'agent'; text:string; ts:string}[]>([])
  const [loading, setLoading] = useState(false)

  async function send() {
    if (!input.trim() || loading) return
    const text = input.trim(); setInput(''); setLoading(true)
    const ts = new Date().toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit', second:'2-digit' })
    setLog(l => [...l, { role:'user', text, ts }])
    let reply = '(mock) Command received. Connect to gateway for real response.'
    if (realMode && gatewayOk) { reply = await command(agentId, text) ?? '(no response)' }
    setLog(l => [...l, { role:'agent', text: reply, ts: new Date().toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit', second:'2-digit' }) }])
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 py-4 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center">
            <Terminal size={14} className="text-foreground" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight">Command</h1>
            <p className="text-xs text-muted-foreground">Send direct commands to agents</p>
          </div>
        </div>
        <div className="mt-3">
          <select value={agentId} onChange={e => setAgentId(e.target.value)}
            className="bg-secondary border border-border rounded-md px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
            {AGENTS.map(a => <option key={a.id} value={a.id}>{a.alias} — {a.name}</option>)}
          </select>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {log.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">No commands yet</p>
          </div>
        )}
        {log.map((l, i) => (
          <div key={i} className={cn('flex gap-3', l.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={cn('max-w-lg px-4 py-2.5 rounded-lg text-sm', l.role === 'user' ? 'bg-foreground text-background' : 'bg-secondary border border-border text-foreground')}>
              <p className="font-mono">{l.text}</p>
              <p className="text-[10px] opacity-50 mt-1">{l.ts}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="px-6 py-4 border-t border-border shrink-0">
        <div className="flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') send() }}
            placeholder="Type command…" disabled={loading}
            className="flex-1 bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring font-mono" />
          <button onClick={send} disabled={loading || !input.trim()}
            className="px-4 py-2.5 rounded-lg bg-foreground text-background text-sm font-medium disabled:opacity-50 transition-all hover:bg-foreground/90">
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
