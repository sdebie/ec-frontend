import { SfCard, SfAccentDivider } from '@/components/storefront';

const UvhAboutUs = () => {
    return (
        <div>
            <SfCard elevation="sm" className="rounded-lg h-full p-8 order-2 lg:order-1">
                <h2 className="text-2xl font-bold mb-4 text-(--sf-text)">
                    About Us
                </h2>
                <SfAccentDivider className="mb-6" />
                <span>
                    PPE, hygiene, and medical disposable supply—built on quality, affordability, and fast, reliable fulfilment.
                </span>

                <SfCard elevation="sm" className="m-6 p-8 text-sm text-(--sf-text)">
                    Quality supply. Competitive pricing. Fast fulfilment.
                    UVH Holdings is a South African supplier focused on importing, procuring, and manufacturing essential business consumables—Personal Protective Equipment (PPE), hygiene and cleaning chemicals, medical disposable products, and sanitizer wipes.

                    From local businesses to wholesale buyers across Africa, we simplify procurement through a modern e-commerce platform and a hands-on service team—so you can source what you need, place orders quickly, and keep operations running without delays.
                </SfCard>
                <div className="mt-4 text-lg leading-relaxed text-(--sf-text)">

                </div>
            </SfCard>

        </div>
    )
}

export default UvhAboutUs