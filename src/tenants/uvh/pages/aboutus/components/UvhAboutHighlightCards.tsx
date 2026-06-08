import type {ReactNode} from 'react';
import {Card} from "@/primitives/card/Card";
import {Container} from "@/primitives/container/Container";
import {IconBox} from "@/primitives/icon-box/IconBox";
import {uvhAboutContent} from "@/tenants/uvh/config";
import {Globe2, History, LucideIcon, ShieldCheck} from "lucide-react";

const HIGHLIGHT_ICONS: LucideIcon[] = [History, Globe2, ShieldCheck];

export function UvhAboutHighlightCards({intro}: { intro?: ReactNode }) {
    return (
        <section
            aria-label="UVH service highlights"
            className="w-full border-t border-(--sf-border) py-6 sm:py-8"
        >
            <Container className="px-4 sm:px-6 lg:px-8" padded={false} size="lg">
                {intro ? <div className="mb-5 w-full">{intro}</div> : null}

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
                    {uvhAboutContent.highlights.map((item, index) => {
                        const Icon = HIGHLIGHT_ICONS[index] ?? History;
                        return (
                            <Card
                                key={item.title}
                                as="article"
                                className="flex flex-col gap-1.5 p-3 sm:p-4"
                                elevation="sm"
                            >
                                <div className="flex items-center gap-2.5">
                                    <IconBox
                                        className="size-8 shrink-0 rounded-full border-0 bg-(--sf-accent) text-(--sf-accent-text)">
                                        <Icon aria-hidden className="size-4" strokeWidth={1.75}/>
                                    </IconBox>
                                    <h3 className="text-base font-bold tracking-tight text-(--c-text)">
                                        {item.title}
                                    </h3>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold leading-snug text-(--c-text)">
                                        {item.subtitle}
                                    </p>
                                    <p className="mt-1 text-xs font-normal leading-relaxed text-(--c-text-muted)">
                                        {item.description}
                                    </p>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </Container>
        </section>
    );
}
