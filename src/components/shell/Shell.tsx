'use client'
import { useState }    from 'react'
import { Topbar }      from './Topbar'
import { Nav }         from './Nav'
import { Toasts }      from './Toasts'
import { Router }      from './Router'
import { ChatPanel }   from './ChatPanel'
import { useOpenClaw } from '@/hooks/useOpenClaw'

export function Shell() {
  const [chatOpen, setChatOpen] = useState(false)
  useOpenClaw()
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Nav onChatOpen={() => setChatOpen(true)} />
        <div className="flex-1 overflow-hidden">
          <Router />
        </div>
      </div>
      <Toasts />
      <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  )
}
