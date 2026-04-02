'use client'
import { useEffect, useRef } from 'react'
import { processSyncQueue } from './syncQueue'

export function useOnlineSync() {
  const isSyncing = useRef(false)

  async function runSync() {
    if (isSyncing.current) return
    if (!navigator.onLine) return

    isSyncing.current = true
    try {
      await processSyncQueue()
    } catch (err) {
      console.error('Sync failed:', err)
    } finally {
      isSyncing.current = false
    }
  }

  useEffect(() => {
    // Run sync on mount if online
    runSync()

    // Run sync whenever connection is restored
    window.addEventListener('online', runSync)

    return () => {
      window.removeEventListener('online', runSync)
    }
  }, [])
}
