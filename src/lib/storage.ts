import { defaultGameState } from "./defaultState";
import type { GameState } from "./gameTypes";

export const storageKey = "bq_game_state_v1";
const legacyKeys = ["bq_game_state"];

function mergeById<T extends { id: string }>(defaults: T[], saved: T[] | undefined): T[] {
  return defaults.map((item) => {
    const savedItem = saved?.find((candidate) => candidate.id === item.id);
    return savedItem ? { ...item, ...savedItem } : item;
  });
}

function mergeRewards(defaults: GameState["rewards"], saved: GameState["rewards"] | undefined): GameState["rewards"] {
  return defaults.map((reward) => {
    const savedReward = saved?.find((candidate) => candidate.id === reward.id);
    return {
      ...reward,
      claimed: savedReward?.claimed ?? reward.claimed
    };
  });
}

export function migrateGameState(oldState: unknown): GameState {
  const saved = (oldState && typeof oldState === "object" ? oldState : {}) as Partial<GameState> & {
    version?: number;
    soundEnabled?: boolean;
  };

  return {
    ...defaultGameState,
    ...saved,
    schemaVersion: defaultGameState.schemaVersion,
    player: {
      ...defaultGameState.player,
      ...saved.player,
      name: "振予"
    },
    tasks: mergeById(defaultGameState.tasks, saved.tasks),
    rewards: mergeRewards(defaultGameState.rewards, saved.rewards),
    monsters: mergeById(defaultGameState.monsters, saved.monsters),
    map: mergeById(defaultGameState.map, saved.map),
    logs: Array.isArray(saved.logs) ? saved.logs : [],
    settings: {
      ...defaultGameState.settings,
      ...saved.settings,
      soundEnabled: saved.settings?.soundEnabled ?? saved.soundEnabled ?? defaultGameState.settings.soundEnabled
    },
    progressStats: {
      ...defaultGameState.progressStats,
      ...saved.progressStats,
      countedDates: {
        ...defaultGameState.progressStats.countedDates,
        ...saved.progressStats?.countedDates
      }
    },
    toolState: {
      ...defaultGameState.toolState,
      ...saved.toolState
    }
  };
}

export function loadGameState(): GameState {
  if (typeof window === "undefined") {
    return defaultGameState;
  }

  try {
    const raw = window.localStorage.getItem(storageKey) ?? legacyKeys.map((key) => window.localStorage.getItem(key)).find(Boolean);
    if (!raw) {
      return defaultGameState;
    }

    return migrateGameState(JSON.parse(raw));
  } catch {
    return defaultGameState;
  }
}

export function saveGameState(state: GameState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(state));
}
