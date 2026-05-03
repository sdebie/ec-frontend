import {Mail, MapPin, MessageSquare, Phone} from "lucide-react";
import {FaWhatsapp} from "react-icons/fa";
import {TbDeviceLandlinePhone} from "react-icons/tb";
import {SfButton, SfIconBox, SfInput, SfTextarea,} from "@/components/storefront";
import {uvhContactContent} from "@/pages/storefront/uvh/content/uvhContent";
import {UvhTitleHero} from '@/pages/storefront/uvh/components/UvhTitleHero.tsx';
import {useUvhContactForm} from "./useUvhContactForm";

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
                <FaWhatsapp
                    className="size-5 shrink-0 text-[#25D366] transition-colors group-hover:text-(--sf-accent-text)"
                    aria-hidden
                />
                WhatsApp
            </a>
            <a className={HERO_QUICK_LINK_CLASS} href={`mailto:${salesEmail}`}>
                <Mail className="size-4 shrink-0 text-white/90 transition-colors group-hover:text-(--sf-accent-text)" aria-hidden />
                Email
            </a>
            <a className={HERO_QUICK_LINK_CLASS} href={telHref}>
                <Phone className="size-4 shrink-0 text-white/90 transition-colors group-hover:text-(--sf-accent-text)" aria-hidden />
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
                afterDescription={<UvhContactHeroQuickLinks />}
                contentWidth="wide"
                description={
                    <>
                        Product advice, quotes, and wholesale support — use a quick action below or the inquiry form.
                        <span className="mt-2 block text-white/85 text-xs">{uvhContactContent.responseSla}</span>
                    </>
                }
                eyebrow="Contact UVH"
                title="We're here to Help"
            />

            <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
                <div className="rounded-2xl border border-(--sf-border) bg-(--sf-panel) p-6 shadow-sm sm:p-8 lg:p-10">
                    <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-2 lg:gap-12">
                        <div className="order-2 lg:order-1">
                            <h2 className="text-xl font-semibold text-(--sf-text)">
                                Contact details
                            </h2>
                            <div
                                className="mt-4 h-0.5 w-12 max-w-18 bg-(--sf-accent)"
                                aria-hidden
                            />

                            <div className="mt-6 space-y-6">
                                <div className="flex items-start gap-4">
                                    <SfIconBox>
                                        <Phone size={20}/>
                                    </SfIconBox>
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
                                    <SfIconBox>
                                        <TbDeviceLandlinePhone size={20}/>
                                    </SfIconBox>
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
                                    <SfIconBox>
                                        <Mail size={20}/>
                                    </SfIconBox>
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
                                    <SfIconBox>
                                        <MapPin size={20}/>
                                    </SfIconBox>
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

                            <div className="mt-6 h-36 rounded-lg border border-(--sf-border) bg-(--sf-bg)">
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
                            className="order-1 border-t border-(--sf-border) pt-10 lg:order-2 lg:border-t-0 lg:border-l lg:pl-12 lg:pt-0">
                            <h2 className="text-xl font-semibold text-(--sf-text)">
                                Send an inquiry
                            </h2>
                            <div
                                className="mt-4 h-0.5 w-12 max-w-18 bg-(--sf-accent)"
                                aria-hidden
                            />

                            <form
                                id="uvh-contact-form"
                                onSubmit={handleSubmit}
                                className="mt-6 scroll-mt-24 space-y-4"
                            >
                                <div className="grid grid-cols-1 gap-2">
                                    <div>
                                        <label
                                            htmlFor="name"
                                            className="mb-2 block text-xs font-semibold text-(--sf-text)"
                                        >
                                            Name
                                        </label>
                                        <SfInput
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
                                            className="mb-2 block text-xs font-semibold text-(--sf-text)"
                                        >
                                            Email
                                        </label>
                                        <SfInput
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
                                            className="mb-2 block text-xs font-semibold text-(--sf-text)"
                                        >
                                            Phone
                                        </label>
                                        <SfInput
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
                                            className="mb-2 block text-xs font-semibold text-(--sf-text)"
                                        >
                                            Company
                                        </label>
                                        <SfInput
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
                                        className="mb-2 block text-xs font-semibold text-(--sf-text)"
                                    >
                                        Message
                                    </label>
                                    <SfTextarea
                                        id="message"
                                        name="message"
                                        rows={5}
                                        value={formData.message}
                                        onChange={(event) =>
                                            updateField("message", event.target.value)
                                        }
                                        placeholder="Tell us what you need (products, quantities, delivery location, etc.)"
                                        className="resize-none px-4 py-2.5 text-sm"
                                    />
                                </div>

                                {error && <p className="text-xs text-red-600">{error}</p>}
                                {success && <p className="text-xs text-green-700">{success}</p>}

                                <p className="text-xs text-(--sf-muted-text)">
                                    {uvhContactContent.responseSla}
                                </p>

                                <div className="flex justify-start pt-2">
                                    <SfButton
                                        type="submit"
                                        disabled={isSubmitting || !canSubmit}
                                        className="flex items-center gap-2 px-8 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <MessageSquare size={18}/>
                                        {isSubmitting ? "Sending..." : "Send message"}
                                    </SfButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default UvhContactUs;
