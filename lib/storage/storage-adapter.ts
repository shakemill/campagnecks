import { BlobStorageAdapter } from "@/lib/storage/blob-storage";
import type { AppState } from "@/lib/types/domain";

export const EMPTY_STATE: AppState = {
  version: 1,
  campaigns: [],
  campaignUsers: [],
  screenings: [],
  audits: [],
};

export interface StorageAdapter {
  readState(): Promise<AppState>;
  writeState(state: AppState): Promise<void>;
  patchState(mutator: (draft: AppState) => void): Promise<AppState>;
}

let singleton: StorageAdapter | null = null;

export function getStorageAdapter(): StorageAdapter {
  if (!singleton) {
    singleton = new BlobStorageAdapter();
  }
  return singleton;
}
