/// <reference types="vite/client" />

interface ViteTypeOptions {
    strictImportMetaEnv: unknown
}

interface ImportMetaEnv {
    readonly VITE_APP_TITLE: string
    readonly VITE_API_KEY: string
    readonly VITE_SOURCE_HOST: string
    readonly VITE_AI_CHAT_SERVICE_BASE_URL: string
    readonly VITE_AI_CORE_SERVICE_BASE_URL: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}