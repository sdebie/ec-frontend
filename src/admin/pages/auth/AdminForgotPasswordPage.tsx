import {useState} from 'react'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {useNavigate} from 'react-router-dom'
import {useInitiateStaffPasswordReset} from './hooks/useInitiateStaffPasswordReset'
import {useCompleteStaffPasswordReset} from './hooks/useCompleteStaffPasswordReset'
import {RequestCodeStep} from './components/RequestCodeStep'
import {ResetCodeStep} from './components/ResetCodeStep'
import {type CodeFormValues, codeSchema, type RequestFormValues, requestSchema} from './forgotPasswordSchema'

type ResetStep = 'request' | 'code'

function extractErrorMessage(error: unknown): string {
    if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: unknown } }
        if (axiosError.response?.status === 429) {
            return 'Too many attempts — please try again later.'
        }
        const data = axiosError.response?.data
        if (typeof data === 'string' && data) {
            return data
        }
        if (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string') {
            return data.message
        }
    }
    return 'Something went wrong. Please try again.'
}

export function AdminForgotPasswordPage() {
    const navigate = useNavigate()
    // A literal keys each branch below so a transition remounts rather than
    // reconciles — otherwise React reuses the same <input> DOM node across steps,
    // and an uncontrolled input's value survives the switch.
    const [step, setStep] = useState<ResetStep>('request')
    const [email, setEmail] = useState('')

    const {mutate: initiate, isPending: isInitiating} = useInitiateStaffPasswordReset()
    const {
        mutate: complete,
        isPending: isCompleting,
        isError: isCompleteError,
        error: completeError,
    } = useCompleteStaffPasswordReset()

    const requestForm = useForm<RequestFormValues>({resolver: zodResolver(requestSchema)})
    const codeForm = useForm<CodeFormValues>({resolver: zodResolver(codeSchema)})

    function onRequestSubmit(values: RequestFormValues) {
        initiate(
            {email: values.email},
            {
                // Always advances, whatever the response — the account may not exist,
                // may be inactive, or a code may already be live. Branching on the
                // outcome here would let this screen be used to enumerate accounts.
                onSuccess: () => {
                    setEmail(values.email)
                    setStep('code')
                },
            },
        )
    }

    function onCodeSubmit(values: CodeFormValues) {
        complete(
            {
                email,
                code: values.code,
                newPassword: values.newPassword,
                confirmPassword: values.confirmPassword,
            },
            {
                // No auto-sign-in: the staff member proves their new password by using
                // it, same as any other login.
                onSuccess: () => navigate('/admin/login', {replace: true, state: {passwordReset: true}}),
            },
        )
    }

    // data-density is required, not decorative: --c-control-h-* is defined only
    // under [data-density], and the shared Input/Password fields size from it.
    return (
        <div
            data-surface="admin"
            data-density="comfortable"
            className="flex min-h-screen items-center justify-center"
            style={{background: 'var(--c-bg)'}}
        >
            <div
                className="w-full max-w-sm rounded-xl p-8 shadow-lg"
                style={{background: 'var(--c-panel)', border: '1px solid var(--c-border)'}}
            >
                {step === 'request' ? (
                    <RequestCodeStep
                        key="request"
                        register={requestForm.register}
                        errors={requestForm.formState.errors}
                        onSubmit={requestForm.handleSubmit(onRequestSubmit)}
                        isPending={isInitiating}
                    />
                ) : (
                    <ResetCodeStep
                        key="code"
                        register={codeForm.register}
                        errors={codeForm.formState.errors}
                        onSubmit={codeForm.handleSubmit(onCodeSubmit)}
                        isPending={isCompleting}
                        isError={isCompleteError}
                        errorMessage={isCompleteError ? extractErrorMessage(completeError) : undefined}
                    />
                )}
            </div>
        </div>
    )
}
