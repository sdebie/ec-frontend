import {uvhHomeContent} from '@/tenants/uvh/content/uvhContent.ts';

export function UvhAccreditorsSection() {
    const {heading, items} = uvhHomeContent.accreditorsSection;

    return (
        <section
            className="w-full bg-white py-6 sm:py-8"
            aria-labelledby="uvh-accreditors-heading"
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <h2
                    id="uvh-accreditors-heading"
                    className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl"
                >
                    <span className="relative inline-block">
                        {heading}
                        <span
                            className="absolute -bottom-1 left-0 block h-0.5 w-[1.15em] rounded-full bg-(--sf-accent)"
                            aria-hidden
                        />
                    </span>
                </h2>

                <ul className="mt-6 grid list-none grid-cols-1 gap-6 sm:grid-cols-3 sm:items-center sm:justify-items-center sm:gap-5">
                    {items.map((item) => (
                        <li key={item.id} className="flex justify-center">
                            <img
                                src={item.imageSrc}
                                alt={item.imageAlt}
                                className="max-h-16 w-auto max-w-[min(100%,240px)] object-contain sm:max-h-24"
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
