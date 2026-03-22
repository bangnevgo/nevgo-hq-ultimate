'use client'
import { AGENTS, TOKEN_WEEKLY } from '@/lib/data'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Coins } from 'lucide-react'

const TT_STYLE = {
  contentStyle: { backgroundColor: 'hsl(0 0% 11%)', border: '1px solid hsl(0 0% 20%)', borderRadius: '8px', fontSize: '12px', color: 'hsl(0 0% 48%)' },
}

export function TokenUsageView() {
  const totalToday = AGENTS.reduce((s, a) => s + a.tokensToday, 0)
  const sorted = [...AGENTS].sort((a, b) => b.tokensToday - a.tokensToday)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 py-4 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center">
            <Coins size={14} className="text-foreground" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight">Token Usage</h1>
            <p className="text-xs text-muted-foreground">Total today: {totalToday.toLocaleString()} tokens</p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="rounded-xl border border-border bg-card p-5 surface-card">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Weekly Usage</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={TOKEN_WEEKLY} barSize={24}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(0 0% 48%)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(0 0% 48%)' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip {...TT_STYLE} formatter={(v) => [Number(v).toLocaleString(), 'tokens']} />
              <Bar dataKey="tokens" radius={[4,4,0,0]}>
                {TOKEN_WEEKLY.map((_, i) => <Cell key={i} fill={i === 6 ? 'hsl(0 0% 90%)' : 'hsl(0 0% 22%)'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 surface-card">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Per Agent Today</p>
          <div className="space-y-3">
            {sorted.map(agent => {
              const pct = Math.round((agent.tokensToday / totalToday) * 100)
              return (
                <div key={agent.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-foreground">{agent.emoji} {agent.alias}</span>
                    <span className="text-xs font-mono text-muted-foreground">{agent.tokensToday.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-foreground/60 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
