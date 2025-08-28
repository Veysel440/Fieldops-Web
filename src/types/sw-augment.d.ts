export {};

declare global {
  interface SyncManager {
    register(tag: string): Promise<void>;
  }
  interface PeriodicSyncManager {
    register(tag: string, options?: { minInterval?: number }): Promise<void>;
  }
  interface ServiceWorkerRegistration {
    sync?: SyncManager;
    periodicSync?: PeriodicSyncManager;
  }
}
