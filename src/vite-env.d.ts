/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_UMAMI_SRC: string | undefined;
  readonly VITE_UMAMI_WEBSITE_ID: string | undefined;
  readonly VITE_UMAMI_HOST_URL: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
