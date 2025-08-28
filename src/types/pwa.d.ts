declare module 'virtual:pwa-register' {
  export function registerSW(opts?: {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
  }): (reload?: boolean) => void;
}
