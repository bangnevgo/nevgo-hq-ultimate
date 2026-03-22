'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Zap, Play, Clock, CheckCircle2, AlertCircle } from 'lucide-react'

interface Skill {
  id: string; name: string; description: string
  trigger: string; usedToday: number; successRate: number
  status: 'active' | 'inactive'; lastUsed: string
}

const MOCK_SKILLS: Skill[] = [
  { id: 'sk1', name: 'closing_sales',      description: 'Handle pricing queries dan convert ke pembelian', trigger: 'harga, berapa, beli, mau, promo', usedToday: 14, successRate: 89, status: 'active',   lastUsed: '21:03' },
  { id: 'sk2', name: 'escalation_handler', description: 'Detect masalah dan escalate ke operator',         trigger: 'masalah, error, problem, komplain',  usedToday: 3,  successRate: 100, status: 'active',   lastUsed: '21:01' },
  { id: 'sk3', name: 'onboarding_guide',   description: 'Guide user baru melalui proses registrasi',       trigger: 'daftar, register, baru, mulai',      usedToday: 6,  successRate: 95,  status: 'active',   lastUsed: '20:58' },
  { id: 'sk4', name: 'morning_brief',      description: 'Generate laporan pagi dari semua domain',         trigger: 'cron: 0 7 * * *',                   usedToday: 1,  successRate: 100, status: 'active',   lastUsed: '07:00' },
  { id: 'sk5', name: 'think_endpoint',     description: 'Core reasoning dan decision engine',              trigger: 'semua input via /think',            usedToday: 28, successRate: 96,  status: 'active',   lastUsed: '21:03' },
  { id: 'sk6', name: 'product_recommender',description: 'Rekomendasikan produk berdasarkan history user',  trigger: 'rekomendasi, saran, cocok',         usedToday: 0,  successRate: 0,   status: 'inactive', lastUsed: 'Never' },
]

export function SkillManagerView() {
  const { realMode } = useStore()
  const [selected, setSelected] = useState<Skill>(MOCK_SKILLS[0])
  const [testing, setTesting] = useState(false)
  const [testInput, setTestInput] = useState('')
  const [testResult, setTestResult] = useState<string|null>(null)

  async function testSkill() {
    if (!testInput.trim()) return
    setTesting(true); setTestResult(null)
    await new Promise(r => setTimeout(r, 800))
    setTestResult(`Skill "${selected.name}" triggered dengan confidence 0.87\nDecision: ${selected.name === 'closing_sales' ? 'close_sale' : 'reply'}`)
    setTesting(false)
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* LEFT */}
      <div className="w-72 shrink-0 border-r border-border flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-indigo-400" />
            <span className="text-sm font-semibold">Skill Manager</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{MOCK_SKILLS.filter(s=>s.status==='active').length} active skills</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {MOCK_SKILLS.map(skill => (
            <button key={skill.id} onClick={() => setSelected(skill)}
              className={cn('w-full text-left px-4 py-3 border-b border-border/40 last:border-0 transition-colors',
                selected.id === skill.id ? 'bg-accent' : 'hover:bg-accent/50')}>
              <div className="flex items-center gap-2 mb-1">
                <span className={cn('w-1.5 h-1.5 rounded-full shrink-0',
                  skill.status === 'active' ? 'bg-emerald-400' : 'bg-zinc-600')} />
                <span className="text-xs font-mono font-semibold text-foreground truncate">{skill.name}</span>
              </div>
              <p className="text-[10px] text-muted-foreground truncate">{skill.description}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] text-muted-foreground">{skill.usedToday}x today</span>
                {skill.successRate > 0 && (
                  <span className="text-[10px] text-emerald-400">{skill.successRate}% success</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className={cn('w-2 h-2 rounded-full', selected.status === 'active' ? 'bg-emerald-400' : 'bg-zinc-600')} />
                <h2 className="text-sm font-bold font-mono">{selected.name}</h2>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{selected.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn('text-[10px] font-bold uppercase px-2 py-0.5 rounded border',
                selected.status === 'active'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-zinc-500/10 border-zinc-700 text-zinc-400')}>
                {selected.status}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Used Today',    value: String(selected.usedToday) },
              { label: 'Success Rate',  value: selected.successRate > 0 ? `${selected.successRate}%` : '—' },
              { label: 'Last Used',     value: selected.lastUsed },
            ].map(({ label, value }) => (
              <div key={label} className="bg-secondary rounded-lg border border-border p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
                <p className="text-sm font-bold text-foreground font-mono mt-0.5">{value}</p>
              </div>
            ))}
          </div>

          {/* Trigger */}
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Trigger Keywords</p>
            <div className="flex flex-wrap gap-1.5">
              {selected.trigger.split(',').map(t => (
                <span key={t} className="px-2 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-mono text-indigo-400">
                  {t.trim()}
                </span>
              ))}
            </div>
          </div>

          {/* Test sandbox */}
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Test Skill</p>
            <div className="flex gap-2">
              <input value={testInput} onChange={e => setTestInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') testSkill() }}
                placeholder="Ketik input untuk test skill ini…"
                className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
              <button onClick={testSkill} disabled={testing || !testInput.trim()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-400 hover:bg-indigo-500/20 disabled:opacity-50 transition-all">
                <Play size={11} />{testing ? 'Testing…' : 'Run'}
              </button>
            </div>
            {testResult && (
              <pre className="mt-2 bg-secondary/60 border border-border rounded-lg p-3 text-[11px] font-mono text-muted-foreground whitespace-pre-wrap">
                {testResult}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
