import { NextResponse } from "next/server";
import { defaultGameState } from "@/lib/defaultState";
import { migrateGameState } from "@/lib/storage";
import type { GameState } from "@/lib/gameTypes";

export const dynamic = "force-dynamic";

type SupabaseGameRow = {
  id: string;
  child_id: string;
  state: GameState;
  revision: number;
  updated_at: string;
};

type GameStateEnvelope = {
  state: GameState;
  updatedAt: number;
  revision?: number;
};

const gameStateId = process.env.BQ_GAME_STATE_ID || "zhenyu-main";
const childId = process.env.BQ_CHILD_ID || "zhenyu";

function getSupabaseConfig() {
  const rawUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!rawUrl || !serviceRoleKey) {
    throw new Error("Supabase is not configured.");
  }

  const projectUrl = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");

  return {
    restUrl: `${projectUrl}/rest/v1`,
    serviceRoleKey
  };
}

function supabaseHeaders(serviceRoleKey: string) {
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json"
  };
}

function rowToEnvelope(row: SupabaseGameRow): GameStateEnvelope {
  return {
    state: migrateGameState(row.state),
    updatedAt: new Date(row.updated_at).getTime(),
    revision: row.revision
  };
}

async function fetchGameRow(): Promise<SupabaseGameRow | null> {
  const { restUrl, serviceRoleKey } = getSupabaseConfig();
  const response = await fetch(
    `${restUrl}/game_states?id=eq.${encodeURIComponent(gameStateId)}&select=id,child_id,state,revision,updated_at`,
    {
      headers: supabaseHeaders(serviceRoleKey),
      cache: "no-store"
    }
  );

  if (!response.ok) {
    throw new Error("Failed to read Supabase game state.");
  }

  const rows = (await response.json()) as SupabaseGameRow[];
  return rows[0] ?? null;
}

async function upsertGameState(state: GameState, revision: number) {
  const { restUrl, serviceRoleKey } = getSupabaseConfig();
  const response = await fetch(`${restUrl}/game_states?id=eq.${encodeURIComponent(gameStateId)}`, {
    method: "PATCH",
    headers: {
      ...supabaseHeaders(serviceRoleKey),
      Prefer: "return=representation"
    },
    body: JSON.stringify({
      state,
      revision,
      updated_at: new Date().toISOString()
    })
  });

  if (response.status !== 404 && response.ok) {
    const rows = (await response.json()) as SupabaseGameRow[];
    if (rows[0]) {
      return rows[0];
    }
  }

  const createResponse = await fetch(`${restUrl}/game_states`, {
    method: "POST",
    headers: {
      ...supabaseHeaders(serviceRoleKey),
      Prefer: "return=representation"
    },
    body: JSON.stringify({
      id: gameStateId,
      child_id: childId,
      state,
      revision,
      updated_at: new Date().toISOString()
    })
  });

  if (!createResponse.ok) {
    throw new Error("Failed to save Supabase game state.");
  }

  const rows = (await createResponse.json()) as SupabaseGameRow[];
  return rows[0] ?? null;
}

export async function GET() {
  try {
    const row = await fetchGameRow();

    if (row) {
      return NextResponse.json(rowToEnvelope(row));
    }

    const created = await upsertGameState(defaultGameState, 1);
    return NextResponse.json(created ? rowToEnvelope(created) : null);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to load game state."
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as Partial<GameStateEnvelope>;

    if (!body.state) {
      return NextResponse.json({ error: "Missing game state." }, { status: 400 });
    }

    const current = await fetchGameRow();
    const revision = (current?.revision ?? 0) + 1;
    const row = await upsertGameState(migrateGameState(body.state), revision);

    return NextResponse.json(row ? rowToEnvelope(row) : null);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to save game state."
      },
      { status: 500 }
    );
  }
}
