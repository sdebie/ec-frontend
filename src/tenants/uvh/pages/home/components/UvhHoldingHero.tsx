import {type LucideIcon, MapPin, Package, ShieldCheck, Truck} from 'lucide-react';
import type {UvhHeroStatIcon} from '@/tenants/uvh/config';
import {uvhHomeContent} from '@/tenants/uvh/config';

const STAT_ICONS: Record<UvhHeroStatIcon, LucideIcon> = {
    package: Package,
    truck: Truck,
    mapPin: MapPin,
    shieldCheck: ShieldCheck,
};

/**
 * Hero layout follows the Tailwind UI "full-bleed image + isolated content"
 * pattern:
 *   - `relative isolate overflow-hidden` creates a fresh stacking context.
 *   - The composite image is rendered as `absolute inset-0 -z-10` so all
 *     content stacks on top without z-index gymnastics.
 *   - A left-anchored white scrim keeps the copy readable on smaller screens
 *     where the image's natural white panel doesn't extend far enough left.
 */
export function UvhHoldingHero() {
    const {hero} = uvhHomeContent;

    return (
        <section aria-labelledby="uvh-hero-heading" className="bg-white">
            <div className="relative isolate overflow-hidden">
                {/* Full-bleed composite background */}
                <img
                    src={hero.heroImage}
                    alt={hero.heroImageAlt}
                    width={1726}
                    height={920}
                    decoding="async"
                    fetchPriority="high"
                    className="absolute inset-0 -z-10 size-full object-cover object-right"
                />

                {/* Readability scrim.
                    Below `lg`: uniform whitewash across the entire image so the
                    text and icons stay legible over the dark truck/warehouse photo.
                    `lg+`: left-anchored gradient that fades to transparent, letting
                    the image breathe alongside the natural white panel. */}
                <div
                    aria-hidden
                    className="absolute inset-0 -z-10 bg-white/80 lg:bg-transparent lg:bg-linear-to-r lg:from-white lg:via-white/40 lg:to-white/0 lg:to-50%"
                />

                <div className="mx-auto max-w-7xl px-6 py-8 sm:py-10 lg:mx-0 lg:max-w-none lg:px-12 lg:py-14 xl:pl-16">
                    <div className="max-w-xl lg:max-w-2xl">
                        <h1
                            id="uvh-hero-heading"
                            className="mt-4 text-balance text-4xl font-extrabold uppercase leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl"
                        >
                            <span className="block text-neutral-950">{hero.titleLine1}</span>
                            <span className="block text-3xl text-(--sf-accent) sm:text-4xl lg:text-5xl xl:text-6xl">
                                {hero.titleLine2}
                            </span>
                        </h1>

                        <p className="mt-4 max-w-md text-pretty text-sm leading-snug text-neutral-700">
                            {hero.description.map((segment, index) =>
                                segment.bold ? (
                                    <strong
                                        key={index}
                                        className="font-semibold text-neutral-950"
                                    >
                                        {segment.text}
                                    </strong>
                                ) : (
                                    <span key={index}>{segment.text}</span>
                                ),
                            )}
                        </p>

                        <ul className="mt-5 grid max-w-md grid-cols-4 gap-x-3 gap-y-3 sm:gap-x-4 lg:max-w-lg">
                            {hero.services.map((service) => (
                                <li
                                    key={service.id}
                                    className="flex flex-col items-center text-center"
                                >
                                    <img
                                        src={service.imageSrc}
                                        alt={service.imageAlt}
                                        width={120}
                                        height={140}
                                        decoding="async"
                                        loading="lazy"
                                        className="h-25 w-auto sm:h-25 lg:h-25"
                                    />
                                    <span
                                        className="mt-1.5 text-[10px] font-bold uppercase leading-tight tracking-wide text-neutral-950 sm:text-[11px]">
                                        {service.label}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom stats / social-proof band */}
            <div className="w-full bg-neutral-950 py-5 lg:py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-3">
                    <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
                        {hero.stats.map((stat) => {
                            const Icon = stat.icon ? STAT_ICONS[stat.icon] : null;
                            return (
                                <li
                                    key={stat.id}
                                    className="flex flex-col gap-2 rounded-lg bg-white/3 px-5 py-4 ring-1 ring-white/5"
                                >
                                    <div className="flex items-center gap-2">
                                        {Icon ? (
                                            <Icon
                                                className="size-6 shrink-0 text-(--sf-accent)"
                                                strokeWidth={1.5}
                                                aria-hidden
                                            />
                                        ) : null}
                                        {stat.value ? (
                                            <p className="text-base font-bold uppercase leading-tight tracking-tight text-(--sf-accent)">
                                                {stat.value}
                                            </p>
                                        ) : null}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs leading-snug text-white/75">
                                            {stat.label}
                                        </p>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </section>
    );
}
