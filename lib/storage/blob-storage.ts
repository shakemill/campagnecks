import { get, put } from "@vercel/blob";

import { EMPTY_STATE, type StorageAdapter } from "@/lib/storage/storage-adapter";
import type { AppState } from "@/lib/types/domain";

const STATE_BLOB_PATH = "cks-manager/state.json";
const LOCAL_STATE_KEY = "__CKS_LOCAL_STATE__";
const PLACEHOLDER_BLOB_TOKEN = "vercel_blob_rw_token";

function cloneState(state: AppState): AppState {
  return JSON.parse(JSON.stringify(state)) as AppState;
}

export class BlobStorageAdapter implements StorageAdapter {
  async readState(): Promise<AppState> {
    const local = globalThisThis()[LOCAL_STATE_KEY];
    if (local) {
      return cloneState(local as AppState);
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!hasUsableBlobToken(token)) {
      return cloneState(EMPTY_STATE);
    }

    try {
      const result = await get(STATE_BLOB_PATH, {
        access: "private",
        useCache: false,
        token,
      });
      if (!result || result.statusCode !== 200 || !result.stream) {
        return cloneState(EMPTY_STATE);
      }
      const response = new Response(result.stream);
      const payload = (await response.json()) as AppState;
      return payload;
    } catch (error) {
      if (process.env.NODE_ENV === "production") {
        throw new Error("Blob read failed in production. Check BLOB_READ_WRITE_TOKEN and blob permissions.", {
          cause: error,
        });
      }
      return cloneState(EMPTY_STATE);
    }
  }

  async writeState(state: AppState): Promise<void> {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!hasUsableBlobToken(token)) {
      globalThisThis()[LOCAL_STATE_KEY] = cloneState(state);
      return;
    }

    try {
      await put(STATE_BLOB_PATH, JSON.stringify(state), {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: true,
        token,
        contentType: "application/json",
      });
    } catch (error) {
      if (process.env.NODE_ENV === "production") {
        throw new Error("Blob write failed in production. Check BLOB_READ_WRITE_TOKEN and Vercel Blob store.", {
          cause: error,
        });
      }
      console.warn("Blob write failed, fallback to local storage.", error);
    }

    globalThisThis()[LOCAL_STATE_KEY] = cloneState(state);
  }

  async patchState(mutator: (draft: AppState) => void): Promise<AppState> {
    const current = await this.readState();
    const draft = cloneState(current);
    mutator(draft);
    draft.version += 1;
    await this.writeState(draft);
    return draft;
  }
}

function hasUsableBlobToken(token: string | undefined): token is string {
  if (!token) return false;
  const trimmed = token.trim();
  if (!trimmed) return false;
  if (trimmed === PLACEHOLDER_BLOB_TOKEN) return false;
  return true;
}

function globalThisThis(): Record<string, unknown> {
  return globalThis as unknown as Record<string, unknown>;
}
