'use client'
import { useStore } from '@/lib/store'

export function useGateway() {
  const { gatewayUrl, gatewayOk } = useStore()
  return { gatewayUrl, gatewayOk }
}
