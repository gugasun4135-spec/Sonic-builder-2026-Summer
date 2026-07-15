import { defaultGameState } from "./defaultState";
import type { GameState } from "./gameTypes";

export const storageKey = "bq_game_state_v1";
const legacyKeys = ["bq_game_state"];
const today = () => {
  const now = new Date();
  const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return localTime.toISOString().slice(0, 10);
};

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

function normalizeMapProgress(map: GameState["map"]): GameState["map"] {
  return map.map((node) =>
    node.id === "swim-0705" || node.id === "base-build" ? { ...node, status: "done" } : node
  );
}

function normalizeTasksForToday(tasks: GameState["tasks"], logs: GameState["logs"]): {
  tasks: GameState["tasks"];
  dayClearedReset: boolean;
} {
  const date = today();
  const todayLog = logs.find((log) => log.date === date);
  const hasOldTask = tasks.some((task) => task.date !== date);
  const hasUnloggedCompletedTask = tasks.some(
    (task) => task.completed && !todayLog?.actions.includes(`完成${task.title}`)
  );

  if (!hasOldTask && !hasUnloggedCompletedTask) {
    return { tasks, dayClearedReset: false };
  }

  return {
    tasks: tasks.map((task) => ({
      ...task,
      completed: task.date === date && todayLog?.actions.includes(`完成${task.title}`) ? task.completed : false,
      date
    })),
    dayClearedReset: true
  };
}

export function migrateGameState(oldState: unknown): GameState {
  const saved = (oldState && typeof oldState === "object" ? oldState : {}) as Partial<GameState> & {
    version?: number;
    soundEnabled?: boolean;
  };

  const map = normalizeMapProgress(mergeById(defaultGameState.map, saved.map));
  const completedMainNodes = map.filter((node) => !node.sideQuest && node.status === "done").length;
  const logs = Array.isArray(saved.logs) ? saved.logs : [];
  const normalizedTasks = normalizeTasksForToday(mergeById(defaultGameState.tasks, saved.tasks), logs);

  return {
    ...defaultGameState,
    ...saved,
    schemaVersion: defaultGameState.schemaVersion,
    player: {
      ...defaultGameState.player,
      ...saved.player,
      name: "振予"
    },
    tasks: normalizedTasks.tasks,
    rewards: mergeRewards(defaultGameState.rewards, saved.rewards),
    monsters: mergeById(defaultGameState.monsters, saved.monsters),
    map,
    dayCleared: normalizedTasks.dayClearedReset ? false : saved.dayCleared ?? defaultGameState.dayCleared,
    logs,
    settings: {
      ...defaultGameState.settings,
      ...saved.settings,
      soundEnabled: saved.settings?.soundEnabled ?? saved.soundEnabled ?? defaultGameState.settings.soundEnabled
    },
    progressStats: {
      ...defaultGameState.progressStats,
      ...saved.progressStats,
      completedMainNodes,
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

  try {
    window.localStorage?.setItem(storageKey, JSON.stringify(state));
  } catch {
    // Some Pad browsers or privacy modes disable localStorage. Cloud sync remains the source of truth.
  }
}
