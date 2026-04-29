import { SfCard } from '@/components/storefront'
import { Link } from 'react-router-dom'

const stats = [
    {label: 'Transactions every 24 hours', value: '44 million'},
    {label: 'Assets under holding', value: '$119 trillion'},
    {label: 'New users annually', value: '46,000'},
]

const values = [
    {
        name: 'Be world-class',
        description:
            'Aut illo quae. Ut et harum ea animi natus. Culpa maiores et sed sint et magnam exercitationem quia. Ullam voluptas nihil vitae dicta molestiae et. Aliquid velit porro vero.',
    },
    {
        name: 'Share everything you know',
        description:
            'Mollitia delectus a omnis. Quae velit aliquid. Qui nulla maxime adipisci illo id molestiae. Cumque cum ut minus rerum architecto magnam consequatur. Quia quaerat minima.',
    },
    {
        name: 'Always learning',
        description:
            'Aut repellendus et officiis dolor possimus. Deserunt velit quasi sunt fuga error labore quia ipsum. Commodi autem voluptatem nam. Quos voluptatem totam.',
    },
    {
        name: 'Be supportive',
        description:
            'Magnam provident veritatis odit. Vitae eligendi repellat non. Eum fugit impedit veritatis ducimus. Non qui aspernatur laudantium modi. Praesentium rerum error deserunt harum.',
    },
    {
        name: 'Take responsibility',
        description:
            'Sit minus expedita quam in ullam molestiae dignissimos in harum. Tenetur dolorem iure. Non nesciunt dolorem veniam necessitatibus laboriosam voluptas perspiciatis error.',
    },
    {
        name: 'Enjoy downtime',
        description:
            'Ipsa in earum deserunt aut. Quos minus aut animi et soluta. Ipsum dicta ut quia eius. Possimus reprehenderit iste aspernatur ut est velit consequatur distinctio.',
    },
]

