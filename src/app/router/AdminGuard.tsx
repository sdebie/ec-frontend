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
}

export function AdminGuard({ children }: Props) {
  const { token, role, setSession, clearSession } = useAdminAuthStore()
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
        setSession({ token, ...data, userId: data.id })
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

  return <>{children}</>
}

function AdminLoadingIndicator() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <span className="text-sm text-gray-500">Loading…</span>
    </div>
  )
}
