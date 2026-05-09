import {Droplets, HardHat, Shield, Stethoscope} from 'lucide-react';

import {Card} from '@/primitives/card/Card';
import {Container} from '@/primitives/container/Container';
import {uvhAboutContent} from '@/tenants/uvh/content/uvhContent';

import type {LucideIcon} from 'lucide-react';

const CATEGORY_ICONS: LucideIcon[] = [Stethoscope, Shield, Droplets, HardHat];

export function UvhCoreCategoriesSection() {
    const {coreCategories} = uvhAboutContent;
    const sectionHeadingId = 'uvh-about-core-categories-heading';

    return (
        <section
            aria-labelledby={sectionHeadingId}
            className="w-full py-7 sm:py-9 lg:py-10"
        >
            <Container className="px-4 sm:px-6 lg:px-8" padded={false} size="lg">
                <header className="max-w-2xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-(--sf-accent)">
                        <span
                            className="mr-2 inline-block h-px w-4 align-middle bg-(--sf-accent)"
                            aria-hidden
                        />
                        {coreCategories.eyebrow}
                    </p>
                    <h2
                        className="mt-1.5 text-xl font-bold tracking-tight text-(--sf-text) sm:mt-2 sm:text-2xl"
                        id={sectionHeadingId}
                    >
                        {coreCategories.title}
                    </h2>
                </header>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
                    {coreCategories.items.map((item, index) => {
                        const Icon = CATEGORY_ICONS[index] ?? Stethoscope;
                        return (
                            <Card
                                key={item.id}
                                as="article"
                                className="flex h-full flex-col overflow-hidden p-0"
                                elevation="sm"
                            >
                                <div className="relative h-36 w-full overflow-hidden bg-(--sf-surface-muted) sm:h-40">
                                    <img
                                        alt={item.imageAlt}
                                        className="absolute inset-0 m-auto max-h-full max-w-full object-contain"
                                        decoding="async"
                                        loading="lazy"
                                        src={item.imageSrc}
                                    />
                                </div>
                                <Card.Body className="flex flex-1 flex-col gap-2 p-4 sm:p-4">
                                    <div className="flex items-center gap-2 sm:gap-2.5">
                                        <Icon
                                            aria-hidden
                                            className="size-6 shrink-0 text-(--sf-accent)"
                                            strokeWidth={1.65}
                                        />
                                        <h3 className="text-sm font-bold text-(--c-text) sm:text-base">
                                            {item.title}
                                        </h3>
                                    </div>
                                    <p className="text-xs leading-relaxed text-(--c-text-muted) sm:text-sm">
                                        {item.description}
                                    </p>
                                </Card.Body>
                            </Card>
                        );
                    })}
                </div>
            </Container>
        </section>
    );
}
