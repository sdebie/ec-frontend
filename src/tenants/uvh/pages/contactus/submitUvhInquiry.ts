import {registerOrUpdateCustomer} from '@/services/CustomerService'

export interface UvhInquiryPayload {
    name: string
    email: string
    phone: string
    company: string
    message: string
    destinationEmail: string
}

function buildMailtoUrl({
    name,
    email,
    phone,
    company,
    message,
    destinationEmail,
}: UvhInquiryPayload): string {
    const subject = encodeURIComponent(`Website inquiry from ${name.trim()}`)
    const body = encodeURIComponent(
        [
            `Name: ${name.trim()}`,
            `Email: ${email.trim()}`,
            `Phone: ${phone.trim()}`,
            `Company: ${company.trim() || '-'}`,
            '',
            'Message:',
            message.trim(),
        ].join('\n'),
    )

    return `mailto:${destinationEmail}?subject=${subject}&body=${body}`
}

export async function submitUvhInquiry(payload: UvhInquiryPayload): Promise<void> {
    const [firstName, ...restName] = payload.name.trim().split(' ')
    await registerOrUpdateCustomer({
        email: payload.email.trim(),
        firstName: firstName || payload.name.trim(),
        lastName: restName.join(' ').trim() || undefined,
        phone: payload.phone.trim(),
        postalAddressLine2: payload.company.trim() || undefined,
    })

    window.location.href = buildMailtoUrl(payload)
}
