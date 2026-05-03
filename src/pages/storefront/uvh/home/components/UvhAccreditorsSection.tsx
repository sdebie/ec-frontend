import {uvhHomeContent} from '@/pages/storefront/uvh/content/uvhContent.ts';

export function UvhAccreditorsSection() {
    const {heading, items} = uvhHomeContent.accreditorsSection;

    return (
        <section
            className="w-full bg-white py-10 sm:py-12"
            aria-labelledby="uvh-accreditors-heading"
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <h2
                    id="uvh-accreditors-heading"
                    className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl"
                >
                    <span className="relative inline-block">
                        {heading}
                        <span
                            className="absolute -bottom-1 left-0 block h-1 w-[1.15em] rounded-full bg-(--sf-accent)"
                            aria-hidden
                        />
                    </span>
                </h2>

                <ul className="mt-10 grid list-none grid-cols-1 gap-10 sm:grid-cols-3 sm:items-center sm:justify-items-center sm:gap-8">
                    {items.map((item) => (
                        <li key={item.id} className="flex justify-center">
                            <img
                                src={item.imageSrc}
                                alt={item.imageAlt}
                                className="max-h-28 w-auto max-w-[min(100%,360px)] object-contain sm:max-h-36"
                                loading="lazy"
                                decoding="async"
                            />
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
