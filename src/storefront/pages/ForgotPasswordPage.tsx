import { useNavigate } from 'react-router-dom'
import { ForgotPasswordForm } from '@/storefront/customer/auth/components/ForgotPasswordForm'

export function ForgotPasswordPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <ForgotPasswordForm onBackToLogin={() => navigate('/account/login')} />
      </div>
    </div>
  )
}