const blogPosts = [
    {
        id: 1,
        title: 'Vel expedita assumenda placeat aut nisi optio voluptates quas',
        href: '#',
        description:
            'Illo sint voluptas. Error voluptates culpa eligendi. Hic vel totam vitae illo. Non aliquid explicabo necessitatibus unde. Sed exercitationem placeat consectetur nulla deserunt vel. Iusto corrupti dicta.',
        imageUrl:
            'https://images.unsplash.com/photo-1496128858413-b36217c2ce36?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3603&q=80',
        date: 'Mar 16, 2020',
        datetime: '2020-03-16',
        author: {
            name: 'Michael Foster',
            imageUrl:
                'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        },
    },
    {
        id: 2,
        title: 'Libero quisquam voluptatibus nam iusto qui dolor',
        href: '#',
        description: 'Optio cum necessitatibus dolor voluptatum provident commodi et. Qui aperiam fugiat nemo cumque.',
        imageUrl:
            'https://images.unsplash.com/photo-1547586696-ea22b4d4235d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3270&q=80',
        date: 'Mar 10, 2020',
        datetime: '2020-03-10',
        author: {
            name: 'Lindsay Walton',
            imageUrl:
                'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        },
    },
    {
        id: 3,
        title: 'Asperiores mollitia et dolor autem modi sit eius quisquam',
        href: '#',
        description:
            'Cupiditate maiores ullam eveniet adipisci in doloribus nulla minus. Voluptas iusto libero adipisci rem et corporis.',
        imageUrl:
            'https://images.unsplash.com/photo-1492724441997-5dc865305da7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3270&q=80',
        date: 'Feb 12, 2020',
        datetime: '2020-02-12',
        author: {
            name: 'Tom Cook',
            imageUrl:
                'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        },
    },
]

const AboutUs = () => {
    return (
        <main className="min-h-screen bg-(--sf-bg) text-(--sf-text)">
            {/* Hero section */}
            <div className="relative isolate overflow-hidden">
                <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl text-(--sf-text)">
                            We're changing the way people shop
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-(--sf-muted-text)">
                            Cupidatat minim id magna ipsum sint dolor qui. Sunt sit in quis cupidatat mollit
                            aute velit. Et labore commodo nulla aliqua proident mollit ullamco exercitation
                            tempor.
                        </p>
                    </div>
                </div>
            </div>

            {/* Mission section */}
            <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8 bg-(--sf-panel)">
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl text-(--sf-text)">
                        Our mission
                    </h2>
                    <p className="mt-6 text-base leading-relaxed text-(--sf-muted-text)">
                        Aliquet nec orci mattis amet quisque ullamcorper neque, nibh sem. At arcu, sit dui mi,
                        nibh dui, diam eget aliquam. Quisque id at vitae feugiat egestas ac. Diam nulla orci at
                        in viverra scelerisque eget. Eleifend egestas fringilla sapien.
                    </p>
                    <p className="mt-6 text-base leading-relaxed text-(--sf-muted-text)">
                        Faucibus commodo massa rhoncus, volutpat. Dignissim sed eget risus enim. Mattis mauris
                        semper sed amet vitae sed turpis id. Id dolor praesent donec est.
                    </p>
                </div>

                {/* Stats */}
                <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-12 gap-y-12 sm:grid-cols-3 lg:mx-0 lg:max-w-none lg:gap-x-16">
                    {stats.map((stat) => (
                        <div key={stat.label} className="text-center border-l border-(--sf-border) pl-6">
                            <dt className="text-sm font-medium leading-6 text-(--sf-muted-text)">
                                {stat.label}
                            </dt>
                            <dd className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl text-(--sf-accent)">
                                {stat.value}
                            </dd>
                        </div>
                    ))}
                </div>
            </div>

            {/* Image section */}
            <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
                <SfCard className="relative overflow-hidden rounded-lg">
                    <img
                        alt="Team collaboration"
                        src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2832&q=80"
                        className="aspect-video w-full object-cover"
                    />
                </SfCard>
            </div>

            {/* Values section */}
            <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8 bg-(--sf-panel)">
                <div className="mx-auto max-w-3xl text-center mb-12">
                    <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl text-(--sf-text)">
                        Our values
                    </h2>
                    <p className="mt-4 text-base leading-relaxed text-(--sf-muted-text)">
                        These principles guide every decision we make and shape our company culture.
                    </p>
                </div>
                <div className="mx-auto grid max-w-4xl grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                    {values.map((value) => (
                        <SfCard
                            key={value.name}
                            className="flex flex-col p-6 rounded-lg bg-(--sf-bg)"
                        >
                            <dt className="font-semibold text-lg text-(--sf-text)">
                                {value.name}
                            </dt>
                            <dd className="mt-2 text-sm leading-relaxed text-(--sf-muted-text)">
                                {value.description}
                            </dd>
                        </SfCard>
                    ))}
                </div>
            </div>

            {/* Blog section */}
            <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
                <div className="mb-12">
                    <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl text-(--sf-text)">
                        From the blog
                    </h2>
                    <p className="mt-4 text-base text-(--sf-muted-text)">
                        Learn how to grow your business with our expert advice.
                    </p>
                </div>
                <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:mx-0 lg:max-w-none">
                    {blogPosts.map((post) => (
                        <SfCard
                            as="article"
                            key={post.id}
                            className="flex h-full flex-col overflow-hidden rounded-lg"
                        >
                            <img
                                alt=""
                                src={post.imageUrl}
                                className="aspect-video w-full object-cover"
                            />
                            <div className="flex flex-1 flex-col p-6">
                                <div className="flex items-center gap-3 text-sm mb-3">
                                    <img
                                        alt=""
                                        src={post.author.imageUrl}
                                        className="size-8 flex-none rounded-full"
                                    />
                                    <div>
                                        <div className="font-medium text-(--sf-text)">
                                            {post.author.name}
                                        </div>
                                        <time dateTime={post.datetime} className="text-(--sf-muted-text)">
                                            {post.date}
                                        </time>
                                    </div>
                                </div>
                                <h3 className="font-semibold text-lg leading-snug line-clamp-3 mb-2 text-(--sf-text)">
                                    <Link to={post.href} className="hover:opacity-75 transition-opacity">
                                        {post.title}
                                    </Link>
                                </h3>
                                <p className="text-sm line-clamp-2 text-(--sf-muted-text)">
                                    {post.description}
                                </p>
                            </div>
                        </SfCard>
                    ))}
                </div>
            </div>

            {/* CTA section */}
            <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8 bg-(--sf-panel)">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl text-(--sf-text)">
                        Ready to join us?
                    </h2>
                    <p className="mt-4 text-base leading-relaxed mb-8 text-(--sf-muted-text)">
                        Discover our full range of products and start shopping today.
                    </p>
                    <Link
                        to="/products"
                        className="inline-flex items-center justify-center px-6 py-3 rounded-md font-semibold transition-opacity hover:opacity-90 bg-(--sf-accent) text-(--sf-accent-text)"
                    >
                        Browse Products
                    </Link>
                </div>
            </div>
        </main>
    )
}

export default AboutUs