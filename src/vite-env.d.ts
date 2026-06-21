/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AI_MODE?: 'mock' | 'real';
  readonly VITE_ANTHROPIC_API_KEY?: string;
  readonly VITE_LLM_MODEL?: string;
  readonly DEV: boolean;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
