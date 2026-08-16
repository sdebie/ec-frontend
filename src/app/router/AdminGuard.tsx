import { useEffect, useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'
import { adminHttpClient } from '@/shared/api/http/adminHttpClient'

interface Props {
  children: React.ReactNode
}

interface AdminMeResponse {
  id: string | null
  role: string
  authority: string[]
  userName: string
  email: string
  /** Optional on the wire so an older backend cannot silently unlock the portal. */
  resetPassword?: boolean
}

export function AdminGuard({ children }: Props) {
  const { token, role, mustResetPassword, setSession, clearSession } = useAdminAuthStore()
  const needsRehydration = !!token && !role
  const [rehydrating, setRehydrating] = useState(needsRehydration)
  const [rehydrated, setRehydrated] = useState(false)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (!token || role || fetchedRef.current) return

    fetchedRef.current = true
    adminHttpClient
      .get<AdminMeResponse>('/admin/me')
      .then(({ data }) => {
        // Absent flag ⇒ treat as "must reset". mustResetPassword is deliberately
        // unpersisted, so this response is the only thing that can re-establish the
        // state after a reload; defaulting to false here would let a flagged user
        // bypass the change by reloading the page.
        setSession({
          token,
          ...data,
          userId: data.id,
          mustResetPassword: data.resetPassword ?? true,
        })
        setRehydrated(true)
      })
      .catch(() => {
        clearSession()
      })
      .finally(() => {
        setRehydrating(false)
      })
  }, [token, role, setSession, clearSession])

  if (!token) return <Navigate to="/admin/login" replace />
  if (rehydrating) return <AdminLoadingIndicator />
  if (!role && !rehydrated) return <AdminLoadingIndicator />
  // Checked after rehydration so the flag is authoritative, and before children so a
  // flagged account never renders portal content.
  if (mustResetPassword) return <Navigate to="/admin/reset-password" replace />

  return <>{children}</>
}

function AdminLoadingIndicator() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <span className="text-sm text-(--c-text-muted)">Loading…</span>
    </div>
  )
}
