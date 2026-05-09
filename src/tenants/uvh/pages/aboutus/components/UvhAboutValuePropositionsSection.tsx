import {
    BadgeCheck,
    CircleDollarSign,
    Factory,
    Globe2,
    Handshake,
    HeartHandshake,
    Layers2,
    MonitorSmartphone,
    Warehouse,
} from 'lucide-react';
import {Link} from 'react-router-dom';

import {Card} from '@/primitives/card/Card';
import {Container} from '@/primitives/container/Container';
import {uvhAboutContent} from '@/tenants/uvh/content/uvhContent';

import type {LucideIcon} from 'lucide-react';

const COMPETITIVE_ICONS: LucideIcon[] = [
    BadgeCheck,
    CircleDollarSign,
    Layers2,
    MonitorSmartphone,
    Globe2,
];

const DIFFERENTIATOR_ICONS: LucideIcon[] = [Handshake, Factory, Warehouse, HeartHandshake];

function ValueBlockHeading({title}: {title: string}) {
    return (
        <h2 className="mt-10 flex items-center gap-3 text-xl font-bold tracking-tight text-(--sf-text) first:mt-0 sm:mt-12 sm:text-2xl">
            <span className="h-0.5 w-8 shrink-0 bg-(--sf-accent)" aria-hidden />
            {title}
        </h2>
    );
}

function ValuePropCard({
    title,
    body,
    Icon,
}: {
    title: string;
    body: string;
    Icon: LucideIcon;
}) {
    return (
        <Card
            as="article"
            className="flex h-full flex-col gap-2 p-4 sm:p-5"
            elevation="sm"
            padded={false}
        >
            <div className="flex items-center gap-2 sm:gap-2.5">
                <Icon
                    aria-hidden
                    className="size-6 shrink-0 text-(--sf-accent)"
                    strokeWidth={1.65}
                />
                <h3 className="text-sm font-bold text-(--c-text) sm:text-base">{title}</h3>
            </div>
            <p className="text-xs leading-relaxed text-(--c-text-muted) sm:text-sm">{body}</p>
        </Card>
    );
}

export function UvhAboutValuePropositionsSection() {
    const {valuePropositions} = uvhAboutContent;
    const {competitiveAdvantage, whatMakesUsDifferent, leadershipTeam} = valuePropositions;
    const sectionId = 'uvh-about-value-propositions';

    return (
        <section
            aria-label="UVH competitive advantages and team"
            className="w-full py-7 sm:py-9 lg:py-10"
            id={sectionId}
        >
            <Container className="px-4 sm:px-6 lg:px-8" padded={false} size="lg">
                <ValueBlockHeading title={competitiveAdvantage.title} />
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
                    {competitiveAdvantage.items.map((item, index) => {
                        const Icon = COMPETITIVE_ICONS[index] ?? BadgeCheck;
                        return (
                            <ValuePropCard
                                key={item.id}
                                Icon={Icon}
                                body={item.body}
                                title={item.title}
                            />
                        );
                    })}
                </div>
                <p className="mt-5 max-w-3xl text-sm leading-relaxed text-(--sf-muted-text) sm:mt-6 sm:text-base">
                    {competitiveAdvantage.footerBeforeLink}
                    <Link
                        className="font-semibold text-(--sf-accent) underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--sf-ring)"
                        to={competitiveAdvantage.footerLinkTo}
                    >
                        {competitiveAdvantage.footerLinkLabel}
                    </Link>
                    {competitiveAdvantage.footerAfterLink}
                </p>

                <ValueBlockHeading title={whatMakesUsDifferent.title} />
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
                    {whatMakesUsDifferent.items.map((item, index) => {
                        const Icon = DIFFERENTIATOR_ICONS[index] ?? Handshake;
                        return (
                            <ValuePropCard
                                key={item.id}
                                Icon={Icon}
                                body={item.body}
                                title={item.title}
                            />
                        );
                    })}
                </div>
                <p className="mt-5 max-w-3xl text-sm leading-relaxed text-(--sf-muted-text) sm:mt-6 sm:text-base">
                    {whatMakesUsDifferent.footerBeforeWholesale}
                    <Link
                        className="font-semibold text-(--sf-accent) underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--sf-ring)"
                        to={whatMakesUsDifferent.footerWholesaleTo}
                    >
                        {whatMakesUsDifferent.footerWholesaleLabel}
                    </Link>
                    {whatMakesUsDifferent.footerMid}
                    <Link
                        className="font-semibold text-(--sf-accent) underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--sf-ring)"
                        to={whatMakesUsDifferent.footerContactTo}
                    >
                        {whatMakesUsDifferent.footerContactLabel}
                    </Link>
                    {whatMakesUsDifferent.footerAfter}
                </p>

                <ValueBlockHeading title={leadershipTeam.title} />
                <Card
                    as="article"
                    className="mt-6 max-w-3xl p-4 sm:p-5"
                    elevation="sm"
                    padded={false}
                >
                    <p className="text-sm leading-relaxed text-(--c-text-muted) sm:text-base">
                        {leadershipTeam.body}
                    </p>
                </Card>
            </Container>
        </section>
    );
}
