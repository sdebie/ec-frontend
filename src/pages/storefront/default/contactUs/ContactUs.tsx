import {ChevronDownIcon} from "lucide-react";

const ContactUs = () => {
    return (
        <div className="isolate bg-(--sf-nav-bg) text-(--sf-text) border-(--sf-nav-border) border-2 rounded-2xl p-6">
            <div className="mx-auto max-w-xl px-4 text-center sm:max-w-2xl">
                <h2 className="mx-auto max-w-[14ch] text-3xl font-semibold tracking-tight text-balance sm:max-w-none sm:text-4xl lg:text-5xl">
                    Contact Us
                </h2>

                <p className="mx-auto mt-4 max-w-prose text-base leading-relaxed text-(--sf-muted-text) sm:text-lg">
                    Have questions or want to learn more about our enterprise solutions?
                    <br className="hidden sm:block" />
                    <span className="sm:hidden"> </span>
                    Our sales team is here to help!
                </p>
            </div>

            <form action="#" method="POST" className="mx-auto mt-16 max-w-xl sm:mt-20">
                <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                    <div>
                        <label htmlFor="first-name" className="block text-sm/6 font-semibold text-(--sf-text)">
                            First name
                        </label>
                        <div className="mt-2.5">
                            <input
                                id="first-name"
                                name="first-name"
                                type="text"
                                autoComplete="given-name"
                                className="block w-full rounded-md bg-(--sf-panel) px-3.5 py-2 text-base text-(--sf-text) outline-1 -outline-offset-1 outline-(--sf-border) placeholder:text-(--sf-muted-text) focus:outline-2 focus:-outline-offset-2 focus:outline-(--sf-accent)"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="last-name" className="block text-sm/6 font-semibold text-(--sf-text)">
                            Last name
                        </label>
                        <div className="mt-2.5">
                            <input
                                id="last-name"
                                name="last-name"
                                type="text"
                                autoComplete="family-name"
                                className="block w-full rounded-md bg-(--sf-panel) px-3.5 py-2 text-base text-(--sf-text) outline-1 -outline-offset-1 outline-(--sf-border) placeholder:text-(--sf-muted-text) focus:outline-2 focus:-outline-offset-2 focus:outline-(--sf-accent)"
                            />
                        </div>
                    </div>
                    <div className="sm:col-span-2">
                        <label htmlFor="company" className="block text-sm/6 font-semibold text-(--sf-text)">
                            Company
                        </label>
                        <div className="mt-2.5">
                            <input
                                id="company"
                                name="company"
                                type="text"
                                autoComplete="organization"
                                className="block w-full rounded-md bg-(--sf-panel) px-3.5 py-2 text-base text-(--sf-text) outline-1 -outline-offset-1 outline-(--sf-border) placeholder:text-(--sf-muted-text) focus:outline-2 focus:-outline-offset-2 focus:outline-(--sf-accent)"
                            />
                        </div>
                    </div>
                    <div className="sm:col-span-2">
                        <label htmlFor="email" className="block text-sm/6 font-semibold text-(--sf-text)">
                            Email
                        </label>
                        <div className="mt-2.5">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                className="block w-full rounded-md bg-(--sf-panel) px-3.5 py-2 text-base text-(--sf-text) outline-1 -outline-offset-1 outline-(--sf-border) placeholder:text-(--sf-muted-text) focus:outline-2 focus:-outline-offset-2 focus:outline-(--sf-accent)"
                            />
                        </div>
                    </div>
                    <div className="sm:col-span-2">
                        <label htmlFor="phone-number" className="block text-sm/6 font-semibold text-(--sf-text)">
                            Phone number
                        </label>
                        <div className="mt-2.5">
                            <div className="flex rounded-md bg-(--sf-panel) outline-1 -outline-offset-1 outline-(--sf-border) has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-(--sf-accent)">
                                <div className="grid shrink-0 grid-cols-1 focus-within:relative">
                                    <select
                                        id="country"
                                        name="country"
                                        autoComplete="country"
                                        aria-label="Country"
                                        className="col-start-1 row-start-1 w-full appearance-none rounded-md py-2 pr-7 pl-3.5 text-base text-(--sf-muted-text) placeholder:text-(--sf-muted-text) focus:outline-2 focus:-outline-offset-2 focus:outline-(--sf-accent) sm:text-sm/6 bg-transparent"
                                    >
                                        <option>US</option>
                                        <option>CA</option>
                                        <option>EU</option>
                                    </select>
                                    <ChevronDownIcon
                                        aria-hidden="true"
                                        className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-(--sf-muted-text) sm:size-4"
                                    />
                                </div>
                                <input
                                    id="phone-number"
                                    name="phone-number"
                                    type="text"
                                    placeholder="123-456-7890"
                                    className="block min-w-0 grow bg-transparent py-1.5 pr-3 pl-1 text-base text-(--sf-text) placeholder:text-(--sf-muted-text) focus:outline-none sm:text-sm/6"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="sm:col-span-2">
                        <label htmlFor="message" className="block text-sm/6 font-semibold text-(--sf-text)">
                            Message
                        </label>
                        <div className="mt-2.5">
                            <textarea
                                id="message"
                                name="message"
                                rows={4}
                                className="block w-full rounded-md bg-(--sf-panel) px-3.5 py-2 text-base text-(--sf-text) outline-1 -outline-offset-1 outline-(--sf-border) placeholder:text-(--sf-muted-text) focus:outline-2 focus:-outline-offset-2 focus:outline-(--sf-accent)"
                                defaultValue={''}
                            />
                        </div>
                    </div>
                    <div className="flex gap-x-4 sm:col-span-2">
                        <div className="flex h-6 items-center">
                            <div className="group relative inline-flex w-8 shrink-0 rounded-full bg-(--sf-border) p-px inset-ring inset-ring-(--sf-border) outline-offset-2 outline-(--sf-accent) transition-colors duration-200 ease-in-out has-checked:bg-(--sf-accent) has-focus-visible:outline-2">
                                <span className="size-4 rounded-full bg-(--sf-panel) shadow-xs ring-1 ring-(--sf-border) transition-transform duration-200 ease-in-out group-has-checked:translate-x-3.5"/>
                                <input
                                    id="agree-to-policies"
                                    name="agree-to-policies"
                                    type="checkbox"
                                    aria-label="Agree to policies"
                                    className="absolute inset-0 size-full appearance-none focus:outline-hidden"
                                />
                            </div>
                        </div>
                        <label htmlFor="agree-to-policies" className="text-sm/6 text-(--sf-muted-text)">
                            By selecting this, you agree to our{' '}
                            <a href="#" className="font-semibold whitespace-nowrap text-(--sf-accent)">
                                privacy policy
                            </a>
                            .
                        </label>
                    </div>
                </div>
                <div className="mt-10">
                    <button
                        type="submit"
                        className="block w-full rounded-md bg-(--sf-accent) px-3.5 py-2.5 text-center text-sm font-semibold text-(--sf-accent-text) shadow-xs hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--sf-accent)"
                    >
                        Let's talk
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ContactUs;


