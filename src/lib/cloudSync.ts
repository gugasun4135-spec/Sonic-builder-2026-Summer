import { migrateGameState } from "./storage";
import type { GameState } from "./gameTypes";

export type CloudSyncEnvelope = {
  state: GameState;
  updatedAt: number;
};

const endpoint = process.env.NEXT_PUBLIC_BQ_SYNC_ENDPOINT?.replace(/\/$/, "");
const token = process.env.NEXT_PUBLIC_BQ_SYNC_TOKEN;

export function isCloudSyncConfigured() {
  return Boolean(endpoint && token);
}

function stateUrl() {
  if (!endpoint) {
    throw new Error("Cloud sync endpoint is not configured.");
  }

  return `${endpoint}/state`;
}

function headers() {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };
}

export async function loadCloudState(): Promise<CloudSyncEnvelope | null> {
  if (!isCloudSyncConfigured()) {
    return null;
  }

  const response = await fetch(stateUrl(), {
    headers: headers(),
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
    updatedAt: data.updatedAt
  };
}

export async function saveCloudState(state: GameState, updatedAt = Date.now()) {
  if (!isCloudSyncConfigured()) {
    return null;
  }

  const envelope: CloudSyncEnvelope = {
    state,
    updatedAt
  };

  const response = await fetch(stateUrl(), {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(envelope)
  });

  if (!response.ok) {
    throw new Error("Failed to save cloud game state.");
  }

  return envelope;
}
