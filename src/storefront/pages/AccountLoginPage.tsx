import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useCustomerAuthStore } from '@/shared/auth/customerAuthStore'
import { isRelativePath } from '@/storefront/customer/auth/utils/urlValidation'
import { CustomerLoginForm } from '@/storefront/customer/auth/components/CustomerLoginForm'
import {
  AUTH_LINK_CLASS,
  AuthHeading,
  AuthPageShell,
} from '@/storefront/customer/auth/components/AuthPageShell'

export function AccountLoginPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const isSignedIn = useCustomerAuthStore((s) => s.isSignedIn)
  const [wasSignedInOnMount] = useState(() => isSignedIn)

  if (isSignedIn && wasSignedInOnMount) {
    return <Navigate to="/account" replace />
  }

  function handleSuccess() {
    const returnTo = searchParams.get('return') ?? '/'
    navigate(isRelativePath(returnTo) ? returnTo : '/', { replace: true })
  }

  function handleForgotPassword() {
    navigate('/account/forgot-password')
  }

  return (
    <AuthPageShell>
      <AuthHeading title="Sign in to your account">
        <p>Don't have an account?</p>
        <Link to="/account/register" className={`mt-1 inline-block ${AUTH_LINK_CLASS}`}>
          Create one
        </Link>
      </AuthHeading>

      <CustomerLoginForm onSuccess={handleSuccess} onForgotPassword={handleForgotPassword} />
    </AuthPageShell>
  )
}
