import { Card } from "@/primitives/card/Card";
import { Container } from "@/primitives/container/Container";
import { IconBox } from "@/primitives/icon-box/IconBox";
import { uvhAboutContent } from "@/tenants/uvh/content/uvhContent";
import { Globe2, History, LucideIcon, ShieldCheck } from "lucide-react";

const HIGHLIGHT_ICONS: LucideIcon[] = [History, Globe2, ShieldCheck];

export function UvhAboutHighlightCards() {
    return (
        <section
            aria-label="UVH service highlights"
            className="w-full border-t border-(--sf-border) py-10 sm:py-12"
        >
            <Container className="px-4 sm:px-6 lg:px-8" padded={false} size="lg">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
                    {uvhAboutContent.highlights.map((item, index) => {
                        const Icon = HIGHLIGHT_ICONS[index] ?? History;
                        return (
                            <Card
                                key={item.title}
                                as="article"
                                className="flex flex-row items-start gap-4 p-5 sm:p-6"
                                elevation="sm"
                            >
                                <IconBox className="size-12 shrink-0 rounded-full border-0 bg-(--sf-accent) text-(--sf-accent-text)">
                                    <Icon aria-hidden className="size-6" strokeWidth={1.75} />
                                </IconBox>
                                <div className="min-w-0 flex-1">
                                    <h2 className="text-xl font-bold tracking-tight text-(--c-text)">
                                        {item.title}
                                    </h2>
                                    <p className="mt-1 text-sm font-semibold leading-snug text-(--c-text)">
                                        {item.subtitle}
                                    </p>
                                    <p className="mt-2 text-sm font-normal leading-relaxed text-(--c-text-muted)">
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
