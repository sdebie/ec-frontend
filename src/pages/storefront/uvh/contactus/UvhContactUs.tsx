import {Mail, MapPin, MessageSquare, Phone} from 'lucide-react'
import {TbDeviceLandlinePhone} from 'react-icons/tb'
import {
    SfCard,
    SfButton,
    SfInput,
    SfTextarea,
    SfAccentDivider,
    SfIconBox,
} from '@/components/storefront'
import {uvhContactContent} from '@/pages/storefront/uvh/content/uvhContent'
import {useUvhContactForm} from './useUvhContactForm'

const UvhContactUs = () => {
  const {
    formData,
    error,
    success,
    isSubmitting,
    canSubmit,
    updateField,
    handleSubmit,
  } = useUvhContactForm({ destinationEmail: uvhContactContent.emails[1] })

  return (
    <div className="min-h-screen bg-(--sf-bg)">
      <div className="border-b border-(--sf-border) bg-gradient-to-b from-(--sf-panel) to-(--sf-surface-muted) px-6 py-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-(--sf-accent)">Contact UVH</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-(--sf-text)">Need product advice, a quote, or wholesale help?</h1>
        <p className="mt-2 text-(--sf-muted-text)">
          Call, WhatsApp, or email us and we&apos;ll get back to you quickly.
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-2">
          <SfCard elevation="sm" className="order-2 h-full p-8 lg:order-1">
            <h2 className="mb-4 text-lg font-bold text-(--sf-text)">
              Contact Details
              <SfAccentDivider className="mt-2 mb-5 w-15" />
            </h2>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <SfIconBox>
                  <Phone size={20} />
                </SfIconBox>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-(--sf-muted-text)">Call / WhatsApp</p>
                  {uvhContactContent.phones.map((phone) => (
                    <a
                      key={phone}
                      href={`tel:${phone.replace(/\s+/g, '')}`}
                      className="mt-1 block text-xs font-medium text-(--sf-text) hover:underline"
                    >
                      {phone}
                    </a>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <SfIconBox>
                  <TbDeviceLandlinePhone size={20} />
                </SfIconBox>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-(--sf-muted-text)">Landline</p>
                  <a
                    href={`tel:${uvhContactContent.landline.replace(/\s+/g, '')}`}
                    className="mt-1 block text-xs font-medium text-(--sf-text) hover:underline"
                  >
                    {uvhContactContent.landline}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <SfIconBox>
                  <Mail size={20} />
                </SfIconBox>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-(--sf-muted-text)">Email</p>
                  {uvhContactContent.emails.map((email) => (
                    <a key={email} href={`mailto:${email}`} className="mt-1 block text-xs font-medium text-(--sf-text) hover:underline">
                      {email}
                    </a>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <SfIconBox>
                  <MapPin size={20} />
                </SfIconBox>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-(--sf-muted-text)">Address</p>
                  <p className="mt-1 text-xs font-medium text-(--sf-text)">{uvhContactContent.address}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 h-36 rounded-lg bg-(--sf-bg)">
              <iframe
                title="Location Map"
                src="https://www.google.com/maps?q=-25.8723417,28.1661571&z=15&output=embed"
                className="h-full w-full rounded-lg"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </SfCard>

          <SfCard elevation="sm" className="order-1 h-full p-8 lg:order-2">
            <h2 className="mb-4 text-lg font-bold text-(--sf-text)">
              Send an inquiry
              <SfAccentDivider className="mt-3 mb-6 w-15" />
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <label htmlFor="name" className="mb-2 block text-xs font-semibold text-(--sf-text)">
                    Name
                  </label>
                  <SfInput
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={(event) => updateField('name', event.target.value)}
                    placeholder="Your name"
                    className="px-4 py-2 text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="mb-2 block text-xs font-semibold text-(--sf-text)">
                    Email
                  </label>
                  <SfInput
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(event) => updateField('email', event.target.value)}
                    placeholder="you@company.com"
                    className="px-4 py-2 text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="mb-2 block text-xs font-semibold text-(--sf-text)">
                    Phone
                  </label>
                  <SfInput
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(event) => updateField('phone', event.target.value)}
                    placeholder="+27 76 819 5245"
                    className="px-4 py-2 text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="company" className="mb-2 block text-xs font-semibold text-(--sf-text)">
                    Company
                  </label>
                  <SfInput
                    id="company"
                    name="company"
                    type="text"
                    value={formData.company}
                    onChange={(event) => updateField('company', event.target.value)}
                    placeholder="Company name"
                    className="px-4 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="mb-2 block text-xs font-semibold text-(--sf-text)">
                  Message
                </label>
                <SfTextarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={(event) => updateField('message', event.target.value)}
                  placeholder="Tell us what you need (products, quantities, delivery location, etc.)"
                  className="resize-none px-4 py-2.5 text-sm"
                />
              </div>

              {error && <p className="text-xs text-red-600">{error}</p>}
              {success && <p className="text-xs text-green-700">{success}</p>}

              <p className="text-xs text-(--sf-muted-text)">{uvhContactContent.responseSla}</p>

              <div className="flex justify-end pt-1">
                <SfButton type="submit" disabled={isSubmitting || !canSubmit} className="flex items-center gap-2 px-8 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-60">
                  <MessageSquare size={18} />
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </SfButton>
              </div>
            </form>
          </SfCard>
        </div>
      </div>
    </div>
  )
}

export default UvhContactUs
