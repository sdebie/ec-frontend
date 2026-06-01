import {Mail, MapPin, Phone, PhoneCall, Send} from "lucide-react";

const IconWhatsApp = ({className}: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
    </svg>
);


import {Button} from '@/primitives/button';
import {IconBox} from '@/primitives/icon-box';
import {Input} from '@/primitives/input';
import {UvhTitleHero} from '@/tenants/uvh/components/UvhTitleHero.tsx';
import {uvhContactContent} from "@/tenants/uvh/config";

import {useUvhContactForm} from "./useUvhContactForm";

import type {ChangeEvent} from 'react';

const HERO_QUICK_LINK_CLASS =
    'group inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/40 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:border-(--sf-accent) hover:bg-(--sf-accent) hover:text-(--sf-accent-text) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--sf-accent)';

function UvhContactHeroQuickLinks() {
    const primaryMobile = uvhContactContent.phones[0];
    const telHref = `tel:${primaryMobile.replace(/\s+/g, '')}`;
    const waDigits = primaryMobile.replace(/\D/g, '');
    const salesEmail = uvhContactContent.emails[1];

    return (
        <div className="flex max-w-2xl flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
                aria-label="Chat on WhatsApp"
                className={HERO_QUICK_LINK_CLASS}
                href={`https://wa.me/${waDigits}`}
                rel="noopener noreferrer"
                target="_blank"
            >
                <IconWhatsApp className="size-5 shrink-0 text-[#25D366] transition-colors group-hover:text-(--sf-accent-text)"/>
                WhatsApp
            </a>
            <a className={HERO_QUICK_LINK_CLASS} href={`mailto:${salesEmail}`}>
                <Mail className="size-4 shrink-0 text-white/90 transition-colors group-hover:text-(--sf-accent-text)"
                      aria-hidden/>
                Email
            </a>
            <a className={HERO_QUICK_LINK_CLASS} href={telHref}>
                <Phone className="size-4 shrink-0 text-white/90 transition-colors group-hover:text-(--sf-accent-text)"
                       aria-hidden/>
                Call <span className="whitespace-nowrap">{primaryMobile}</span>
            </a>
        </div>
    );
}

