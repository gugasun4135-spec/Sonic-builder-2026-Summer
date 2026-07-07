import { defaultGameState } from "./defaultState";
import type { GameAction, GameState, MapNode, Monster } from "./gameTypes";

const taskDamage = 4;
const dailyBonusStars = 3;
const dailyBonusDamage = 8;
const today = () => new Date().toISOString().slice(0, 10);

export const seasonRequirements = [
  { id: "stars", label: "当前星星", target: 100 },
  { id: "checkInDays", label: "上线天数", target: 20 },
  { id: "englishStreakTasks", label: "英语不断线", target: 20 },
  { id: "baseResetTasks", label: "基地复位", target: 20 },
  { id: "completedMainNodes", label: "主线节点", target: 2 }
] as const;

function cloneDefaultState(): GameState {
  return JSON.parse(JSON.stringify(defaultGameState)) as GameState;
}

function getActiveMonster(monsters: Monster[]) {
  const smallMonsters = monsters.filter((monster) => !monster.boss);
  const boss = monsters.find((monster) => monster.boss);
  const allSmallDefeated = smallMonsters.every((monster) => monster.defeated);

  if (allSmallDefeated && boss && !boss.defeated) {
    return boss;
  }

  return smallMonsters.find((monster) => !monster.defeated);
}

function damageMonster(monsters: Monster[], damage: number) {
  const activeMonster = getActiveMonster(monsters);

  if (!activeMonster) {
    return monsters;
  }

  return monsters.map((monster) => {
    if (monster.id !== activeMonster.id) {
      return monster;
    }

    const hp = Math.max(0, monster.hp - damage);
    return {
      ...monster,
      hp,
      defeated: hp === 0
    };
  });
}

function addDailyAction(state: GameState, actionName: string, starsEarned: number): GameState {
  const date = today();
  const existingLog = state.logs.find((log) => log.date === date);
  const logs = existingLog
    ? state.logs.map((log) =>
        log.date === date
          ? {
              ...log,
              actions: log.actions.includes(actionName) ? log.actions : [...log.actions, actionName],
              starsEarned: log.starsEarned + starsEarned,
              helper: state.player.selectedHelper
            }
          : log
      )
    : [
        ...state.logs,
        {
          date,
          actions: [actionName],
          starsEarned,
          helper: state.player.selectedHelper
        }
      ];
  const countedCheckIn = state.progressStats.countedDates.checkIn.includes(date);

  return {
    ...state,
    logs,
    progressStats: countedCheckIn
      ? state.progressStats
      : {
          ...state.progressStats,
          checkInDays: state.progressStats.checkInDays + 1,
          countedDates: {
            ...state.progressStats.countedDates,
            checkIn: [...state.progressStats.countedDates.checkIn, date]
          }
        }
  };
}

function addTaskStats(state: GameState, taskType: string): GameState {
  const date = today();
  let progressStats = state.progressStats;

  if (taskType === "english" && !progressStats.countedDates.english.includes(date)) {
    progressStats = {
      ...progressStats,
      englishStreakTasks: progressStats.englishStreakTasks + 1,
      countedDates: {
        ...progressStats.countedDates,
        english: [...progressStats.countedDates.english, date]
      }
    };
  }

  if (taskType === "clean" && !progressStats.countedDates.base.includes(date)) {
    progressStats = {
      ...progressStats,
      baseResetTasks: progressStats.baseResetTasks + 1,
      countedDates: {
        ...progressStats.countedDates,
        base: [...progressStats.countedDates.base, date]
      }
    };
  }

  return { ...state, progressStats };
}

export function getWatchMissingRequirements(state: GameState) {
  return seasonRequirements
    .map((item) => ({
      ...item,
      current: item.id === "stars" ? state.player.stars : state.progressStats[item.id]
    }))
    .filter((item) => item.current < item.target);
}

export function canClaimReward(state: GameState, rewardId: string) {
  const reward = state.rewards.find((item) => item.id === rewardId);

  if (!reward || reward.claimed || state.player.stars < reward.cost) {
    return false;
  }

  if (reward.seasonPrize) {
    return getWatchMissingRequirements(state).length === 0;
  }

  return true;
}

