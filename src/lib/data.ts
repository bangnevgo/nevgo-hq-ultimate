import type { Agent, LogEntry, Task, Pipeline, Prospect, DomainStatus, KpiSnapshot, BoardTask, CronJob } from './types'

export const AGENTS: Agent[] = [
  { id: 'aria', platform: 'nevgo', name: 'Main Orchestrator', alias: 'ARIA', emoji: '🎯', model: 'claude-sonnet-4-5', status: 'online', color: 'blue', uptime: '18h 42m', lastSeen: '1m ago', sessions: 12, tokens: 14200, description: 'Direktur utama — terima laporan semua manager, eskalasi ke user, morning brief', task: 'Monitoring all domains', level: 'director', domain: 'system', tokensToday: 14200, parentId: null, cronSchedule: null },
  { id: 'tiktok-mgr', platform: 'nevgo', name: 'TikTok Manager', alias: 'TikMgr', emoji: '🎬', model: 'claude-haiku-4-5', status: 'online', color: 'violet', uptime: '18h 42m', lastSeen: '3m ago', sessions: 4, tokens: 3100, description: 'Spawn & monitor TikTok workers, report ke ARIA', task: 'Supervising pipeline', level: 'manager', domain: 'tiktok', tokensToday: 3100, parentId: 'aria', cronSchedule: null },
  { id: 'trend-scout', platform: 'nevgo', name: 'Trend Scout', alias: 'Scout', emoji: '📡', model: 'claude-haiku-4-5', status: 'idle', color: 'violet', uptime: '14h 10m', lastSeen: '6h ago', sessions: 1, tokens: 4800, description: 'Scan TikTok trending topics & hashtag setiap pagi', task: null, level: 'worker', domain: 'tiktok', tokensToday: 4800, parentId: 'tiktok-mgr', cronSchedule: '0 8 * * *' },
  { id: 'content-ideator', platform: 'nevgo', name: 'Content Ideator', alias: 'Ideator', emoji: '💡', model: 'claude-sonnet-4-5', status: 'idle', color: 'violet', uptime: '14h 10m', lastSeen: '5h ago', sessions: 1, tokens: 9200, description: 'Generate ide konten dari hasil trend scout', task: null, level: 'worker', domain: 'tiktok', tokensToday: 9200, parentId: 'tiktok-mgr', cronSchedule: '0 9 * * *' },
  { id: 'scheduler', platform: 'nevgo', name: 'Scheduler', alias: 'Sched', emoji: '📅', model: 'claude-haiku-4-5', status: 'idle', color: 'amber', uptime: '14h 10m', lastSeen: '4h ago', sessions: 1, tokens: 1200, description: 'Jadwalkan konten ke queue berdasarkan optimal posting time', task: null, level: 'worker', domain: 'tiktok', tokensToday: 1200, parentId: 'tiktok-mgr', cronSchedule: '0 10 * * *' },
  { id: 'publisher', platform: 'nevgo', name: 'Publisher', alias: 'Pub', emoji: '🚀', model: 'claude-haiku-4-5', status: 'busy', color: 'amber', uptime: '14h 10m', lastSeen: '28m ago', sessions: 9, tokens: 800, description: 'Post konten ke TikTok sesuai jadwal', task: 'Publishing batch #3', level: 'worker', domain: 'tiktok', tokensToday: 800, parentId: 'tiktok-mgr', cronSchedule: '*/30 * * * *' },
  { id: 'nevgo-mgr', platform: 'nevgo', name: 'Nevgo Manager', alias: 'NevMgr', emoji: '🏫', model: 'claude-haiku-4-5', status: 'online', color: 'teal', uptime: '18h 42m', lastSeen: '5m ago', sessions: 2, tokens: 1800, description: 'Monitor Nevgo Institute platform', task: 'Checking uptime', level: 'manager', domain: 'nevgo', tokensToday: 1800, parentId: 'aria', cronSchedule: null },
  { id: 'imagents-mgr', platform: 'nevgo', name: 'Imagents Manager', alias: 'ImgMgr', emoji: '🤖', model: 'claude-haiku-4-5', status: 'idle', color: 'indigo', uptime: '10h 20m', lastSeen: '45m ago', sessions: 1, tokens: 950, description: 'Monitor Imagents AI platform', task: null, level: 'manager', domain: 'imagents', tokensToday: 950, parentId: 'aria', cronSchedule: null },
]

export const LOGS: LogEntry[] = [
  { id: 1, time: '08:01', agent: 'aria',           type: 'info',    msg: 'Morning brief dikirim ke Telegram' },
  { id: 2, time: '08:05', agent: 'tiktok-mgr',     type: 'success', msg: 'TikTok pipeline dimulai' },
  { id: 3, time: '08:10', agent: 'trend-scout',    type: 'success', msg: '12 trending topics ditemukan' },
  { id: 4, time: '09:02', agent: 'content-ideator',type: 'success', msg: '5 ide konten digenerate' },
  { id: 5, time: '10:15', agent: 'scheduler',      type: 'info',    msg: 'Konten dijadwalkan untuk 14:00' },
  { id: 6, time: '10:30', agent: 'publisher',      type: 'success', msg: 'Batch #1 published (3 konten)' },
  { id: 7, time: '11:00', agent: 'nevgo-mgr',      type: 'warning', msg: 'Latency spike: 1.2s' },
  { id: 8, time: '11:05', agent: 'aria',           type: 'action',  msg: 'Alert dikirim ke user' },
]

