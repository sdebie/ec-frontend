import {Link} from 'react-router-dom';
import type {HeroContentAlignment, HeroContentMaxWidth, HeroSectionProps} from '@/types/storefront/storefrontTypes';

interface Props {
    props: HeroSectionProps;
}

const alignClassByValue: Record<HeroContentAlignment, string> = {
    left: 'items-start text-left',
    center: 'items-center text-center',
    right: 'items-end text-right',
};

const ctaAlignClassByValue: Record<HeroContentAlignment, string> = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
};

const maxWidthClassByValue: Record<HeroContentMaxWidth, string> = {
    sm: 'max-w-xl',
    md: 'max-w-2xl',
    lg: 'max-w-3xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-5xl',
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const HeroSection = ({props}: Props) => {
    const alignment = props.contentAlignment ?? 'center';
    const maxContentWidth = props.maxContentWidth ?? '2xl';

    const hasBackgroundImage = Boolean(props.backgroundImageUrl);
    const overlayOpacity = clamp(props.overlayOpacity ?? 0.45, 0, 1);
    const hasOverlay = hasBackgroundImage && overlayOpacity > 0;
    const darkStyle = props.darkStyle ?? hasBackgroundImage;

    return (
        <section
            className={[
                'relative w-full overflow-hidden rounded-2xl border border-(--sf-border)',
                'min-h-80 sm:min-h-105 lg:min-h-130',
                hasBackgroundImage ? 'bg-(--sf-bg)' : 'bg-(--sf-panel)',
            ].join(' ')}
        >
            {hasBackgroundImage ? (
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{backgroundImage: `url(${props.backgroundImageUrl})`}}
                    aria-hidden="true"
                />
            ) : null}

            {hasOverlay ? (
                <div
                    className="absolute inset-0"
                    style={{backgroundColor: `rgba(15, 23, 42, ${overlayOpacity})`}}
                    aria-hidden="true"
                />
            ) : null}

            <div className="relative z-10 flex min-h-[inherit] items-center p-6 sm:p-10 lg:p-14">
                <div
                    className={['mx-auto flex w-full flex-col', alignClassByValue[alignment], maxWidthClassByValue[maxContentWidth]].join(' ')}>
                    <h1
                        className={[
                            'text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl',
                            darkStyle ? 'text-white' : 'text-(--sf-text)',
                        ].join(' ')}
                    >
                        {props.title}
                    </h1>

                    {props.subtitle ? (
                        <p
                            className={[
                                'mt-4 text-base leading-7 sm:text-lg',
                                darkStyle ? 'text-white/85' : 'text-(--sf-muted-text)',
                            ].join(' ')}
                        >
                            {props.subtitle}
                        </p>
                    ) : null}

                    {props.primaryCta || props.secondaryCta ? (
                        <div className={['mt-8 flex flex-wrap gap-3', ctaAlignClassByValue[alignment]].join(' ')}>
                            {props.primaryCta ? (
                                <Link
                                    to={props.primaryCta.to}
                                    className="inline-flex rounded-full bg-(--sf-accent) px-6 py-3 text-sm font-semibold text-(--sf-accent-text) shadow-sm transition hover:opacity-95"
                                >
                                    {props.primaryCta.label}
                                </Link>
                            ) : null}

                            {props.secondaryCta ? (
                                <Link
                                    to={props.secondaryCta.to}
                                    className={[
                                        'inline-flex rounded-full px-6 py-3 text-sm font-semibold transition',
                                        darkStyle
                                            ? 'border border-white/40 text-white hover:bg-white/10'
                                            : 'border border-(--sf-border) text-(--sf-text) hover:bg-(--sf-bg)',
                                    ].join(' ')}
                                >
                                    {props.secondaryCta.label}
                                </Link>
                            ) : null}
                        </div>
                    ) : null}
                </div>
            </div>
        </section>
    );
};
