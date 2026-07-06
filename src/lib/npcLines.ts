import type { GameState, HelperId, NpcScene, NpcState } from "./gameTypes";

export type NpcLine = {
  id: string;
  npc: HelperId;
  scene: NpcScene;
  state: NpcState;
  text: string;
};

export const npcLines: NpcLine[] = [
  { id: "s-home-default-1", npc: "screw", scene: "home", state: "default", text: "今天先打第一关，我们动起来！" },
  { id: "s-home-started-1", npc: "screw", scene: "home", state: "started", text: "很好，第一颗星星已经在路上了！" },
  { id: "s-home-done-1", npc: "screw", scene: "home", state: "done", text: "今日通关成功，Builder 太帅了！" },
  { id: "n-home-default-1", npc: "nut", scene: "home", state: "default", text: "先选最容易完成的一关，会更顺哦。" },
  { id: "n-home-started-1", npc: "nut", scene: "home", state: "started", text: "节奏不错，继续按任务卡走就很稳。" },
  { id: "n-home-done-1", npc: "nut", scene: "home", state: "done", text: "恭喜完成，记得去领取奖励。" },

  { id: "s-tasks-default-1", npc: "screw", scene: "tasks", state: "default", text: "先拿下一小关，马上就有星星！" },
  { id: "s-tasks-started-1", npc: "screw", scene: "tasks", state: "started", text: "很好，已经破开第一道门！" },
  { id: "s-tasks-half-1", npc: "screw", scene: "tasks", state: "halfDone", text: "已经打到一半了，再冲一下！" },
  { id: "s-tasks-done-1", npc: "screw", scene: "tasks", state: "done", text: "通关成功！今天太帅了！" },
  { id: "n-tasks-default-1", npc: "nut", scene: "tasks", state: "default", text: "建议从最简单的一关开始。" },
  { id: "n-tasks-started-1", npc: "nut", scene: "tasks", state: "started", text: "节奏不错，再完成一项就更稳了。" },
  { id: "n-tasks-half-1", npc: "nut", scene: "tasks", state: "halfDone", text: "现在只要保持节奏，不需要着急。" },
  { id: "n-tasks-done-1", npc: "nut", scene: "tasks", state: "done", text: "恭喜完成，奖励商店可以看一眼。" },

  { id: "s-rewards-default-1", npc: "screw", scene: "rewards", state: "default", text: "攒够星星就去换装备！" },
  { id: "s-rewards-started-1", npc: "screw", scene: "rewards", state: "started", text: "星星变多了，奖励快到手了！" },
  { id: "s-rewards-done-1", npc: "screw", scene: "rewards", state: "done", text: "兑换成功，宝箱开启！" },
  { id: "n-rewards-default-1", npc: "nut", scene: "rewards", state: "default", text: "建议先换低门槛奖励，成就感更快。" },
  { id: "n-rewards-started-1", npc: "nut", scene: "rewards", state: "started", text: "先看星星数量，再选择最合适的奖励。" },
  { id: "n-rewards-done-1", npc: "nut", scene: "rewards", state: "done", text: "兑换后星星会扣掉，计划得很好。" },

  { id: "s-monsters-default-1", npc: "screw", scene: "monsters", state: "default", text: "别怕，狠狠干一关！" },
  { id: "s-monsters-started-1", npc: "screw", scene: "monsters", state: "started", text: "怪兽已经掉血了，继续进攻！" },
  { id: "s-monsters-done-1", npc: "screw", scene: "monsters", state: "done", text: "四小怪倒下后，Boss 就会现身！" },
  { id: "n-monsters-default-1", npc: "nut", scene: "monsters", state: "default", text: "先看怪兽弱点，再出手更有效。" },
  { id: "n-monsters-started-1", npc: "nut", scene: "monsters", state: "started", text: "攻击有效，下一步继续完成任务。" },
  { id: "n-monsters-done-1", npc: "nut", scene: "monsters", state: "done", text: "Boss 战需要稳住节奏，一关一关打。" },

  { id: "s-map-default-1", npc: "screw", scene: "map", state: "default", text: "出发吧！暑假冒险家！" },
  { id: "n-map-default-1", npc: "nut", scene: "map", state: "default", text: "每一关都是成长的宝藏。" }
];

export function getTaskNpcState(state: GameState): NpcState {
  const completed = state.tasks.filter((task) => task.completed).length;

  if (completed === 0) {
    return "default";
  }

  if (completed === state.tasks.length) {
    return "done";
  }

  if (completed >= Math.ceil(state.tasks.length / 2)) {
    return "halfDone";
  }

  return "started";
}

export function getNpcLine(scene: NpcScene, state: GameState, override?: NpcState) {
  const npc = state.player.selectedHelper;
  const npcState = override ?? getTaskNpcState(state);
  const exactLines = npcLines.filter((line) => line.npc === npc && line.scene === scene && line.state === npcState);
  const fallbackLines = npcLines.filter((line) => line.npc === npc && line.scene === scene && line.state === "default");
  const lines = exactLines.length > 0 ? exactLines : fallbackLines;
  const seed = state.player.stars + state.tasks.filter((task) => task.completed).length + scene.length;

  return lines[seed % lines.length] ?? fallbackLines[0] ?? npcLines[0];
}
