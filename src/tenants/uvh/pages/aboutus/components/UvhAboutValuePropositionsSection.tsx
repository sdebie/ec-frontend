import type {LucideIcon} from 'lucide-react';
import {
    BadgeCheck,
    CircleDollarSign,
    Factory,
    Globe2,
    Handshake,
    HeartHandshake,
    Layers2,
    MonitorSmartphone,
    Users,
    Warehouse,
} from 'lucide-react';
import {Link} from 'react-router-dom';
import {Card} from '@/primitives/card/Card';
import {Container} from '@/primitives/container/Container';
import {UvhSectionHeading} from '@/tenants/uvh/components/UvhSectionHeading';
import {FROSTED_CARD, UvhGradientTrustBand} from '@/tenants/uvh/components/UvhGradientTrustBand.tsx';
import {uvhAboutContent} from '@/tenants/uvh/config';

const COMPETITIVE_ICONS: LucideIcon[] = [
    BadgeCheck,
    CircleDollarSign,
    Layers2,
    MonitorSmartphone,
    Globe2,
];

const DIFFERENTIATOR_ICONS: LucideIcon[] = [Handshake, Factory, Warehouse, HeartHandshake];

export function UvhAboutValuePropositionsSection() {
    const {valuePropositions} = uvhAboutContent;
    const {competitiveAdvantage, whatMakesUsDifferent, leadershipTeam} = valuePropositions;

    return (
        <div className="w-full bg-(--sf-bg)">
            {/* Competitive Advantage — dark */}
            <UvhGradientTrustBand
                eyebrow={competitiveAdvantage.eyebrow}
                title={competitiveAdvantage.title}
                id="uvh-competitive-advantage-heading"
            >
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
                    {competitiveAdvantage.items.map((item, index) => {
                        const Icon = COMPETITIVE_ICONS[index] ?? BadgeCheck;
                        return (
                            <article key={item.id} className={FROSTED_CARD}>
                                <div className="flex items-center gap-2 sm:gap-2.5">
                                    <Icon aria-hidden className="size-5 shrink-0 text-(--sf-accent)"
                                          strokeWidth={1.65}/>
                                    <h3 className="text-sm font-bold text-white sm:text-base">{item.title}</h3>
                                </div>
                                <p className="mt-2 text-xs leading-relaxed text-white/80 sm:text-sm">{item.body}</p>
                            </article>
                        );
                    })}
                </div>
                <p className="mt-5 max-w-3xl text-sm leading-relaxed text-white/75 sm:mt-6">
                    {competitiveAdvantage.footerBeforeLink}
                    <Link
                        className="font-semibold text-(--sf-accent) underline-offset-2 hover:underline"
                        to={competitiveAdvantage.footerLinkTo}
                    >
                        {competitiveAdvantage.footerLinkLabel}
                    </Link>
                    {competitiveAdvantage.footerAfterLink}
                </p>
            </UvhGradientTrustBand>

            {/* What Makes Us Different — light */}
            <section
                aria-labelledby="uvh-differentiators-heading"
                className="w-full border-t border-(--sf-border) py-7 sm:py-9 lg:py-10"
            >
                <Container className="px-4 sm:px-6 lg:px-8" padded={false} size="lg">
                    <header className="max-w-2xl">
                        <UvhSectionHeading
                            id="uvh-differentiators-heading"
                            eyebrow={whatMakesUsDifferent.eyebrow}
                        >
                            {whatMakesUsDifferent.title}
                        </UvhSectionHeading>
                    </header>
                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
                        {whatMakesUsDifferent.items.map((item, index) => {
                            const Icon = DIFFERENTIATOR_ICONS[index] ?? Handshake;
                            return (
                                <Card key={item.id} as="article" className="flex h-full flex-col gap-2 p-4 sm:p-5"
                                      elevation="sm" padded={false}>
                                    <div className="flex items-center gap-2 sm:gap-2.5">
                                        <Icon aria-hidden className="size-5 shrink-0 text-(--sf-accent)"
                                              strokeWidth={1.65}/>
                                        <h3 className="text-sm font-bold text-(--c-text) sm:text-base">{item.title}</h3>
                                    </div>
                                    <p className="mt-2 text-xs leading-relaxed text-(--c-text-muted) sm:text-sm">{item.body}</p>
                                </Card>
                            );
                        })}
                    </div>
                    <p className="mt-5 max-w-3xl text-sm leading-relaxed text-(--sf-muted-text) sm:mt-6">
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
                </Container>
            </section>

            {/* Leadership Team — dark */}
            <UvhGradientTrustBand
                eyebrow={leadershipTeam.eyebrow}
                title={leadershipTeam.title}
                id="uvh-leadership-heading"
            >
                <div
                    className="mt-5 flex w-full items-start gap-4 rounded-xl border border-white/12 bg-white/6 p-5 shadow-[0_12px_28px_rgba(0,0,0,0.25)] backdrop-blur-[1px] sm:p-6">
                    <Users
                        aria-hidden
                        className="mt-0.5 size-8 shrink-0 text-(--sf-accent)"
                        strokeWidth={1.5}
                    />
                    <p className="text-sm leading-relaxed text-white/85 sm:text-base">
                        {leadershipTeam.body}
                    </p>
                </div>
            </UvhGradientTrustBand>
        </div>
    );
}
