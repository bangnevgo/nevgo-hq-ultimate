import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NEVGO HQ',
  description: 'Multi-platform Agent Command Center',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
