import { defaultGameState } from "./defaultState";
import type { GameState, MapNode, MapNodeStatus } from "./gameTypes";

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

function mergeMap(defaults: GameState["map"], saved: GameState["map"] | undefined): GameState["map"] {
  return defaults.map((node) => {
    const savedNode = saved?.find((candidate) => candidate.id === node.id);
    return savedNode ? { ...node, status: savedNode.status } : node;
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

function parseSummerDate(value: string) {
  const [month, day] = value.split(".").map(Number);
  return new Date(2026, month - 1, day);
}

function scheduleStatus(nodeId: string, now = new Date()): MapNodeStatus | null {
  const schedules: Record<string, { start: string; end: string }> = {
    "phuket-english": { start: "7.25", end: "7.31" },
    "vex-factory": { start: "8.1", end: "8.9" },
    "taekwondo-tower": { start: "8.10", end: "8.23" },
    "golf-camp": { start: "8.17", end: "8.21" },
    "beijing-explore": { start: "8.21", end: "8.27" }
  };
  const schedule = schedules[nodeId];

  if (!schedule) {
    return null;
  }

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = parseSummerDate(schedule.start);
  const end = parseSummerDate(schedule.end);

  if (todayStart < start) {
    return "locked";
  }

  if (todayStart > end) {
    return "done";
  }

  return "active";
}

function normalizeMapProgress(map: GameState["map"]): GameState["map"] {
  return map.map((node): MapNode => {
    if (node.id === "swim-0705" || node.id === "base-build") {
      return { ...node, status: "done" };
    }

    if (node.sideQuest) {
      return { ...node, status: "ongoing" };
    }

    if (node.status === "done" || node.status === "submitted") {
      return node;
    }

    const status = scheduleStatus(node.id);
    return status ? { ...node, status } : node;
  });
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

  const map = normalizeMapProgress(mergeMap(defaultGameState.map, saved.map));
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
