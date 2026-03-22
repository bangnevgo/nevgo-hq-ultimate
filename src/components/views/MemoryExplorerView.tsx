'use client'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Database, Search, User, Cpu, Clock, Plus } from 'lucide-react'
import type { HermesMemoryItem } from '@/lib/types'

const MOCK_MEMORY: HermesMemoryItem[] = [
  { id: 'm1', type: 'user',   content: 'User 881 pernah tanya harga produk A minggu lalu',      created_at: '2026-03-15 08:22' },
  { id: 'm2', type: 'user',   content: 'User 442 punya masalah akun berulang — escalate priority', created_at: '2026-03-18 14:05' },
  { id: 'm3', type: 'system', content: 'Jam peak WhatsApp: 09:00-11:00 dan 19:00-21:00',         created_at: '2026-03-10 00:00' },
  { id: 'm4', type: 'user',   content: 'User 229 baru daftar — masih onboarding phase',          created_at: '2026-03-20 20:58' },
  { id: 'm5', type: 'system', content: 'Promo aktif: diskon 20% untuk pembelian pertama',        created_at: '2026-03-21 09:00' },
  { id: 'm6', type: 'user',   content: 'User 110 sering tanya soal fitur premium',               created_at: '2026-03-19 16:30' },
  { id: 'm7', type: 'system', content: 'Skill closing_sales paling efektif untuk query harga',   created_at: '2026-03-12 00:00' },
  { id: 'm8', type: 'user',   content: 'User 331 sudah beli 3x — loyal customer',               created_at: '2026-03-17 11:45' },
]

export function MemoryExplorerView() {
  const [search,   setSearch]   = useState('')
  const [filter,   setFilter]   = useState<'all'|'user'|'system'>('all')
  const [selected, setSelected] = useState<HermesMemoryItem | null>(MOCK_MEMORY[0])
  const [adding,   setAdding]   = useState(false)
  const [newContent, setNewContent] = useState('')

  const filtered = MOCK_MEMORY
    .filter(m => filter === 'all' || m.type === filter)
    .filter(m => !search || m.content.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="flex h-full overflow-hidden">
      <div className="w-80 shrink-0 border-r border-border flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <Database size={14} className="text-indigo-400" />
            <span className="text-sm font-semibold">Memory Explorer</span>
          </div>
          <div className="relative mb-2">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search memory…"
              className="w-full bg-secondary border border-border rounded-md pl-7 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
          <div className="flex gap-1">
            {(['all','user','system'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={cn('flex-1 py-1 rounded text-[10px] font-semibold uppercase border transition-all',
                  filter === f ? 'bg-foreground text-background border-foreground' : 'bg-transparent border-border text-muted-foreground hover:text-foreground')}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map(m => (
            <button key={m.id} onClick={() => setSelected(m)}
              className={cn('w-full text-left px-4 py-3 border-b border-border/40 last:border-0 transition-colors',
                selected?.id === m.id ? 'bg-accent' : 'hover:bg-accent/50')}>
              <div className="flex items-center gap-2 mb-1">
                <span className={cn('flex items-center gap-1 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border',
                  m.type === 'user' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-zinc-500/10 border-zinc-700 text-zinc-400')}>
                  {m.type === 'user' ? <User size={8} /> : <Cpu size={8} />}{m.type}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono ml-auto">{m.created_at.split(' ')[0]}</span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{m.content}</p>
            </button>
          ))}
        </div>
        <div className="border-t border-border p-3 shrink-0">
          {adding ? (
            <div className="space-y-2">
              <textarea value={newContent} onChange={e => setNewContent(e.target.value)}
                placeholder="New memory content…" rows={2}
                className="w-full bg-secondary border border-border rounded-md px-2.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none resize-none" />
              <div className="flex gap-2">
                <button onClick={() => setAdding(false)}
                  className="flex-1 py-1.5 rounded-md bg-secondary border border-border text-xs text-muted-foreground hover:text-foreground transition-all">
                  Cancel
                </button>
                <button onClick={() => { setAdding(false); setNewContent('') }}
                  className="flex-1 py-1.5 rounded-md bg-foreground text-background text-xs font-semibold hover:bg-foreground/90 transition-all">
                  Inject
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAdding(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-400 hover:bg-indigo-500/20 transition-all">
              <Plus size={11} /> Inject Memory
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {selected ? (
          <>
            <div className="px-5 py-4 border-b border-border shrink-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={cn('flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded border',
                  selected.type === 'user' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-zinc-500/10 border-zinc-700 text-zinc-400')}>
                  {selected.type === 'user' ? <User size={9} /> : <Cpu size={9} />}{selected.type}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                  <Clock size={10} />{selected.created_at}
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-mono mt-1">{selected.id}</p>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <div className="bg-secondary/40 border border-border rounded-xl p-4">
                <p className="text-sm text-foreground leading-relaxed">{selected.content}</p>
              </div>
              <div className="p-3 rounded-lg border border-indigo-500/20 bg-indigo-500/5">
                <p className="text-xs text-indigo-400 font-semibold mb-1">How Hermes uses this</p>
                <p className="text-xs text-muted-foreground">
                  {selected.type === 'user'
                    ? 'Injected sebagai user context sebelum Hermes membuat decision. Meningkatkan akurasi personalisasi.'
                    : 'Digunakan sebagai system context — berlaku untuk semua user dalam session.'}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">Pilih memory untuk lihat detail</p>
          </div>
        )}
      </div>
    </div>
  )
}
