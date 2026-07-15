import { migrateGameState } from "./storage";
import type { GameState } from "./gameTypes";

export type CloudSyncEnvelope = {
  state: GameState;
  updatedAt: number;
  revision?: number;
  conflict?: boolean;
};

const syncEnabled = process.env.NEXT_PUBLIC_BQ_SYNC_ENABLED === "true";
const supabaseUrl = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const gameStateId = process.env.NEXT_PUBLIC_BQ_GAME_STATE_ID || "zhenyu-main";
const childId = process.env.NEXT_PUBLIC_BQ_CHILD_ID || "zhenyu";

type GameStateRow = {
  id: string;
  child_id: string;
  state: GameState;
  revision: number | null;
  updated_at: string | null;
};

export function isCloudSyncConfigured() {
  return syncEnabled && Boolean(supabaseUrl && supabaseAnonKey);
}

function normalizeSupabaseUrl(value?: string) {
  if (!value) {
    return "";
  }

  return value.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
}

function tableUrl(query = "") {
  return `${supabaseUrl}/rest/v1/game_states${query}`;
}

function headers(extra?: HeadersInit) {
  return {
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${supabaseAnonKey}`,
    "Content-Type": "application/json",
    ...extra
  };
}

function rowToEnvelope(row: GameStateRow): CloudSyncEnvelope | null {
  if (!row?.state) {
    return null;
  }

  return {
    state: migrateGameState(row.state),
    updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now(),
    revision: row.revision ?? 0
  };
}

async function fetchCurrentRow() {
  const response = await fetch(
    tableUrl(`?id=eq.${encodeURIComponent(gameStateId)}&select=id,child_id,state,revision,updated_at&limit=1`),
    {
      headers: headers(),
      cache: "no-store"
    }
  );

  if (!response.ok) {
    throw new Error("Failed to load cloud game state.");
  }

  const rows = (await response.json()) as GameStateRow[];
  return rows[0] ?? null;
}

export async function loadCloudState(): Promise<CloudSyncEnvelope | null> {
  if (!isCloudSyncConfigured()) {
    return null;
  }

  const row = await fetchCurrentRow();
  if (!row) {
    return null;
  }

  return rowToEnvelope(row);
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

  const currentRevision = revision ?? 0;
  const nextRevision = currentRevision + 1;
  const updatedAtIso = new Date(updatedAt).toISOString();
  const patchResponse = await fetch(
    tableUrl(
      `?id=eq.${encodeURIComponent(gameStateId)}&revision=eq.${encodeURIComponent(String(currentRevision))}&select=id,child_id,state,revision,updated_at`
    ),
    {
      method: "PATCH",
      headers: headers({
        Prefer: "return=representation"
      }),
      body: JSON.stringify({
        child_id: childId,
        state,
        revision: nextRevision,
        updated_at: updatedAtIso
      })
    }
  );

  if (!patchResponse.ok) {
    throw new Error("Failed to save cloud game state.");
  }

  const patchedRows = (await patchResponse.json()) as GameStateRow[];
  const patched = rowToEnvelope(patchedRows[0]);
  if (patched) {
    return patched;
  }

  const currentRow = await fetchCurrentRow();
  if (currentRow) {
    const current = rowToEnvelope(currentRow);
    return current
      ? {
          ...current,
          conflict: true
        }
      : envelope;
  }

  const createResponse = await fetch(tableUrl("?select=id,child_id,state,revision,updated_at"), {
    method: "POST",
    headers: headers({
      Prefer: "return=representation"
    }),
    body: JSON.stringify({
      id: gameStateId,
      child_id: childId,
      state,
      revision: nextRevision,
      updated_at: updatedAtIso
    })
  });

  if (!createResponse.ok) {
    throw new Error("Failed to save cloud game state.");
  }

  const createdRows = (await createResponse.json()) as GameStateRow[];
  const created = rowToEnvelope(createdRows[0]);
  if (!created) {
    return envelope;
  }

  return created;
}
