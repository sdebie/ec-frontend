import {Link} from 'react-router-dom';
import {SfAboutSection} from '@/components/storefront/shell/SfAboutSection';
import {SfContentSection} from '@/components/storefront/shell/SfContentSection';
import {SfHeroSection} from '@/components/storefront/shell/SfHeroSection';
import {SfCard} from '@/components/storefront';
import {uvhAboutContent} from '@/pages/storefront/uvh/content/uvhContent.ts';

export default function UvhAboutUsPage() {
    return (
        <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
            <SfHeroSection
                title="UVH Holdings"
                subtitle={uvhAboutContent.intro}
                actions={
                    <Link
                        to="/contact-us"
                        className="rounded-md bg-(--sf-accent) px-4 py-2 text-sm font-semibold text-(--sf-accent-text)"
                    >
                        Request a quote
                    </Link>
                }
            />
            <SfAboutSection
                title="Our mission"
                body={uvhAboutContent.mission}
            />
            <SfContentSection title="Why procurement teams choose UVH">
                <div className="grid gap-4 md:grid-cols-2">
                    {uvhAboutContent.differentiators.map((item) => (
                        <SfCard key={item} className="p-4">
                            <p className="text-sm text-(--sf-text)">{item}</p>
                        </SfCard>
                    ))}
                </div>
            </SfContentSection>
            <SfContentSection title="Accreditors">
                <div className="flex flex-wrap gap-3">
                    {uvhAboutContent.accreditors.map((name) => (
                        <SfCard key={name} className="px-4 py-2">
                            <span className="text-sm font-semibold text-(--sf-text)">{name}</span>
                        </SfCard>
                    ))}
                </div>
            </SfContentSection>
        </main>
    );
}

