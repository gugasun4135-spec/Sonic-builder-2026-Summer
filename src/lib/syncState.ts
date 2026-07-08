import { basePath } from "./paths";
import { migrateGameState } from "./storage";
import type { GameState } from "./gameTypes";

const syncPrefix = "#bq_sync=";

function encodeBase64(value: string) {
  return btoa(unescape(encodeURIComponent(value)));
}

function decodeBase64(value: string) {
  return decodeURIComponent(escape(atob(value)));
}

export function createSyncUrl(state: GameState) {
  if (typeof window === "undefined") {
    return "";
  }

  const payload = encodeURIComponent(encodeBase64(JSON.stringify(state)));
  return `${window.location.origin}${basePath}/home/${syncPrefix}${payload}`;
}

export function readSyncStateFromUrl() {
  if (typeof window === "undefined" || !window.location.hash.startsWith(syncPrefix)) {
    return null;
  }

  try {
    const payload = window.location.hash.slice(syncPrefix.length);
    return migrateGameState(JSON.parse(decodeBase64(decodeURIComponent(payload))));
  } catch {
    return null;
  }
}

export function clearSyncHash() {
  if (typeof window === "undefined") {
    return;
  }

  window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
}