const UvhContactUs = () => {
    const {
        formData,
        error,
        success,
        isSubmitting,
        canSubmit,
        updateField,
        handleSubmit,
    } = useUvhContactForm({destinationEmail: uvhContactContent.emails[1]});

    return (
        <main className="min-h-screen w-full bg-(--sf-bg)">
            <UvhTitleHero
                rightSlot={<UvhContactHeroQuickLinks/>}
                afterDescription={<div className="lg:hidden mt-4"><UvhContactHeroQuickLinks/></div>}
                className="py-4 sm:py-5 lg:py-6"
                contentWidth="standard"
                description="Product advice, quotes, and wholesale support — use a quick action below or the inquiry form."
                eyebrow="Contact UVH"
                title="We're here to Help"
            />

            <section className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
                <div className="rounded-2xl border border-(--sf-border) bg-(--sf-panel) p-4 shadow-sm sm:p-5 lg:p-6">
                    <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2 lg:gap-8">
                        <div className="order-2 lg:order-1">
                            <h2 className="text-sm font-semibold text-(--sf-text)">
                                Contact details
                            </h2>
                            <div
                                className="mt-2 h-0.5 w-8 bg-(--sf-accent)"
                                aria-hidden
                            />

                            <div className="mt-3 space-y-3">
                                <div className="flex items-start gap-4">
                                    <IconBox>
                                        <Phone size={20}/>
                                    </IconBox>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-(--sf-muted-text)">
                                            Call / WhatsApp
                                        </p>
                                        {uvhContactContent.phones.map((phone) => (
                                            <a
                                                key={phone}
                                                href={`tel:${phone.replace(/\s+/g, "")}`}
                                                className="mt-1 block text-xs font-medium text-(--sf-text) hover:underline"
                                            >
                                                {phone}
                                            </a>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <IconBox>
                                        <PhoneCall size={20}/>
                                    </IconBox>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-(--sf-muted-text)">
                                            Landline
                                        </p>
                                        <a
                                            href={`tel:${uvhContactContent.landline.replace(/\s+/g, "")}`}
                                            className="mt-1 block text-xs font-medium text-(--sf-text) hover:underline"
                                        >
                                            {uvhContactContent.landline}
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <IconBox>
                                        <Mail size={20}/>
                                    </IconBox>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-(--sf-muted-text)">
                                            Email
                                        </p>
                                        {uvhContactContent.emails.map((email) => (
                                            <a
                                                key={email}
                                                href={`mailto:${email}`}
                                                className="mt-1 block text-xs font-medium text-(--sf-text) hover:underline"
                                            >
                                                {email}
                                            </a>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <IconBox>
                                        <MapPin size={20}/>
                                    </IconBox>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-(--sf-muted-text)">
                                            Address
                                        </p>
                                        <p className="mt-1 text-xs font-medium text-(--sf-text)">
                                            {uvhContactContent.address}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3 h-24 rounded-lg border border-(--sf-border) bg-(--sf-bg)">
                                <iframe
                                    title="Location Map"
                                    src="https://www.google.com/maps?q=-25.8723417,28.1661571&z=15&output=embed"
                                    className="h-full w-full rounded-lg"
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                />
                            </div>
                        </div>

                        <div
                            className="order-1 border-t border-(--sf-border) pt-6 lg:order-2 lg:border-t-0 lg:border-l lg:pl-6 lg:pt-0">
                            <h2 className="text-sm font-semibold text-(--sf-text)">
                                Send an inquiry
                            </h2>
                            <div
                                className="mt-2 h-0.5 w-8 bg-(--sf-accent)"
                                aria-hidden
                            />

                            <form
                                id="uvh-contact-form"
                                onSubmit={handleSubmit}
                                className="mt-3 scroll-mt-24 space-y-2"
                            >
                                <div className="grid grid-cols-1 gap-1.5">
                                    <div>
                                        <label
                                            htmlFor="name"
                                            className="mb-1 block text-xs font-semibold text-(--sf-text)"
                                        >
                                            Name
                                        </label>
                                        <Input
                                            id="name"
                                            name="name"
                                            type="text"
                                            value={formData.name}
                                            onChange={(event) =>
                                                updateField("name", event.target.value)
                                            }
                                            placeholder="Your name"
                                            className="px-4 py-2 text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="email"
                                            className="mb-1 block text-xs font-semibold text-(--sf-text)"
                                        >
                                            Email
                                        </label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(event) =>
                                                updateField("email", event.target.value)
                                            }
                                            placeholder="you@company.com"
                                            className="px-4 py-2 text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="phone"
                                            className="mb-1 block text-xs font-semibold text-(--sf-text)"
                                        >
                                            Phone
                                        </label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(event) =>
                                                updateField("phone", event.target.value)
                                            }
                                            placeholder="+27 76 819 5245"
                                            className="px-4 py-2 text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="company"
                                            className="mb-1 block text-xs font-semibold text-(--sf-text)"
                                        >
                                            Company
                                        </label>
                                        <Input
                                            id="company"
                                            name="company"
                                            type="text"
                                            value={formData.company}
                                            onChange={(event) =>
                                                updateField("company", event.target.value)
                                            }
                                            placeholder="Company name"
                                            className="px-4 py-2 text-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="message"
                                        className="mb-1 block text-xs font-semibold text-(--sf-text)"
                                    >
                                        Message
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        rows={3}
                                        value={formData.message}
                                        onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                                            updateField("message", event.target.value)
                                        }
                                        placeholder="Tell us what you need (products, quantities, delivery location, etc.)"
                                        className="w-full resize-none rounded-(--c-radius) border border-(--c-border) bg-(--c-panel) px-4 py-2.5 text-sm text-(--c-text) placeholder:text-(--c-text-muted) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--c-ring) focus-visible:ring-offset-1 focus-visible:ring-offset-(--c-bg)"
                                    />
                                </div>

                                {error && <p className="text-xs text-red-600">{error}</p>}
                                {success && <p className="text-xs text-green-700">{success}</p>}

                                <p className="text-xs text-(--sf-muted-text)">
                                    {uvhContactContent.responseSla}
                                </p>

                                <Button
                                    type="submit"
                                    fullWidth
                                    size="sm"
                                    disabled={isSubmitting || !canSubmit}
                                    leftIcon={<Send size={14}/>}
                                    className="mt-1 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isSubmitting ? "Sending..." : "Send inquiry"}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default UvhContactUs;
