import {AdaptiveCard} from "@/components";

const UvhAboutUs = () => {
    return (
        <div>
            <div className="h-full rounded-lg p-8 border order-2 lg:order-1" style={{
                backgroundColor: 'var(--sf-panel)',
                borderColor: 'var(--sf-border)'
            }}>
                <h2
                    className="text-2xl font-bold mb-4"
                    style={{color: 'var(--sf-text)'}}
                >
                    About Us
                </h2>
                <div
                    className="h-1 w-12 mb-6 rounded"
                    style={{backgroundColor: 'var(--sf-accent)'}}
                />
                <span>
                    PPE, hygiene, and medical disposable supply—built on quality, affordability, and fast, reliable fulfilment.
                </span>


                <AdaptiveCard className={"m-6 p-8 text-sm"}>
                    Quality supply. Competitive pricing. Fast fulfilment.
                    UVH Holdings is a South African supplier focused on importing, procuring, and manufacturing essential business consumables—Personal Protective Equipment (PPE), hygiene and cleaning chemicals, medical disposable products, and sanitizer wipes.

                    From local businesses to wholesale buyers across Africa, we simplify procurement through a modern e-commerce platform and a hands-on service team—so you can source what you need, place orders quickly, and keep operations running without delays.
                </AdaptiveCard>
                <div className={"mt-4 text-lg leading-relaxed"} style={{color: 'var(--sf-text)'}}>

                </div>
            </div>

        </div>
    )
}

export default UvhAboutUs