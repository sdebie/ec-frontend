import { useRef } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useCustomerAuthStore } from '@/shared/auth/customerAuthStore'
import { isRelativePath } from '@/storefront/customer/auth/utils/urlValidation'
import { CustomerLoginForm } from '@/storefront/customer/auth/components/CustomerLoginForm'

export function AccountLoginPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const isSignedIn = useCustomerAuthStore((s) => s.isSignedIn)
  const wasSignedInOnMount = useRef(isSignedIn)

  if (isSignedIn && wasSignedInOnMount.current) {
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
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Don't have an account?{' '}
            <Link
              to="/account/register"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Create one
            </Link>
          </p>
        </div>

        <CustomerLoginForm
          onSuccess={handleSuccess}
          onForgotPassword={handleForgotPassword}
        />
      </div>
    </div>
  )
}
