import {useMemo, useState, type FormEvent} from 'react'

import {submitUvhInquiry} from './submitUvhInquiry'

export interface ContactFormData {
    name: string
    email: string
    phone: string
    company: string
    message: string
}

const initialFormData: ContactFormData = {
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface UseUvhContactFormOptions {
    destinationEmail: string
}

export function useUvhContactForm({destinationEmail}: UseUvhContactFormOptions) {
    const [formData, setFormData] = useState<ContactFormData>(initialFormData)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

    const canSubmit = useMemo(
        () =>
            formData.name.trim().length > 1 &&
            emailPattern.test(formData.email.trim()) &&
            formData.phone.trim().length > 0 &&
            formData.message.trim().length > 9,
        [formData],
    )

    const updateField = (key: keyof ContactFormData, value: string) => {
        setFormData((previous) => ({...previous, [key]: value}))
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!canSubmit) {
            setError('Please complete all required fields before sending your message.')
            setSuccess(null)
            return
        }

        try {
            setIsSubmitting(true)
            setError(null)
            setSuccess(null)

            await submitUvhInquiry({
                ...formData,
                destinationEmail,
            })

            setSuccess(
                'Your inquiry details were captured. Your mail app should open to send the message.',
            )
            setFormData(initialFormData)
        } catch (submitError) {
            setError(
                submitError instanceof Error
                    ? submitError.message
                    : 'Failed to submit inquiry.',
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return {
        formData,
        error,
        success,
        isSubmitting,
        canSubmit,
        updateField,
        handleSubmit,
    }
}
