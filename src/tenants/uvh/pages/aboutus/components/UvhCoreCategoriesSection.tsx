import type {LucideIcon} from 'lucide-react';
import {Droplets, HardHat, Shield, Stethoscope} from 'lucide-react';
import {UvhGradientTrustBand} from '@/tenants/uvh/components/UvhGradientTrustBand.tsx';
import {uvhAboutContent} from '@/tenants/uvh/config';

const CATEGORY_ICONS: LucideIcon[] = [Stethoscope, Shield, Droplets, HardHat];

export function UvhCoreCategoriesSection() {
    const {coreCategories} = uvhAboutContent;

    return (
        <UvhGradientTrustBand eyebrow={coreCategories.eyebrow} title={coreCategories.title}>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
                {coreCategories.items.map((item, index) => {
                    const Icon = CATEGORY_ICONS[index] ?? Stethoscope;
                    return (
                        <article key={item.id}
                                 className="flex flex-col overflow-hidden rounded-xl border border-white/12 bg-white/6 shadow-[0_12px_28px_rgba(0,0,0,0.25)] backdrop-blur-[1px]">
                            <div className="relative h-36 w-full overflow-hidden bg-white/5 sm:h-40">
                                <img
                                    alt={item.imageAlt}
                                    className="absolute inset-0 m-auto max-h-full max-w-full object-contain"
                                    decoding="async"
                                    loading="lazy"
                                    src={item.imageSrc}
                                />
                            </div>
                            <div className="flex flex-1 flex-col gap-2 p-4">
                                <div className="flex items-center gap-2 sm:gap-2.5">
                                    <Icon aria-hidden className="size-5 shrink-0 text-(--sf-accent)"
                                          strokeWidth={1.65}/>
                                    <h3 className="text-sm font-bold text-white sm:text-base">{item.title}</h3>
                                </div>
                                <p className="text-xs leading-relaxed text-white/75 sm:text-sm">{item.description}</p>
                            </div>
                        </article>
                    );
                })}
            </div>
        </UvhGradientTrustBand>
    );
}
