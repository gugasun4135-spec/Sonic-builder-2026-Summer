import { basePath } from "./paths";
import { migrateGameState } from "./storage";
import type { GameState } from "./gameTypes";

const syncPrefix = "#bq_sync=";
const syncQueryKey = "sync";

function encodeBase64(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function decodeBase64(value: string) {
  const binary = atob(value);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function createSyncUrl(state: GameState) {
  if (typeof window === "undefined") {
    return "";
  }

  const url = new URL(`${window.location.origin}${basePath}/home/`);
  url.searchParams.set(syncQueryKey, encodeBase64(JSON.stringify(state)));
  return url.toString();
}

export function readSyncStateFromUrl() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const queryPayload = new URLSearchParams(window.location.search).get(syncQueryKey);
    const hashPayload = window.location.hash.startsWith(syncPrefix)
      ? window.location.hash.slice(syncPrefix.length)
      : null;
    const payload = queryPayload ?? hashPayload;

    if (!payload) {
      return null;
    }

    return migrateGameState(JSON.parse(decodeBase64(decodeURIComponent(payload))));
  } catch {
    return null;
  }
}

export function clearSyncUrl() {
  if (typeof window === "undefined") {
    return;
  }

  window.history.replaceState(null, "", window.location.pathname);
}
