import { migrateGameState } from "./storage";
import type { GameState } from "./gameTypes";

export type CloudSyncEnvelope = {
  state: GameState;
  updatedAt: number;
  revision?: number;
  conflict?: boolean;
};

const syncEnabled = process.env.NEXT_PUBLIC_BQ_SYNC_ENABLED === "true";

export function isCloudSyncConfigured() {
  return syncEnabled;
}

function stateUrl() {
  return "/api/game-state";
}

export async function loadCloudState(): Promise<CloudSyncEnvelope | null> {
  if (!isCloudSyncConfigured()) {
    return null;
  }

  const response = await fetch(stateUrl(), {
    cache: "no-store"
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to load cloud game state.");
  }

  const data = (await response.json()) as Partial<CloudSyncEnvelope>;

  if (!data.state || typeof data.updatedAt !== "number") {
    return null;
  }

  return {
    state: migrateGameState(data.state),
    updatedAt: data.updatedAt,
    revision: data.revision,
    conflict: data.conflict
  };
}

export async function saveCloudState(state: GameState, updatedAt = Date.now(), revision?: number) {
  if (!isCloudSyncConfigured()) {
    return null;
  }

  const envelope: CloudSyncEnvelope = {
    state,
    updatedAt,
    revision
  };

  const response = await fetch(stateUrl(), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(envelope)
  });

  if (!response.ok && response.status !== 409) {
    throw new Error("Failed to save cloud game state.");
  }

  const data = (await response.json()) as Partial<CloudSyncEnvelope>;

  if (!data.state || typeof data.updatedAt !== "number") {
    return envelope;
  }

  return {
    state: migrateGameState(data.state),
    updatedAt: data.updatedAt,
    revision: data.revision,
    conflict: data.conflict
  };
}
