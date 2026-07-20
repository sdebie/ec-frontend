import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { toast } from '@/shared/ui/components/toast'

import { adminHttpClient } from '@/shared/api/http/adminHttpClient'
import type { BatchStatusResponse } from './types'

const POLL_INTERVAL_MS = 2_000
const MAX_CONSECUTIVE_FAILURES = 5

interface UseBatchStatusPollingOptions {
  endpoint: string
  enabled: boolean
  onStatusChange?: (status: BatchStatusResponse) => void
}

interface UseBatchStatusPollingResult {
  data: BatchStatusResponse | null
  isPolling: boolean
}

export function useBatchStatusPolling({
  endpoint,
  enabled,
  onStatusChange,
}: UseBatchStatusPollingOptions): UseBatchStatusPollingResult {
  const [data, setData] = useState<BatchStatusResponse | null>(null)
  const [stoppedByFailure, setStoppedByFailure] = useState(false)
  const consecutiveFailuresRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onStatusChangeRef = useRef(onStatusChange)

  // Keep callback ref up to date without triggering effect re-runs
  useEffect(() => {
    onStatusChangeRef.current = onStatusChange
  }, [onStatusChange])

  const clearPollingInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // Derive isPolling from enabled and stoppedByFailure — no setState needed
  const isPolling = useMemo(() => enabled && !stoppedByFailure, [enabled, stoppedByFailure])

  useEffect(() => {
    if (!enabled || stoppedByFailure) {
      clearPollingInterval()
      return
    }

    consecutiveFailuresRef.current = 0

    const poll = async () => {
      try {
        const response = await adminHttpClient.get<BatchStatusResponse>(endpoint)
        consecutiveFailuresRef.current = 0
        setData(response.data)
        onStatusChangeRef.current?.(response.data)
      } catch (err) {
        consecutiveFailuresRef.current += 1
        if (consecutiveFailuresRef.current >= MAX_CONSECUTIVE_FAILURES) {
          clearPollingInterval()
          setStoppedByFailure(true)
          console.error(err)
          toast.error('Import progress unavailable — please refresh to retry', { duration: 0 })
        }
      }
    }

    // Fire immediately, then set interval
    poll()
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS)

    return () => {
      clearPollingInterval()
    }
  }, [enabled, endpoint, stoppedByFailure, clearPollingInterval])

  return { data, isPolling }
}