function resetForNextRound(state: GameState): GameState {
  const nextRound = state.round + 1;
  const nextLevel = Math.min(5, state.player.monsterStage + 1) as GameState["player"]["monsterStage"];

  return {
    ...state,
    round: nextRound,
    dayCleared: false,
    player: {
      ...state.player,
      level: state.player.level + 1,
      monsterStage: nextLevel
    },
    monsters: state.monsters.map((monster, index) => {
      const maxHp = (monster.boss ? 36 : 16 + index * 2) + nextRound * 6;
      return {
        ...monster,
        level: nextLevel,
        hp: maxHp,
        maxHp,
        defeated: false
      };
    })
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "HYDRATE":
      return action.state;

    case "SELECT_HELPER":
      return {
        ...state,
        player: { ...state.player, selectedHelper: action.helper }
      };

    case "COMPLETE_TASK": {
      const task = state.tasks.find((item) => item.id === action.taskId);

      if (!task || task.completed) {
        return state;
      }

      const tasks = state.tasks.map((item) =>
        item.id === action.taskId ? { ...item, completed: true } : item
      );
      const allDone = tasks.every((item) => item.completed);
      const firstClear = allDone && !state.dayCleared;
      const checkInBonus = state.progressStats.countedDates.checkIn.includes(today()) ? 0 : 1;
      const starsGained = task.stars + checkInBonus + (firstClear ? dailyBonusStars : 0);
      const totalDamage = taskDamage + (firstClear ? dailyBonusDamage : 0);
      const damagedMonsters = damageMonster(state.monsters, totalDamage);
      const nextState = addTaskStats(addDailyAction({
        ...state,
        tasks,
        dayCleared: firstClear ? true : state.dayCleared,
        player: {
          ...state.player,
          stars: state.player.stars + starsGained
        },
        monsters: damagedMonsters
      }, `完成${task.title}`, starsGained), task.type);
      const boss = nextState.monsters.find((monster) => monster.boss);

      if (boss?.defeated) {
        return resetForNextRound(nextState);
      }

      return nextState;
    }

    case "CLAIM_REWARD": {
      const reward = state.rewards.find((item) => item.id === action.rewardId);

      if (!reward || !canClaimReward(state, reward.id)) {
        return state;
      }

      return {
        ...state,
        player: {
          ...state.player,
          stars: state.player.stars - reward.cost
        },
        rewards: state.rewards.map((item) =>
          item.id === reward.id ? { ...item, claimed: true } : item
        )
      };
    }

    case "ADD_STARS":
      return {
        ...state,
        player: {
          ...state.player,
          stars: Math.max(0, state.player.stars + action.amount)
        }
      };

    case "SET_SOUND_ENABLED":
      return {
        ...state,
        settings: {
          ...state.settings,
          soundEnabled: action.enabled
        }
      };

    case "SET_SPEECH_ENABLED":
      return {
        ...state,
        settings: {
          ...state.settings,
          speechEnabled: action.enabled
        }
      };

    case "SET_DAY_MODE":
      if (state.settings.dayModeLocked) {
        return state;
      }

      return {
        ...state,
        settings: {
          ...state.settings,
          dayMode: action.mode
        }
      };

    case "SET_DAY_MODE_LOCKED":
      return {
        ...state,
        settings: {
          ...state.settings,
          dayModeLocked: action.locked
        }
      };

    case "SUBMIT_MAP_NODE": {
      const node = state.map.find((item) => item.id === action.nodeId);
      if (!node || node.status !== "active") {
        return state;
      }

      return addDailyAction(
        {
          ...state,
          player: {
            ...state.player,
            stars: state.player.stars + 1
          },
          map: state.map.map((item) =>
            item.id === action.nodeId ? { ...item, status: "submitted" } : item
          )
        },
        `提交地图节点：${node.name}`,
        1
      );
    }

    case "CONFIRM_MAP_NODE": {
      const map: MapNode[] = state.map.map((node) =>
        node.id === action.nodeId ? { ...node, status: "done" } : node
      );
      return {
        ...state,
        map,
        progressStats: {
          ...state.progressStats,
          completedMainNodes: map.filter((node) => !node.sideQuest && node.status === "done").length
        }
      };
    }

    case "START_TIMER":
      return {
        ...state,
        toolState: {
          ...state.toolState,
          timerSeconds: action.seconds,
          timerRunning: true,
          timerStartedAt: Date.now()
        }
      };

    case "STOP_TIMER":
      return {
        ...state,
        toolState: {
          ...state.toolState,
          timerRunning: false,
          timerStartedAt: undefined
        }
      };

    case "SET_BATTLE_REPORT":
      return {
        ...state,
        toolState: {
          ...state.toolState,
          battleReport: action.text
        }
      };

    case "TOGGLE_REVIVE_CARD":
      return {
        ...state,
        toolState: {
          ...state.toolState,
          reviveOpen: !state.toolState.reviveOpen
        }
      };

    case "TOGGLE_BREAKDOWN_CARD":
      return {
        ...state,
        toolState: {
          ...state.toolState,
          breakdownOpen: !state.toolState.breakdownOpen
        }
      };

    case "SET_TASK":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.taskId ? { ...task, title: action.title, stars: action.stars } : task
        )
      };

    case "SET_PROGRESS_STAT":
      return {
        ...state,
        progressStats: {
          ...state.progressStats,
          [action.stat]: Math.max(0, action.value)
        }
      };

    case "SET_MONSTER_HP":
      return {
        ...state,
        monsters: state.monsters.map((monster) =>
          monster.id === action.monsterId
            ? { ...monster, hp: Math.max(0, action.hp), defeated: action.hp <= 0 }
            : monster
        )
      };

    case "SET_MONSTER_DEFEATED":
      return {
        ...state,
        monsters: state.monsters.map((monster) =>
          monster.id === action.monsterId
            ? { ...monster, defeated: action.defeated, hp: action.defeated ? 0 : monster.maxHp }
            : monster
        )
      };

    case "SET_MAP_NODE_STATUS":
      const map = state.map.map((node) =>
        node.id === action.nodeId ? { ...node, status: action.status } : node
      );

      return {
        ...state,
        map,
        progressStats: {
          ...state.progressStats,
          completedMainNodes: map.filter((node) => !node.sideQuest && node.status === "done").length
        }
      };

    case "RESET_GAME":
      return cloneDefaultState();

    default:
      return state;
  }
}
