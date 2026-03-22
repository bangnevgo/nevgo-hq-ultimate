'use client'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export function Toasts() {
  const { toasts } = useStore()
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <div key={t.id} className={cn(
          'px-4 py-2.5 rounded-lg text-sm font-medium shadow-lg border animate-in slide-in-from-right',
          t.type === 'success' && 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
          t.type === 'error'   && 'bg-red-500/10 border-red-500/20 text-red-400',
          t.type === 'info'    && 'bg-secondary border-border text-foreground',
        )}>
          {t.msg}
        </div>
      ))}
    </div>
  )
}
