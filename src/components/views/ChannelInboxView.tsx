'use client'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { MessageSquare, Send, Brain, Cpu } from 'lucide-react'

interface InboxMessage {
  id: string; userId: string; channel: 'WhatsApp' | 'Telegram' | 'Discord'
  preview: string; ts: string; unread: boolean
  decision?: string; skill?: string
}
interface ChatMessage {
  id: string; role: 'user' | 'agent' | 'system'; text: string; ts: string
}

const CHANNEL_COLOR: Record<string, string> = {
  WhatsApp: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Telegram: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  Discord:  'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
}

const MOCK_INBOX: InboxMessage[] = [
  { id: 'c1', userId: 'user_881', channel: 'WhatsApp', preview: 'harga berapa kak?',            ts: '21:03', unread: false, decision: 'close_sale',   skill: 'closing_sales'      },
  { id: 'c2', userId: 'user_442', channel: 'Telegram', preview: 'ada masalah dengan akun saya', ts: '21:01', unread: false, decision: 'escalate',      skill: 'escalation_handler' },
  { id: 'c3', userId: 'user_229', channel: 'WhatsApp', preview: 'mau daftar dong',              ts: '20:58', unread: false, decision: 'guide_onboard', skill: 'onboarding_guide'   },
  { id: 'c4', userId: 'user_110', channel: 'Telegram', preview: 'fitur premiumnya apa aja?',    ts: '20:45', unread: true,  decision: 'reply',         skill: undefined            },
  { id: 'c5', userId: 'user_331', channel: 'Discord',  preview: 'kapan restock stok lama?',     ts: '20:30', unread: true,  decision: 'ask_clarify',   skill: undefined            },
]

const MOCK_CHATS: Record<string, ChatMessage[]> = {
  c1: [
    { id: '1', role: 'user',   text: 'harga berapa kak?',                               ts: '21:03:10' },
    { id: '2', role: 'system', text: 'Hermes → close_sale (closing_sales, 312ms)',      ts: '21:03:12' },
    { id: '3', role: 'agent',  text: 'Harga 100rb kak! Mau lanjut order sekarang? 😊', ts: '21:03:12' },
  ],
  c2: [
    { id: '1', role: 'user',   text: 'ada masalah dengan akun saya',                   ts: '21:01:55' },
    { id: '2', role: 'system', text: 'Hermes → escalate (escalation_handler, 438ms)',  ts: '21:01:57' },
    { id: '3', role: 'agent',  text: 'Maaf kak ada kendala, tim kami segera bantu',    ts: '21:01:57' },
  ],
  c3: [
    { id: '1', role: 'user',   text: 'mau daftar dong',                                        ts: '20:58:30' },
    { id: '2', role: 'system', text: 'Hermes → guide_onboard (onboarding_guide, 241ms)',        ts: '20:58:31' },
    { id: '3', role: 'agent',  text: 'Halo kak! Ini langkah daftarnya: 1. Klik link ini...',   ts: '20:58:31' },
  ],
  c4: [{ id: '1', role: 'user', text: 'fitur premiumnya apa aja?', ts: '20:45:00' }],
  c5: [{ id: '1', role: 'user', text: 'kapan restock stok lama?',  ts: '20:30:00' }],
}

export function ChannelInboxView() {
  const [selected, setSelected] = useState<InboxMessage>(MOCK_INBOX[0])
  const [input, setInput]       = useState('')
  const [chats, setChats]       = useState(MOCK_CHATS)

  function sendReply() {
    if (!input.trim()) return
    const newMsg: ChatMessage = {
      id: Date.now().toString(), role: 'agent', text: input.trim(),
      ts: new Date().toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit', second:'2-digit' }),
    }
    setChats(c => ({ ...c, [selected.id]: [...(c[selected.id] ?? []), newMsg] }))
    setInput('')
  }

  const currentChat = chats[selected.id] ?? []

  return (
    <div className="flex h-full overflow-hidden">
      <div className="w-72 shrink-0 border-r border-border flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare size={14} className="text-emerald-400" />
            <span className="text-sm font-semibold">Channel Inbox</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {MOCK_INBOX.filter(m => m.unread).length} unread · {MOCK_INBOX.length} conversations
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {MOCK_INBOX.map(msg => (
            <button key={msg.id} onClick={() => setSelected(msg)}
              className={cn('w-full text-left px-4 py-3 border-b border-border/40 last:border-0 transition-colors',
                selected.id === msg.id ? 'bg-accent' : 'hover:bg-accent/50')}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  {msg.unread && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />}
                  <span className="text-xs font-semibold text-foreground">{msg.userId}</span>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono">{msg.ts}</span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{msg.preview}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn('text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border', CHANNEL_COLOR[msg.channel])}>
                  {msg.channel}
                </span>
                {msg.decision && <span className="text-[9px] text-indigo-400">→ {msg.decision}</span>}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-5 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{selected.userId}</span>
            <span className={cn('text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border', CHANNEL_COLOR[selected.channel])}>
              {selected.channel}
            </span>
          </div>
          {selected.decision && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Last: <span className="text-indigo-400">{selected.decision}</span>
              {selected.skill && <span> · ⚡ {selected.skill}</span>}
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {currentChat.map(msg => (
            <div key={msg.id}>
              {msg.role === 'system' && (
                <div className="flex items-center gap-2 py-1">
                  <div className="flex-1 h-px bg-border" />
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono px-2">
                    <Brain size={9} className="text-indigo-400" />{msg.text}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>
              )}
              {msg.role === 'user' && (
                <div className="flex justify-start">
                  <div className="max-w-xs px-3 py-2 rounded-xl rounded-bl-sm bg-secondary border border-border">
                    <p className="text-sm text-foreground">{msg.text}</p>
                    <p className="text-[10px] text-muted-foreground mt-1 font-mono">{msg.ts}</p>
                  </div>
                </div>
              )}
              {msg.role === 'agent' && (
                <div className="flex justify-end">
                  <div className="max-w-xs px-3 py-2 rounded-xl rounded-br-sm bg-foreground text-background">
                    <div className="flex items-center gap-1 mb-1">
                      <Cpu size={9} className="opacity-60" />
                      <span className="text-[9px] opacity-60 font-mono">OpenClaw</span>
                    </div>
                    <p className="text-sm">{msg.text}</p>
                    <p className="text-[10px] opacity-50 mt-1 font-mono">{msg.ts}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="px-5 py-3 border-t border-border shrink-0">
          <div className="flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendReply() }}
              placeholder={`Reply to ${selected.userId} via ${selected.channel}…`}
              className="flex-1 bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
            <button onClick={sendReply} disabled={!input.trim()}
              className="w-9 h-9 rounded-xl bg-foreground flex items-center justify-center disabled:opacity-40 hover:bg-foreground/90 transition-all">
              <Send size={13} className="text-background" />
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5">Manual reply — bypass Hermes decision</p>
        </div>
      </div>
    </div>
  )
}