export const TASKS: Task[] = [
  { id: 't1', title: 'Generate konten TikTok hari ini', agentId: 'content-ideator', platform: 'nevgo', status: 'done' },
  { id: 't2', title: 'Monitor Nevgo uptime', agentId: 'nevgo-mgr', platform: 'nevgo', status: 'in-progress' },
  { id: 't3', title: 'Publish batch #4', agentId: 'publisher', platform: 'nevgo', status: 'pending' },
]

export const PIPELINES: Pipeline[] = [
  { id: 'p1', name: 'TikTok Content Pipeline', platform: 'nevgo', status: 'active', lastRun: '10m ago', runs: 42 },
  { id: 'p2', name: 'Nevgo Monitor', platform: 'nevgo', status: 'active', lastRun: '5m ago', runs: 288 },
  { id: 'p3', name: 'Imagents Health Check', platform: 'nevgo', status: 'idle', lastRun: '45m ago', runs: 12 },
]

export const PROSPECTS: Prospect[] = [
  { id: 'pr1', issue: 'API rate limit', level: 'high', score: 87, status: 'review' },
  { id: 'pr2', issue: 'Content queue empty', level: 'medium', score: 62, status: 'enriched' },
  { id: 'pr3', issue: 'Scheduler drift', level: 'low', score: null, status: 'pending' },
]

export const DOMAIN_STATUS: DomainStatus[] = [
  { id: 'tiktok', label: 'TikTok Pipeline', health: 'ok', managerId: 'tiktok-mgr', workersTotal: 5, workersActive: 2, uptimePct: 99.2, latencyMs: 340, lastAlert: null, tokensBurned: 19100 },
  { id: 'nevgo', label: 'Nevgo Institute', health: 'warning', managerId: 'nevgo-mgr', workersTotal: 3, workersActive: 1, uptimePct: 97.8, latencyMs: 1200, lastAlert: '11:00', tokensBurned: 1800 },
  { id: 'imagents', label: 'Imagents AI', health: 'ok', managerId: 'imagents-mgr', workersTotal: 2, workersActive: 0, uptimePct: 100, latencyMs: 210, lastAlert: null, tokensBurned: 950 },
]

export const KPI: KpiSnapshot = {
  agentsRunning:    { active: 4, total: 8, idle: 3, crashed: 0 },
  cronSuccessToday: { success: 11, total: 12, lastFailed: 'nevgo-monitor@11:00' },
  tokenVelocity:    { today: '21.8K', change: '+12%', up: true },
  activeAlerts:     { count: 1, lastAt: '11:00' },
}

export const BOARD_TASKS: BoardTask[] = [
  { id: 'bt1', tier: 'urgent', title: 'Fix Nevgo latency spike', agentId: 'nevgo-mgr', domain: 'nevgo', status: 'running', progress: 45, note: 'Investigating DB query' },
  { id: 'bt2', tier: 'semi', title: 'Generate konten batch #4', agentId: 'content-ideator', domain: 'tiktok', status: 'queued', progress: 0, note: null },
  { id: 'bt3', tier: 'routine', title: 'Daily performance report', agentId: 'aria', domain: 'system', status: 'pending', progress: 0, note: null },
  { id: 'bt4', tier: 'urgent', title: 'Publish batch #3', agentId: 'publisher', domain: 'tiktok', status: 'running', progress: 72, note: '3/4 items done' },
]

export const TOKEN_WEEKLY = [
  { day: 'Sen', tokens: 18200 }, { day: 'Sel', tokens: 21400 }, { day: 'Rab', tokens: 19800 },
  { day: 'Kam', tokens: 24100 }, { day: 'Jum', tokens: 22300 }, { day: 'Sab', tokens: 16700 },
  { day: 'Min', tokens: 21800 },
]

export const WEEKLY_REPORT = { berhasil: 68, onProgress: 21, baruMulai: 11 }

export const CRON_JOBS: CronJob[] = [
  { id: 'cj1', agentId: 'trend-scout', domain: 'tiktok', label: 'Trend Scan', schedule: '0 8 * * *', status: 'success', lastRun: '08:00', nextRun: '08:00 besok', duration: '2m 14s', runsToday: 1, successRate: 98 },
  { id: 'cj2', agentId: 'publisher', domain: 'tiktok', label: 'Auto Publish', schedule: '*/30 * * * *', status: 'running', lastRun: '10:30', nextRun: '11:00', duration: null, runsToday: 9, successRate: 100 },
  { id: 'cj3', agentId: 'nevgo-mgr', domain: 'nevgo', label: 'Uptime Check', schedule: '*/5 * * * *', status: 'failed', lastRun: '11:00', nextRun: '11:05', duration: '0m 3s', runsToday: 28, successRate: 96 },
]
