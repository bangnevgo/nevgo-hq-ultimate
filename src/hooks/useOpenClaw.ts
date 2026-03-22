'use client'
import { useEffect, useRef, useCallback } from 'react'
import { useStore } from '@/lib/store'
import type { Agent, AgentStatus, LiveLogEntry } from '@/lib/types'
import { AGENTS as MOCK_AGENTS } from '@/lib/data'
import nacl from 'tweetnacl'

function makeLogId() { return `${Date.now()}-${Math.random().toString(36).slice(2,7)}` }
function toPreview(_source: string, _event: string, data: unknown): string {
  if (typeof data === 'object' && data !== null) {
    const d = data as Record<string, unknown>
    if (d.message)  return String(d.message).slice(0, 80)
    if (d.decision) return `decision: ${String(d.decision).slice(0, 60)}`
    if (d.text)     return String(d.text).slice(0, 80)
  }
  return `${_source} / ${_event}`
}

interface OCPresenceEntry {
  deviceId: string; roles: string[]; agentId?: string; status?: string
  name?: string; model?: string; uptimeMs?: number; sessionCount?: number
  tokenCount?: number; lastActiveAt?: number; currentTask?: string | null
}
interface OCHealthPayload {
  status: string; agents?: OCPresenceEntry[]
  presence?: Record<string, OCPresenceEntry>; uptimeMs?: number
  nodes?: Array<{ sessions?: OCPresenceEntry[] }>
}
interface OCFrame {
  type: 'req' | 'res' | 'event'; id?: string; event?: string
  method?: string; params?: unknown; ok?: boolean
  payload?: unknown; error?: unknown; seq?: number
}

const b64enc = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes))
const b64dec = (str: string) => Uint8Array.from(atob(str), c => c.charCodeAt(0))
const CLIENT_ID = 'nevgo-hq'; const VERSION = '1.0.0'; const AUTH_TOKEN = ''
let _seq = 0; const nextId = () => `req-${++_seq}`

function loadOrCreateKeypair() {
  const stored = localStorage.getItem('oc_priv')
  if (stored) return nacl.sign.keyPair.fromSecretKey(b64dec(stored))
  const kp = nacl.sign.keyPair()
  localStorage.setItem('oc_priv', b64enc(kp.secretKey))
  localStorage.setItem('oc_pub',  b64enc(kp.publicKey))
  return kp
}

