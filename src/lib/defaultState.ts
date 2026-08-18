import type { GameState } from "./gameTypes";

const today = () => {
  const now = new Date();
  const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return localTime.toISOString().slice(0, 10);
};

export const monsterForms = {
  1: "基础形态",
  2: "原始石器风",
  3: "普通刀剑风",
  4: "铁甲铁武器风",
  5: "现代高科技风"
} as const;

export const defaultGameState: GameState = {
  schemaVersion: 4,
  player: {
    name: "振予",
    stars: 0,
    level: 1,
    selectedHelper: "screw",
    monsterStage: 1
  },
  tasks: [
    { id: "focus", title: "专注关", type: "focus", stars: 1, completed: false, date: today() },
    { id: "english", title: "英语关", type: "english", stars: 1, completed: false, date: today() },
    { id: "clean", title: "基地关", type: "clean", stars: 1, completed: false, date: today() },
    { id: "extra", title: "勇气加分关", type: "extra", stars: 1, completed: false, date: today() }
  ],
  rewards: [
    { id: "lego-parts", name: "小乐高零件袋", cost: 10, claimed: false },
    { id: "lego-dad", name: "和爸爸一起玩乐高30分钟", cost: 15, claimed: false },
    { id: "minecraft-lego", name: "我的世界乐高", cost: 35, claimed: false },
    { id: "robot-challenge", name: "机器人设计挑战", cost: 50, claimed: false },
    { id: "weekend-family", name: "周末亲子活动", cost: 70, claimed: false },
    { id: "z12-watch", name: "赛季大奖：Builder Watch Z12｜终极通讯装备", cost: 100, claimed: false, seasonPrize: true }
  ],
  monsters: [
    { id: "delay", name: "拖拖怪", skill: "3分钟启动", level: 1, hp: 16, maxHp: 16, hits: 0, defeated: false },
    { id: "focus", name: "分心怪", skill: "看任务卡", level: 1, hp: 18, maxHp: 18, hits: 0, defeated: false },
    { id: "mess", name: "乱乱怪", skill: "3分钟复位", level: 1, hp: 20, maxHp: 20, hits: 0, defeated: false },
    { id: "rush", name: "急急怪", skill: "暂停喝水", level: 1, hp: 22, maxHp: 22, hits: 0, defeated: false },
    {
      id: "boss",
      name: "四怪合体Boss：混乱大魔王",
      skill: "集齐四个破解技能",
      level: 1,
      hp: 36,
      maxHp: 36,
      hits: 0,
      defeated: false,
      boss: true
    }
  ],
  map: [
    {
      id: "swim-0705",
      order: 1,
      name: "7.5 海豚闪电杯",
      subtitle: "50米自由泳冲刺赛",
      date: "7.5",
      status: "done",
      icon: "dolphin"
    },
    {
      id: "base-build",
      order: 2,
      name: "基地建造计划",
      subtitle: "整理任务基地，开启暑假冒险",
      status: "done",
      icon: "base"
    },
    {
      id: "phuket-english",
      order: 3,
      name: "普吉英语冒险岛",
      subtitle: "7.25-7.31｜用英语探索世界",
      date: "7.25-7.31",
      status: "done",
      icon: "island"
    },
    {
      id: "vex-factory",
      order: 4,
      name: "VEX机器人工厂",
      subtitle: "8.1 / 8.4-8.9｜升级建造力",
      date: "8.1 / 8.4-8.9",
      status: "done",
      icon: "robot"
    },
    {
      id: "taekwondo-tower",
      order: 5,
      name: "跆拳道能量塔",
      subtitle: "8.10-8.23｜练体能，准备考级",
      date: "8.10-8.23",
      status: "active",
      icon: "taekwondo"
    },
    {
      id: "golf-camp",
      order: 6,
      name: "果岭挥杆挑战营",
      subtitle: "8.17-8.21｜高尔夫训练挑战",
      date: "8.17-8.21",
      status: "active",
      icon: "golf"
    },
    {
      id: "beijing-explore",
      order: 7,
      name: "北京城市探索篇",
      subtitle: "8.21-8.27｜发现城市和历史",
      date: "8.21-8.27",
      status: "locked",
      icon: "beijing"
    },
    {
      id: "handwriting",
      name: "神笔修炼营",
      subtitle: "整个暑期持续进行｜练字特训",
      status: "ongoing",
      icon: "brush",
      sideQuest: true
    }
  ],
  dayCleared: false,
  round: 1,
  logs: [],
  settings: {
    soundEnabled: true,
    speechEnabled: false,
    dayMode: "normal",
    dayModeLocked: false
  },
  progressStats: {
    checkInDays: 0,
    englishStreakTasks: 0,
    baseResetTasks: 0,
    completedMainNodes: 0,
    countedDates: {
      checkIn: [],
      english: [],
      base: []
    }
  },
  toolState: {
    timerSeconds: 180,
    timerRunning: false,
    battleReport: "",
    reviveOpen: false,
    breakdownOpen: false
  }
};
