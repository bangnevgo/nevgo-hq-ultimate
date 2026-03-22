'use client'
import { useStore } from '@/lib/store'
import { cn }       from '@/lib/utils'

export function SettingsView() {
  const { gatewayUrl, setGatewayUrl, realMode, setRealMode } = useStore()
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 py-4 border-b border-border shrink-0">
        <h1 className="text-base font-semibold tracking-tight">Settings</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Configure dashboard connections</p>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        <section>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Gateway URL</label>
          <input value={gatewayUrl} onChange={e => setGatewayUrl(e.target.value)}
            className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
          <p className="text-xs text-muted-foreground mt-1.5">OpenClaw gateway endpoint</p>
        </section>
        <section>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Mode</label>
          <div className="flex items-center gap-3">
            <button onClick={() => setRealMode(false)}
              className={cn('px-4 py-2 rounded-lg text-sm font-medium border transition-all',
                !realMode ? 'bg-foreground text-background border-foreground' : 'bg-secondary border-border text-muted-foreground hover:text-foreground')}>
              Mock
            </button>
            <button onClick={() => setRealMode(true)}
              className={cn('px-4 py-2 rounded-lg text-sm font-medium border transition-all',
                realMode ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-secondary border-border text-muted-foreground hover:text-foreground')}>
              Live
            </button>
          </div>
        </section>
        <section>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Hermes Think Endpoint</label>
          <code className="block bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm font-mono text-muted-foreground">
            {gatewayUrl}/hermes/think
          </code>
          <p className="text-xs text-muted-foreground mt-1.5">Requires OpenClaw relay configured on VPS</p>
        </section>
      </div>
    </div>
  )
}