async function deviceIdFromPubkey(pubKey: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', pubKey.buffer as ArrayBuffer)
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function mapStatus(s?: string): AgentStatus {
  if (!s) return 'idle'
  if (s === 'active' || s === 'running')       return 'busy'
  if (s === 'online' || s === 'connected')     return 'online'
  if (s === 'offline' || s === 'disconnected') return 'offline'
  if (s === 'crashed' || s === 'error')        return 'crashed'
  return 'idle'
}
function msToUptime(ms?: number): string {
  if (!ms) return '—'
  const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}
function tsToLastSeen(ts?: number): string {
  if (!ts) return '—'
  const diff = Math.floor((Date.now() - ts) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}
function presenceToAgent(entry: OCPresenceEntry, agentId: string): Agent {
  const mock = MOCK_AGENTS.find(a => a.id === agentId)
  return {
    id: agentId, platform: mock?.platform ?? 'nevgo',
    name: entry.name ?? mock?.name ?? agentId,
    alias: mock?.alias ?? agentId, emoji: mock?.emoji ?? '🤖',
    model: entry.model ?? mock?.model ?? 'unknown',
    status: mapStatus(entry.status), color: mock?.color ?? 'blue',
    uptime: msToUptime(entry.uptimeMs), lastSeen: tsToLastSeen(entry.lastActiveAt),
    sessions: entry.sessionCount ?? mock?.sessions ?? 0,
    tokens: entry.tokenCount ?? mock?.tokens ?? 0,
    description: mock?.description ?? '', task: entry.currentTask ?? null,
    level: mock?.level ?? 'worker', domain: mock?.domain ?? 'system',
    tokensToday: entry.tokenCount ?? mock?.tokensToday ?? 0,
    parentId: mock?.parentId ?? null, cronSchedule: mock?.cronSchedule ?? null,
  }
}

export function useOpenClaw() {
  const { gatewayUrl, setGatewayOk, realMode, setLiveAgents, toast, pushLog } = useStore()
  const wsRef    = useRef<WebSocket | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const wsUrl    = gatewayUrl.replace(/^http/, 'ws') + '/ws'

  const send = useCallback((frame: OCFrame) => {
    if (wsRef.current?.readyState === WebSocket.OPEN)
      wsRef.current.send(JSON.stringify(frame))
  }, [])

  const requestPresence = useCallback(() => {
    send({ type: 'req', id: nextId(), method: 'sessions.list', params: {} })
  }, [send])

  const disconnect = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    if (wsRef.current) { wsRef.current.onclose = null; wsRef.current.close(); wsRef.current = null }
    setGatewayOk(false)
  }, [setGatewayOk])

  const connect = useCallback(() => {
    if (wsRef.current) disconnect()
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen  = () => console.log('[OC] WS open')
    ws.onerror = () => { setGatewayOk(false); toast('Gateway connection error', 'error') }
    ws.onclose = () => { setGatewayOk(false); if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null } }

    ws.onmessage = async (ev) => {
      let frame: OCFrame
      try { frame = JSON.parse(ev.data) } catch { return }

      if (frame.type === 'event' && frame.event === 'connect.challenge') {
        try {
          const nonce    = (frame.payload as { nonce: string }).nonce
          const kp       = loadOrCreateKeypair()
          const deviceId = await deviceIdFromPubkey(kp.publicKey)
          const sig      = nacl.sign.detached(new TextEncoder().encode(nonce), kp.secretKey)
          ws.send(JSON.stringify({
            type: 'req', id: nextId(), method: 'connect',
            params: {
              minProtocol: 3, maxProtocol: 3,
              client: { id: CLIENT_ID, version: VERSION, platform: 'web', mode: 'ui', instanceId: '' },
              role: 'operator', scopes: ['operator.read', 'operator.write'],
              auth: { token: AUTH_TOKEN }, locale: 'id-ID', userAgent: CLIENT_ID + '/' + VERSION,
              device: { id: deviceId, publicKey: b64enc(kp.publicKey), signature: b64enc(sig), signedAt: Date.now(), nonce },
            }
          }))
        } catch(e) { console.error('[OC] Sign error:', e) }
        return
      }

      if (frame.type === 'res' && frame.ok && (frame.payload as {type?:string})?.type === 'hello-ok') {
        setGatewayOk(true); toast('Connected to OpenClaw Gateway', 'success')
        requestPresence(); timerRef.current = setInterval(requestPresence, 15_000)
        return
      }

      if (frame.type === 'res' && frame.ok && frame.payload) processPresence(frame.payload as OCHealthPayload)

      if (frame.type === 'event') {
        if (['presence','health','agent'].includes(frame.event ?? '')) processPresence(frame.payload as OCHealthPayload)
        if (frame.event === 'tick') requestPresence()
        const skipEvents = ['tick','presence','health','agent']
        if (!skipEvents.includes(frame.event ?? '')) {
          const logData = (frame.payload ?? {}) as Record<string, unknown>
          const src = logData.source as string | undefined
          const ev2 = (frame.event ?? 'info') as LiveLogEntry['event']
          const validEvents = ['message','decision','action','error','info']
          const validSources = ['user','hermes','openclaw']
          pushLog({
            id:        makeLogId(),
            timestamp: new Date().toISOString(),
            source:    (validSources.includes(src ?? '') ? src : 'openclaw') as LiveLogEntry['source'],
            event:     (validEvents.includes(ev2) ? ev2 : 'info') as LiveLogEntry['event'],
            data:      logData,
            preview:   toPreview(src ?? 'openclaw', frame.event ?? 'info', logData),
          })
        }
      }
    }
  }, [wsUrl, send, setGatewayOk, setLiveAgents, toast, requestPresence, disconnect, pushLog])

  function processPresence(payload: OCHealthPayload) {
    if (!payload) return
    const entries: Agent[] = []
    if (Array.isArray(payload.nodes))
      payload.nodes.forEach(n => { if (n.sessions) n.sessions.forEach(e => { if (e.agentId) entries.push(presenceToAgent(e, e.agentId!)) }) })
    if (Array.isArray((payload as unknown as OCPresenceEntry[])))
      (payload as unknown as OCPresenceEntry[]).forEach(e => { if (e.agentId) entries.push(presenceToAgent(e, e.agentId!)) })
    if (Array.isArray(payload.agents))
      payload.agents.forEach(e => { if (e.agentId) entries.push(presenceToAgent(e, e.agentId!)) })
    if (payload.presence)
      Object.values(payload.presence).forEach(e => { if (e.agentId) entries.push(presenceToAgent(e, e.agentId!)) })
    if (entries.length > 0) setLiveAgents(entries)
  }

  const command = useCallback(async (agentId: string, msg: string): Promise<string | null> => {
    return new Promise((resolve) => {
      if (wsRef.current?.readyState !== WebSocket.OPEN) { resolve(null); return }
      const id = nextId()
      const timeout = setTimeout(() => resolve(null), 30_000)
      const handler = (ev: MessageEvent) => {
        try {
          const f: OCFrame = JSON.parse(ev.data)
          if (f.type === 'res' && f.id === id) {
            clearTimeout(timeout); wsRef.current?.removeEventListener('message', handler)
            resolve(f.ok ? String(f.payload ?? '') : null)
          }
        } catch { /* noop */ }
      }
      wsRef.current.addEventListener('message', handler)
      send({ type: 'req', id, method: 'chat.send', params: { agentId, message: msg, sessionKey: `nevgo-cmd-${agentId}` } })
    })
  }, [send])

  useEffect(() => {
    if (realMode) connect()
    else          disconnect()
    return () => disconnect()
  }, [realMode]) // eslint-disable-line react-hooks/exhaustive-deps

  return { connect, disconnect, command }
}
