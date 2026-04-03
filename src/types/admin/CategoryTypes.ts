export type Category = {
    id: string,
    name: string,
    slug: string,
    description: string,
    parent: Category | null,
        imageUrl: string | null
}