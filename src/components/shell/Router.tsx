'use client'
import { useStore } from '@/lib/store'

import { CommandCenterView }    from '@/components/views/CommandCenterView'
import { LiveLogsView }         from '@/components/views/LiveLogsView'
import { AlertCenterView }      from '@/components/views/AlertCenterView'
import { DecisionTraceView }    from '@/components/views/DecisionTraceView'
import { DecisionInspectorView } from '@/components/views/DecisionInspectorView'
import { MemoryExplorerView }   from '@/components/views/MemoryExplorerView'
import { SkillManagerView }     from '@/components/views/SkillManagerView'
import { ChannelInboxView }     from '@/components/views/ChannelInboxView'
import { AgentsView }           from '@/components/views/AgentsView'
import { CronJobsView }         from '@/components/views/CronJobsView'
import { TokenUsageView }       from '@/components/views/TokenUsageView'
import { CommandView }          from '@/components/views/CommandView'
import { SettingsView }         from '@/components/views/SettingsView'

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
    // JOINT
    case 'command-center': return <CommandCenterView />
    case 'event-stream':   return <LiveLogsView />
    case 'alert-center':   return <AlertCenterView />
    // BRAIN
    case 'decision-trace': return <DecisionTraceView />
    case 'think-sandbox':  return <DecisionInspectorView />
    case 'memory':         return <MemoryExplorerView />
    case 'skills':         return <SkillManagerView />
    // NERVOUS
    case 'inbox':          return <ChannelInboxView />
    case 'agents':         return <AgentsView />
    case 'cron-jobs':      return <CronJobsView />
    case 'workflows':      return <ComingSoon label="Workflows" />
    // SYSTEM
    case 'token-usage':    return <TokenUsageView />
    case 'command':        return <CommandView />
    case 'settings':       return <SettingsView />
    // legacy routes
    case 'overview':       return <CommandCenterView />
    case 'activity':       return <LiveLogsView />
    case 'logs':           return <LiveLogsView />
    case 'inspector':      return <DecisionInspectorView />
    default:               return <CommandCenterView />
  }
}
