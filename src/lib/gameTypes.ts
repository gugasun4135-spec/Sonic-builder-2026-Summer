export type HelperId = "screw" | "nut";
export type TaskType = "focus" | "english" | "clean" | "extra";
export type MonsterLevel = 1 | 2 | 3 | 4 | 5;
export type DayMode = "normal" | "training" | "recovery";
export type NpcScene = "home" | "tasks" | "rewards" | "monsters" | "map";
export type NpcState = "default" | "started" | "halfDone" | "done" | "failed";

export type Player = {
  name: "振予";
  stars: number;
  level: number;
  selectedHelper: HelperId;
  monsterStage: MonsterLevel;
};

export type Task = {
  id: string;
  title: string;
  type: TaskType;
  stars: number;
  completed: boolean;
  date: string;
};

export type Reward = {
  id: string;
  name: string;
  cost: number;
  claimed: boolean;
  seasonPrize?: boolean;
};

export type Monster = {
  id: string;
  name: string;
  skill: string;
  level: MonsterLevel;
  hp: number;
  maxHp: number;
  hits: number;
  defeated: boolean;
  boss?: boolean;
};

export type MapNodeStatus = "locked" | "active" | "submitted" | "done" | "ongoing";

export type MapNode = {
  id: string;
  order?: number;
  name: string;
  subtitle: string;
  status: MapNodeStatus;
  date?: string;
  icon: string;
  sideQuest?: boolean;
};

export type DailyLog = {
  date: string;
  actions: string[];
  starsEarned: number;
  helper: HelperId;
  note?: string;
};

export type Settings = {
  soundEnabled: boolean;
  speechEnabled: boolean;
  dayMode: DayMode;
  dayModeLocked: boolean;
};

export type ProgressStats = {
  checkInDays: number;
  englishStreakTasks: number;
  baseResetTasks: number;
  completedMainNodes: number;
  countedDates: {
    checkIn: string[];
    english: string[];
    base: string[];
  };
};

export type GameState = {
  schemaVersion: number;
  player: Player;
  tasks: Task[];
  rewards: Reward[];
  monsters: Monster[];
  map: MapNode[];
  dayCleared: boolean;
  round: number;
  logs: DailyLog[];
  settings: Settings;
  progressStats: ProgressStats;
  toolState: {
    timerSeconds: number;
    timerRunning: boolean;
    timerStartedAt?: number;
    battleReport: string;
    reviveOpen: boolean;
    breakdownOpen: boolean;
  };
};

export type GameAction =
  | { type: "HYDRATE"; state: GameState }
  | { type: "SELECT_HELPER"; helper: HelperId }
  | { type: "COMPLETE_TASK"; taskId: string }
  | { type: "CLAIM_REWARD"; rewardId: string }
  | { type: "ADD_STARS"; amount: number }
  | { type: "SET_SOUND_ENABLED"; enabled: boolean }
  | { type: "SET_SPEECH_ENABLED"; enabled: boolean }
  | { type: "SET_DAY_MODE"; mode: DayMode }
  | { type: "SET_DAY_MODE_LOCKED"; locked: boolean }
  | { type: "SUBMIT_MAP_NODE"; nodeId: string }
  | { type: "CONFIRM_MAP_NODE"; nodeId: string }
  | { type: "START_TIMER"; seconds: number }
  | { type: "STOP_TIMER" }
  | { type: "SET_BATTLE_REPORT"; text: string }
  | { type: "TOGGLE_REVIVE_CARD" }
  | { type: "TOGGLE_BREAKDOWN_CARD" }
  | { type: "SET_TASK"; taskId: string; title: string; stars: number }
  | { type: "SET_TASK_COMPLETED"; taskId: string; completed: boolean }
  | { type: "SET_REWARD"; rewardId: string; cost: number; claimed: boolean }
  | { type: "SET_PROGRESS_STAT"; stat: keyof Omit<ProgressStats, "countedDates">; value: number }
  | { type: "SET_MONSTER_HP"; monsterId: string; hp: number }
  | { type: "SET_MONSTER_MAX_HP"; monsterId: string; maxHp: number }
  | { type: "SET_MONSTER_LEVEL"; monsterId: string; level: MonsterLevel }
  | { type: "SET_MONSTER_HITS"; monsterId: string; hits: number }
  | { type: "SET_MONSTER_DEFEATED"; monsterId: string; defeated: boolean }
  | { type: "SET_MAP_NODE_STATUS"; nodeId: string; status: MapNodeStatus }
  | { type: "SET_DAY_CLEARED"; cleared: boolean }
  | { type: "SET_ROUND"; round: number }
  | { type: "RESET_GAME" };
