import {Card} from '@/primitives/card/Card';
import {Container} from '@/primitives/container/Container';
import {UvhSectionHeading} from '@/tenants/uvh/components/UvhSectionHeading';
import {uvhAboutContent} from '@/tenants/uvh/config';

const LIGHT_BADGE =
    'flex size-9 shrink-0 items-center justify-center rounded-md bg-(--sf-accent) text-sm font-bold text-(--sf-accent-text)';

export function UvhProductsServicesSection() {
    const {productsAndServices} = uvhAboutContent;

    return (
        <section
            aria-labelledby="uvh-products-services-heading"
            className="w-full border-t border-(--sf-border) py-7 sm:py-9"
        >
            <Container className="px-4 sm:px-6 lg:px-8" padded={false} size="lg">
                <header className="max-w-2xl">
                    <UvhSectionHeading id="uvh-products-services-heading" eyebrow={productsAndServices.eyebrow}>
                        {productsAndServices.title}
                    </UvhSectionHeading>
                </header>
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    {productsAndServices.items.map((item) => (
                        <Card key={item.id} as="article" className="flex flex-col gap-3 p-4 sm:p-5" elevation="sm" padded={false}>
                            <div className="flex items-center gap-3">
                                <span className={LIGHT_BADGE} aria-hidden>{item.label}</span>
                                <h3 className="text-base font-semibold text-(--sf-text)">{item.heading}</h3>
                            </div>
                            <p className="text-sm leading-relaxed text-(--sf-muted-text)">{item.body}</p>
                        </Card>
                    ))}
                </div>
            </Container>
        </section>
    );
}
