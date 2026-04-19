import {Mail, MapPin, MessageSquare, Phone} from "lucide-react";
import {TbDeviceLandlinePhone} from "react-icons/tb";

const UvhContactUs = () => {
    return (
        <div className="min-h-screen" style={{backgroundColor: 'var(--sf-bg)'}}>
            {/* Page Header */}
            <div className="text-center py-6 px-6">
                <h1 className="text-4xl font-bold" style={{color: 'var(--sf-text)'}}>
                    Contact Us
                </h1>
                <p className="mt-4 text-2xl" style={{color: 'var(--sf-muted-text)'}}>
                    Need product advice, a quote, or wholesale help?
                </p>
                <p className="mt-2" style={{color: 'var(--sf-muted-text)'}}>
                    Call, WhatsApp, or email us and we’ll get back to you as quickly as possible.
                </p>
            </div>

            {/* 2-Column Card Layout */}
            <div className="max-w-6xl mx-auto px-4 ">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                    {/* Left Card - Contact Details (appears second on mobile, first on desktop) */}
                    <div className="h-full rounded-lg p-8 border order-2 lg:order-1" style={{
                        backgroundColor: 'var(--sf-panel)',
                        borderColor: 'var(--sf-border)'
                    }}>
                        <h2
                            className="text-lg font-bold mb-4"
                            style={{color: 'var(--sf-text)'}}
                        >
                            Contact Details
                            {/* Accent Divider */}
                            <div
                                className="h-1 w-15 mt-2 mb-5 rounded"
                                style={{backgroundColor: 'var(--sf-accent)'}}
                            />
                        </h2>

                        {/* Contact Sections */}
                        <div className="space-y-6">
                            {/* Call / WhatsApp */}
                            <div>
                                <div className="flex items-start gap-4">
                                    <div
                                        className="p-3 rounded-lg"
                                        style={{backgroundColor: 'var(--sf-bg)'}}
                                    >
                                        <Phone
                                            size={20}
                                            style={{color: 'var(--sf-accent)'}}
                                        />
                                    </div>
                                    <div>
                                        <p
                                            className="font-semibold text-xs"
                                            style={{color: 'var(--sf-muted-text)'}}
                                        >
                                            Call / WhatsApp
                                        </p>
                                        <a
                                            href="tel:+27768195245"
                                            className="text-xs font-medium mt-1 block hover:underline"
                                            style={{color: 'var(--sf-text)'}}
                                        >
                                            +27 76 819 5245
                                        </a>
                                        <a
                                            href="tel:+27714614419"
                                            className="text-xs font-medium mt-1 block hover:underline"
                                            style={{color: 'var(--sf-text)'}}
                                        >
                                            +27 71 461 4419
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Landline */}
                            <div>
                                <div className="flex items-start gap-4">
                                    <div
                                        className="p-3 rounded-lg"
                                        style={{backgroundColor: 'var(--sf-bg)'}}
                                    >
                                        <TbDeviceLandlinePhone
                                            size={20}
                                            style={{color: 'var(--sf-accent)'}}
                                        />
                                    </div>
                                    <div>
                                        <p
                                            className="font-semibold text-xs"
                                            style={{color: 'var(--sf-muted-text)'}}
                                        >
                                            Landline
                                        </p>
                                        <a
                                            href="tel:+27129949184"
                                            className="text-xs font-medium mt-1 block hover:underline"
                                            style={{color: 'var(--sf-text)'}}
                                        >
                                            +27 (12) 994-9184
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <div className="flex items-start gap-4">
                                    <div
                                        className="p-3 rounded-lg"
                                        style={{backgroundColor: 'var(--sf-bg)'}}
                                    >
                                        <Mail
                                            size={20}
                                            style={{color: 'var(--sf-accent)'}}
                                        />
                                    </div>
                                    <div>
                                        <p
                                            className="font-semibold text-xs"
                                            style={{color: 'var(--sf-muted-text)'}}
                                        >
                                            Email
                                        </p>
                                        <a
                                            href="mailto:info@uvhholdings.co.za"
                                            className="text-xs font-medium mt-1 block hover:underline"
                                            style={{color: 'var(--sf-text)'}}
                                        >
                                            info@uvhholdings.co.za
                                        </a>
                                        <a
                                            href="mailto:sales@uvhholdings.co.za"
                                            className="text-xs font-medium mt-1 block hover:underline"
                                            style={{color: 'var(--sf-text)'}}
                                        >
                                            sales@uvhholdings.co.za
                                        </a>
                                        <a
                                            href="mailto:accounts@uvhholdings.co.za"
                                            className="text-xs font-medium mt-1 block hover:underline"
                                            style={{color: 'var(--sf-text)'}}
                                        >
                                            accounts@uvhholdings.co.za
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <div className="flex items-start gap-4">
                                    <div
                                        className="p-3 rounded-lg"
                                        style={{backgroundColor: 'var(--sf-bg)'}}
                                    >
                                        <MapPin
                                            size={20}
                                            style={{color: 'var(--sf-accent)'}}
                                        />
                                    </div>
                                    <div>
                                        <p
                                            className="font-semibold text-xs"
                                            style={{color: 'var(--sf-muted-text)'}}
                                        >
                                            Address
                                        </p>
                                        <p
                                            className="text-xs font-medium mt-1"
                                            style={{color: 'var(--sf-text)'}}
                                        >
                                            207 Edison Crescent
                                            <br/>
                                            Centurion, Gauteng, 0157, South Africa
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Map/Image Placeholder */}
                        <div
                            className="mt-4 rounded-lg h-30 flex items-center justify-center"
                            style={{backgroundColor: 'var(--sf-bg)'}}
                        >
                            <iframe
                                title="Location Map"
                                src="https://www.google.com/maps?q=-25.8723417,28.1661571&z=15&output=embed"
                                className="w-full h-full rounded-lg"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>
                    </div>

                    {/* Right Card - Contact Form (appears first on mobile, second on desktop) */}
                    <div className="h-full rounded-lg p-8 border order-1 lg:order-2"
                         style={{
                             backgroundColor: 'var(--sf-panel)',
                             borderColor: 'var(--sf-border)'
                         }}
                    >
                        <h2
                            className="text-lg font-bold mb-4"
                            style={{color: 'var(--sf-text)'}}
                        >
                            Contact Us
                            {/* Accent Divider */}
                            <div
                                className="h-1 w-15 mt-3 mb-6 rounded"
                                style={{backgroundColor: 'var(--sf-accent)'}}
                            />
                        </h2>
                        <form action="#" method="POST" className="space-y-1">
                            {/* 2-Column Grid for Form Fields (desktop) */}
                            <div className="grid grid-cols-1 sm:grid-cols-1 gap-2">
                                {/* Name */}
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="block text-xs font-semibold mb-2"
                                        style={{color: 'var(--sf-text)'}}
                                    >
                                        Name
                                    </label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        placeholder="Your name"
                                        className="w-full px-4 py-1.5 rounded-lg border focus:outline-none focus:ring-2 text-xs"
                                        style={{
                                            backgroundColor: 'var(--sf-panel)',
                                            borderColor: 'var(--sf-border)',
                                            color: 'var(--sf-text)',
                                            '--tw-ring-color': 'var(--sf-accent)'
                                        } as React.CSSProperties}
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-xs font-semibold mb-2"
                                        style={{color: 'var(--sf-text)'}}
                                    >
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="your@email.com"
                                        className="w-full px-4 py-1.5 rounded-lg border focus:outline-none focus:ring-2 text-xs"
                                        style={{
                                            backgroundColor: 'var(--sf-panel)',
                                            borderColor: 'var(--sf-border)',
                                            color: 'var(--sf-text)',
                                            '--tw-ring-color': 'var(--sf-accent)'
                                        } as React.CSSProperties}
                                    />
                                </div>

                                {/* Phone */}
                                <div>
                                    <label
                                        htmlFor="phone"
                                        className="block text-xs font-semibold mb-2"
                                        style={{color: 'var(--sf-text)'}}
                                    >
                                        Phone
                                    </label>
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        placeholder="+27 (123) 456-789"
                                       className="w-full px-4 py-1.5 rounded-lg border focus:outline-none focus:ring-2 text-xs"
                                        style={{
                                            backgroundColor: 'var(--sf-panel)',
                                            borderColor: 'var(--sf-border)',
                                            color: 'var(--sf-text)',
                                            '--tw-ring-color': 'var(--sf-accent)'
                                        } as React.CSSProperties}
                                    />
                                </div>

                                {/* Company */}
                                <div>
                                    <label
                                        htmlFor="company"
                                        className="block text-xs font-semibold mb-2"
                                        style={{color: 'var(--sf-text)'}}
                                    >
                                        Company
                                    </label>
                                    <input
                                        id="company"
                                        name="company"
                                        type="text"
                                        placeholder="Your company"
                                        className="w-full px-4 py-1.5 rounded-lg border focus:outline-none focus:ring-2 text-xs"
                                        style={{
                                            backgroundColor: 'var(--sf-panel)',
                                            borderColor: 'var(--sf-border)',
                                            color: 'var(--sf-text)',
                                            '--tw-ring-color': 'var(--sf-accent)'
                                        } as React.CSSProperties}
                                    />
                                </div>
                            </div>

                            {/* Message Textarea - Full Width */}
                            <div>
                                <label
                                    htmlFor="message"
                                    className="block text-xs font-semibold mb-2"
                                    style={{color: 'var(--sf-text)'}}
                                >
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows={5}
                                    placeholder="Your message here..."
                                    className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 resize-none text-xs"
                                    style={{
                                        backgroundColor: 'var(--sf-panel)',
                                        borderColor: 'var(--sf-border)',
                                        color: 'var(--sf-text)',
                                        '--tw-ring-color': 'var(--sf-accent)'
                                    } as React.CSSProperties}
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end pt-1">
                                <button
                                    type="submit"
                                    className="px-8 py-2 rounded-lg font-semibold transition-opacity hover:opacity-90 flex items-center gap-2 text-xs"
                                    style={{
                                        backgroundColor: 'var(--sf-accent)',
                                        color: 'var(--sf-accent-text)'
                                    }}
                                >
                                    <MessageSquare size={18}/>
                                    Send Message
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UvhContactUs;
