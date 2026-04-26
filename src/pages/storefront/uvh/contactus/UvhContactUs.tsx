import {Mail, MapPin, MessageSquare, Phone} from "lucide-react";
import {TbDeviceLandlinePhone} from "react-icons/tb";
import { SfCard, SfButton, SfInput, SfTextarea, SfAccentDivider, SfIconBox } from '@/components/storefront';

const UvhContactUs = () => {
    return (
        <div className="min-h-screen bg-(--sf-bg)">
            {/* Page Header */}
            <div className="text-center py-6 px-6">
                <h1 className="text-4xl font-bold text-(--sf-text)">
                    Contact Us
                </h1>
                <p className="mt-4 text-2xl text-(--sf-muted-text)">
                    Need product advice, a quote, or wholesale help?
                </p>
                <p className="mt-2 text-(--sf-muted-text)">
                    Call, WhatsApp, or email us and we'll get back to you as quickly as possible.
                </p>
            </div>

            {/* 2-Column Card Layout */}
            <div className="max-w-6xl mx-auto px-4 ">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                    {/* Left Card - Contact Details (appears second on mobile, first on desktop) */}
                    <SfCard elevation="sm" className="rounded-lg h-full p-8 order-2 lg:order-1">
                        <h2 className="text-lg font-bold mb-4 text-(--sf-text)">
                            Contact Details
                            {/* Accent Divider */}
                            <SfAccentDivider className="w-15 mt-2 mb-5" />
                        </h2>

                        {/* Contact Sections */}
                        <div className="space-y-6">
                            {/* Call / WhatsApp */}
                            <div>
                                <div className="flex items-start gap-4">
                                    <SfIconBox><Phone size={20} /></SfIconBox>
                                    <div>
                                        <p className="font-semibold text-xs text-(--sf-muted-text)">
                                            Call / WhatsApp
                                        </p>
                                        <a
                                            href="tel:+27768195245"
                                            className="text-xs font-medium mt-1 block hover:underline text-(--sf-text)"
                                        >
                                            +27 76 819 5245
                                        </a>
                                        <a
                                            href="tel:+27714614419"
                                            className="text-xs font-medium mt-1 block hover:underline text-(--sf-text)"
                                        >
                                            +27 71 461 4419
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Landline */}
                            <div>
                                <div className="flex items-start gap-4">
                                    <SfIconBox><TbDeviceLandlinePhone size={20} /></SfIconBox>
                                    <div>
                                        <p className="font-semibold text-xs text-(--sf-muted-text)">
                                            Landline
                                        </p>
                                        <a
                                            href="tel:+27129949184"
                                            className="text-xs font-medium mt-1 block hover:underline text-(--sf-text)"
                                        >
                                            +27 (12) 994-9184
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <div className="flex items-start gap-4">
                                    <SfIconBox><Mail size={20} /></SfIconBox>
                                    <div>
                                        <p className="font-semibold text-xs text-(--sf-muted-text)">
                                            Email
                                        </p>
                                        <a
                                            href="mailto:info@uvhholdings.co.za"
                                            className="text-xs font-medium mt-1 block hover:underline text-(--sf-text)"
                                        >
                                            info@uvhholdings.co.za
                                        </a>
                                        <a
                                            href="mailto:sales@uvhholdings.co.za"
                                            className="text-xs font-medium mt-1 block hover:underline text-(--sf-text)"
                                        >
                                            sales@uvhholdings.co.za
                                        </a>
                                        <a
                                            href="mailto:accounts@uvhholdings.co.za"
                                            className="text-xs font-medium mt-1 block hover:underline text-(--sf-text)"
                                        >
                                            accounts@uvhholdings.co.za
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <div className="flex items-start gap-4">
                                    <SfIconBox><MapPin size={20} /></SfIconBox>
                                    <div>
                                        <p className="font-semibold text-xs text-(--sf-muted-text)">
                                            Address
                                        </p>
                                        <p className="text-xs font-medium mt-1 text-(--sf-text)">
                                            207 Edison Crescent
                                            <br/>
                                            Centurion, Gauteng, 0157, South Africa
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Map/Image Placeholder */}
                        <div className="mt-4 rounded-lg h-30 flex items-center justify-center bg-(--sf-bg)">
                            <iframe
                                title="Location Map"
                                src="https://www.google.com/maps?q=-25.8723417,28.1661571&z=15&output=embed"
                                className="w-full h-full rounded-lg"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>
                    </SfCard>

                    {/* Right Card - Contact Form (appears first on mobile, second on desktop) */}
                    <SfCard elevation="sm" className="rounded-lg h-full p-8 order-1 lg:order-2">
                        <h2 className="text-lg font-bold mb-4 text-(--sf-text)">
                            Contact Us
                            {/* Accent Divider */}
                            <SfAccentDivider className="w-15 mt-3 mb-6" />
                        </h2>
                        <form action="#" method="POST" className="space-y-1">
                            {/* 2-Column Grid for Form Fields (desktop) */}
                            <div className="grid grid-cols-1 sm:grid-cols-1 gap-2">
                                {/* Name */}
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="block text-xs font-semibold mb-2 text-(--sf-text)"
                                    >
                                        Name
                                    </label>
                                    <SfInput
                                        id="name"
                                        name="name"
                                        type="text"
                                        placeholder="Your name"
                                        className="px-4 py-1.5 text-xs"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-xs font-semibold mb-2 text-(--sf-text)"
                                    >
                                        Email
                                    </label>
                                    <SfInput
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="your@email.com"
                                        className="px-4 py-1.5 text-xs"
                                    />
                                </div>

                                {/* Phone */}
                                <div>
                                    <label
                                        htmlFor="phone"
                                        className="block text-xs font-semibold mb-2 text-(--sf-text)"
                                    >
                                        Phone
                                    </label>
                                    <SfInput
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        placeholder="+27 (123) 456-789"
                                        className="px-4 py-1.5 text-xs"
                                    />
                                </div>

                                {/* Company */}
                                <div>
                                    <label
                                        htmlFor="company"
                                        className="block text-xs font-semibold mb-2 text-(--sf-text)"
                                    >
                                        Company
                                    </label>
                                    <SfInput
                                        id="company"
                                        name="company"
                                        type="text"
                                        placeholder="Your company"
                                        className="px-4 py-1.5 text-xs"
                                    />
                                </div>
                            </div>

                            {/* Message Textarea - Full Width */}
                            <div>
                                <label
                                    htmlFor="message"
                                    className="block text-xs font-semibold mb-2 text-(--sf-text)"
                                >
                                    Message
                                </label>
                                <SfTextarea
                                    id="message"
                                    name="message"
                                    rows={5}
                                    placeholder="Your message here..."
                                    className="px-4 py-2.5 resize-none text-xs"
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end pt-1">
                                <SfButton
                                    type="submit"
                                    className="px-8 py-2 text-xs flex items-center gap-2"
                                >
                                    <MessageSquare size={18}/>
                                    Send Message
                                </SfButton>
                            </div>
                        </form>
                    </SfCard>
                </div>
            </div>
        </div>
    );
};

export default UvhContactUs;
