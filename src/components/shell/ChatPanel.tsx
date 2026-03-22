'use client'
import { useState, useRef, useEffect } from 'react'
import { X, Send, ChevronDown, Bot } from 'lucide-react'
import { AGENTS } from '@/lib/data'
import { cn }     from '@/lib/utils'
import { useOpenClaw } from '@/hooks/useOpenClaw'
import { useStore }    from '@/lib/store'

interface Message { id: number; role: 'user'|'agent'; text: string; time: string }
interface ChatPanelProps { open: boolean; onClose: () => void }

const SISCA_ID   = 'aria'
const CHAT_AGENTS = AGENTS.filter(a => !a.model.startsWith('bash'))
function getTime() { return new Date().toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' }) }

export function ChatPanel({ open, onClose }: ChatPanelProps) {
  const { realMode, gatewayOk } = useStore()
  const { command } = useOpenClaw()
  const [activeAgentId, setActiveAgentId] = useState(SISCA_ID)
  const [dropdownOpen,  setDropdownOpen]  = useState(false)
  const [messages,      setMessages]      = useState<Message[]>([])
  const [input,         setInput]         = useState('')
  const [loading,       setLoading]       = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)
  const activeAgent = CHAT_AGENTS.find(a => a.id === activeAgentId) ?? CHAT_AGENTS[0]

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages])
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 300) }, [open])
  useEffect(() => {
    setMessages([{ id: Date.now(), role:'agent', time: getTime(),
      text: activeAgentId === SISCA_ID
        ? `Halo Bang Nding 👋 Saya Sisca, direktur operasional NEVGO HQ. Ada yang bisa saya bantu?`
        : `Halo! Saya ${activeAgent.alias} — ${activeAgent.description}. Ada yang perlu dikerjakan?`
    }])
  }, [activeAgentId])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return
    setMessages(prev => [...prev, { id: Date.now(), role:'user', text, time: getTime() }])
    setInput(''); setLoading(true)
    let reply = `Baik, saya terima. Sedang saya koordinasikan dengan tim. Ada hal lain, Bang Nding?`
    if (realMode && gatewayOk) {
      const res = await command(activeAgentId, text)
      if (res) reply = res
    }
    setMessages(prev => [...prev, { id: Date.now()+1, role:'agent', text: reply, time: getTime() }])
    setLoading(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-end p-4 pointer-events-none">
      <div className="pointer-events-auto w-96 h-[520px] rounded-2xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <button onClick={() => setDropdownOpen(d => !d)}
            className="flex items-center gap-2.5 hover:bg-accent/50 rounded-lg px-2 py-1.5 transition-colors">
            <span className="text-lg leading-none">{activeAgent.emoji}</span>
            <div className="text-left">
              <p className="text-xs font-semibold text-foreground">{activeAgent.alias}</p>
              <p className="text-[10px] text-muted-foreground">{activeAgent.status}</p>
            </div>
            <ChevronDown size={12} className={cn('text-muted-foreground transition-transform', dropdownOpen && 'rotate-180')} />
          </button>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
            <X size={14} />
          </button>
        </div>

        {/* Dropdown */}
        {dropdownOpen && (
          <div className="absolute top-16 left-4 right-4 z-50 bg-card border border-border rounded-xl shadow-xl overflow-hidden">
            {CHAT_AGENTS.map(a => (
              <button key={a.id} onClick={() => { setActiveAgentId(a.id); setDropdownOpen(false) }}
                className={cn('w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left',
                  a.id === activeAgentId && 'bg-accent')}>
                <span className="text-base">{a.emoji}</span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground">{a.alias}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{a.description}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {messages.map(msg => (
            <div key={msg.id} className={cn('flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
              {msg.role === 'agent' && (
                <div className="w-6 h-6 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0 mt-0.5">
                  <Bot size={11} className="text-muted-foreground" />
                </div>
              )}
              <div className={cn('max-w-[75%] px-3 py-2 rounded-xl text-sm',
                msg.role === 'user' ? 'bg-foreground text-background rounded-br-sm' : 'bg-secondary border border-border text-foreground rounded-bl-sm')}>
                <p className="leading-relaxed">{msg.text}</p>
                <p className="text-[10px] opacity-40 mt-1 text-right">{msg.time}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0">
                <Bot size={11} className="text-muted-foreground" />
              </div>
              <div className="bg-secondary border border-border rounded-xl rounded-bl-sm px-3 py-2">
                <div className="flex gap-1">
                  {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: `${i*150}ms` }} />)}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-border shrink-0">
          <div className="flex gap-2">
            <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendMessage() }}
              placeholder={`Pesan ke ${activeAgent.alias}…`} disabled={loading}
              className="flex-1 bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
            <button onClick={sendMessage} disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-xl bg-foreground flex items-center justify-center disabled:opacity-40 hover:bg-foreground/90 transition-all shrink-0">
              <Send size={13} className="text-background" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
