export type Platform    = 'all' | 'nevgo' | 'imagent'
export type AgentStatus = 'online' | 'busy' | 'idle' | 'offline' | 'crashed'
export type AgentColor  = 'blue' | 'violet' | 'amber' | 'teal' | 'rose' | 'indigo' | 'cyan' | 'green'
export type TaskStatus  = 'pending' | 'in-progress' | 'done'
export type LogType     = 'success' | 'info' | 'warning' | 'error' | 'action'
export type ToastType   = 'success' | 'error' | 'info'

export interface Agent {
  id: string; platform: 'nevgo' | 'imagent'; name: string; alias: string
  emoji: string; model: string; status: AgentStatus; color: AgentColor
  uptime: string; lastSeen: string; sessions: number; tokens: number
  description: string; task: string | null
  level: AgentLevel; domain: AgentDomain; tokensToday: number
  parentId: string | null; cronSchedule: string | null
}

export interface LogEntry  { id: number; time: string; agent: string; type: LogType; msg: string }
export interface Task      { id: string; title: string; agentId: string; platform: 'nevgo' | 'imagent'; status: TaskStatus }
export interface Pipeline  { id: string; name: string; platform: 'nevgo' | 'imagent'; status: 'active' | 'idle' | 'error'; lastRun: string; runs: number }
export interface Prospect  { id: string; issue: string; level: string; score: number | null; status: 'enriched' | 'pending' | 'review' }
export interface ToastItem { id: number; msg: string; type: ToastType }

export type AgentLevel   = 'director' | 'manager' | 'worker'
export type AgentDomain  = 'tiktok' | 'nevgo' | 'imagents' | 'system'
export type TaskTier     = 'urgent' | 'semi' | 'routine'
export type TaskProgress = 'pending' | 'running' | 'done' | 'failed' | 'queued'
export type DomainHealth = 'ok' | 'warning' | 'down'
export type CronStatus   = 'success' | 'running' | 'failed' | 'pending'

export interface DomainStatus {
  id: AgentDomain; label: string; health: DomainHealth; managerId: string
  workersTotal: number; workersActive: number; uptimePct: number | null
  latencyMs: number | null; lastAlert: string | null; tokensBurned: number
}

export interface KpiSnapshot {
  agentsRunning:    { active: number; total: number; idle: number; crashed: number }
  cronSuccessToday: { success: number; total: number; lastFailed: string | null }
  tokenVelocity:    { today: string; change: string; up: boolean }
  activeAlerts:     { count: number; lastAt: string | null }
}

export interface BoardTask {
  id: string; tier: TaskTier; title: string; agentId: string
  domain: AgentDomain; status: TaskProgress; progress: number; note: string | null
}

export interface CronJob {
  id: string; agentId: string; domain: AgentDomain; label: string
  schedule: string; status: CronStatus; lastRun: string; nextRun: string | null
  duration: string | null; runsToday: number; successRate: number
}

export type LiveLogSource = 'user' | 'hermes' | 'openclaw'
export type LiveLogEvent  = 'message' | 'decision' | 'action' | 'error' | 'info'

export interface LiveLogEntry {
  id: string; timestamp: string; source: LiveLogSource
  event: LiveLogEvent; data: Record<string, unknown>; preview: string
}

export interface HermesDecision {
  input: string; decision: string; reason: string[]
  skill_used: string | null; latency_ms?: number
}

export interface HermesMemoryItem {
  id: string; type: 'user' | 'system'; content: string; created_at: string
}

export interface HermesSkill {
  id: string; name: string; description: string; trigger: string; created_at: string
}
