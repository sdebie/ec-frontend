interface ImportMetaEnv {
    readonly VITE_API_BASE_URL?: string
    readonly VITE_STORE_FRONT: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}