import { Link } from 'react-router-dom';
import { SfAboutSection } from '@/components/storefront/shell/SfAboutSection';
import { SfContentSection } from '@/components/storefront/shell/SfContentSection';
import { SfHeroSection } from '@/components/storefront/shell/SfHeroSection';

export default function DefaultAboutPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
      <SfHeroSection
        title="Built for modern ecommerce teams"
        subtitle="A tenant-ready storefront foundation with configurable branding, navigation, and page overrides."
        actions={
          <Link
            to="/products"
            className="rounded-md bg-[var(--sf-accent)] px-4 py-2 text-sm font-semibold text-[var(--sf-accent-text)]"
          >
            Browse products
          </Link>
        }
      />
      <SfAboutSection
        title="Who we are"
        body="We provide a reusable storefront shell where each tenant can brand and customize selected pages without fragmenting the core codebase."
      />
      <SfContentSection title="How customization works">
        <ul className="list-disc space-y-2 pl-5">
          <li>Default pages provide baseline behavior.</li>
          <li>Tenant convention pages override only what is needed.</li>
          <li>Theme tokens apply branding consistently across components.</li>
        </ul>
      </SfContentSection>
    </main>
  );
}

