'use client'
import { Card } from '@/components/ui/card'
import { LogFeed } from '@/components/widgets/LogFeed'

export function ActivityView() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-border shrink-0">
        <h1 className="text-xl font-semibold tracking-tight">Activity</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time agent event log</p>
      </div>
      <div className="flex-1 overflow-hidden p-6">
        <Card className="h-full flex flex-col">
          <div className="flex-1 overflow-hidden p-5">
            <LogFeed />
          </div>
        </Card>
      </div>
    </div>
  )
}
