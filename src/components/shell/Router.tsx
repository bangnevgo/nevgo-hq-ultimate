'use client'
import { useStore } from '@/lib/store'
import { OverviewView }          from '@/components/views/OverviewView'
import { AgentsView }            from '@/components/views/AgentsView'
import { ActivityView }          from '@/components/views/ActivityView'
import { LiveLogsView }          from '@/components/views/LiveLogsView'
import { DecisionInspectorView } from '@/components/views/DecisionInspectorView'
import { CommandView }           from '@/components/views/CommandView'
import { SettingsView }          from '@/components/views/SettingsView'
import { CronJobsView }          from '@/components/views/CronJobsView'
import { TokenUsageView }        from '@/components/views/TokenUsageView'

function ComingSoon({ label }: { label: string }) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center space-y-2">
        <p className="text-2xl font-bold text-foreground/20">{label}</p>
        <p className="text-sm text-muted-foreground">Coming soon</p>
      </div>
    </div>
  )
}

export function Router() {
  const { view } = useStore()
  switch (view) {
    case 'overview':    return <OverviewView />
    case 'agents':      return <AgentsView />
    case 'activity':    return <LiveLogsView />
    case 'logs':        return <LiveLogsView />
    case 'inspector':   return <DecisionInspectorView />
    case 'command':     return <CommandView />
    case 'settings':    return <SettingsView />
    case 'cron-jobs':   return <CronJobsView />
    case 'token-usage': return <TokenUsageView />
    case 'tiktok':      return <ComingSoon label="TikTok Pipeline" />
    case 'nevgo':       return <ComingSoon label="Nevgo Institute" />
    case 'imagents':    return <ComingSoon label="Imagents AI" />
    default:            return <OverviewView />
  }
}
