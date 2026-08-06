import { useNavigate } from 'react-router-dom'
import { ForgotPasswordForm } from '@/storefront/customer/auth/components/ForgotPasswordForm'
import { AuthPageShell } from '@/storefront/customer/auth/components/AuthPageShell'

export function ForgotPasswordPage() {
  const navigate = useNavigate()

  return (
    <AuthPageShell>
      <ForgotPasswordForm onBackToLogin={() => navigate('/account/login')} />
    </AuthPageShell>
  )
}
