"use client";

import { AppShell } from "@/components/AppShell";
import { seasonRequirements } from "@/lib/gameRules";
import { useGame } from "@/lib/useGame";
import { migrateGameState } from "@/lib/storage";
import { createSyncUrl } from "@/lib/syncState";
import type { MapNodeStatus, MonsterLevel, ProgressStats } from "@/lib/gameTypes";
import { useEffect, useState, type ReactNode } from "react";

type EditableProgressStat = keyof Omit<ProgressStats, "countedDates">;

const editableProgressStats: Array<{
  id: EditableProgressStat;
  label: string;
  target: number;
}> = seasonRequirements
  .filter((item) => item.id !== "stars")
  .map((item) => ({
    id: item.id,
    label: item.label,
    target: item.target
  }));

export default function ParentPage() {
  const { state, dispatch, syncStatus } = useGame();
  const [syncUrl, setSyncUrl] = useState("");
  const [syncCopied, setSyncCopied] = useState(false);
  const [blockedOnTouchDevice, setBlockedOnTouchDevice] = useState(false);

  useEffect(() => {
    const coarsePointer = window.matchMedia?.("(pointer: coarse)").matches ?? false;
    setBlockedOnTouchDevice(coarsePointer || window.innerWidth < 900);
  }, []);

  function exportGame() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `builder-quest-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function importGame(file: File) {
    const text = await file.text();
    dispatch({ type: "HYDRATE", state: migrateGameState(JSON.parse(text)) });
  }

  async function copyPadSyncLink() {
    const url = createSyncUrl(state);
    setSyncUrl(url);
    setSyncCopied(false);

    try {
      await navigator.clipboard.writeText(url);
      setSyncCopied(true);
    } catch {
      setSyncCopied(false);
    }
  }

  if (blockedOnTouchDevice) {
    return (
      <AppShell>
        <section className="grid gap-4">
          <div className="blue-title rounded-[2rem] p-5">
            <p className="text-sm font-black text-[#FFD84D]">家长模式</p>
            <h1 className="text-3xl font-black sm:text-5xl">请在电脑端打开</h1>
            <p className="mt-2 text-lg font-black text-white/90">
              Pad 端不能调整星星。振予只能通过打卡获得星星，家长控制请回到电脑操作。
            </p>
          </div>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="grid gap-4">
        <div className="blue-title rounded-[2rem] p-5">
          <p className="text-sm font-black text-[#FFD84D]">家长模式</p>
          <h1 className="text-3xl font-black sm:text-5xl">控制台</h1>
          <p className="mt-2 text-lg font-black text-white/90">
            当前星星：{state.player.stars}｜同步状态：{syncStatus === "synced" ? "云端已同步" : syncStatus === "loading" ? "正在同步" : syncStatus === "error" ? "云端异常" : "本地模式"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1, 5, -1, -5].map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => dispatch({ type: "ADD_STARS", amount })}
              className="tap-card rounded-3xl bg-white p-5 text-xl font-black shadow-soft"
            >
              {amount > 0 ? "+" : ""}
              {amount} 星
            </button>
          ))}
        </div>

        <section className="rounded-[2rem] border-4 border-[#18324A] bg-[#FFF5D6] p-5 shadow-[0_8px_0_rgba(24,50,74,0.16)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-black">音效反馈</h2>
              <p className="text-base font-black text-[#18324A]/70">
                点击、完成任务、获得星星、兑换奖励都会播放轻量音效。
              </p>
            </div>
            <button
              type="button"
              onClick={() => dispatch({ type: "SET_SOUND_ENABLED", enabled: !state.settings.soundEnabled })}
              className={`tap-card rounded-3xl border-4 border-[#18324A] px-6 py-4 text-xl font-black shadow-[0_8px_0_rgba(24,50,74,0.16)] ${
                state.settings.soundEnabled ? "bg-[#64C86B] text-white" : "bg-white text-[#18324A]"
              }`}
            >
              {state.settings.soundEnabled ? "音效开启" : "音效关闭"}
            </button>
          </div>
        </section>

        <section className="rounded-[2rem] border-4 border-[#18324A] bg-white p-5 shadow-[0_8px_0_rgba(24,50,74,0.16)]">
          <h2 className="mb-4 text-2xl font-black">数据与模式</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <button type="button" onClick={exportGame} className="rounded-3xl border-4 border-[#18324A] bg-[#FFD84D] p-4 font-black">
              导出游戏记录
            </button>
            <label className="rounded-3xl border-4 border-[#18324A] bg-[#DFF4FF] p-4 text-center font-black">
              导入游戏记录
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    void importGame(file);
                  }
                }}
              />
            </label>
            <button
              type="button"
              onClick={() => dispatch({ type: "SET_DAY_MODE_LOCKED", locked: !state.settings.dayModeLocked })}
              className="rounded-3xl border-4 border-[#18324A] bg-[#FFF5D6] p-4 font-black"
            >
              {state.settings.dayModeLocked ? "解除模式锁定" : "锁定今日模式"}
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: "SET_SPEECH_ENABLED", enabled: !state.settings.speechEnabled })}
              className="rounded-3xl border-4 border-[#18324A] bg-[#64C86B] p-4 font-black text-white"
            >
              NPC朗读：{state.settings.speechEnabled ? "开" : "关"}
            </button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="rounded-3xl bg-slate-50 p-4 font-black">
              难度轮次
              <input
                type="number"
                min={1}
                value={state.round}
                onChange={(event) => dispatch({ type: "SET_ROUND", round: Number(event.target.value) })}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-lg font-black"
              />
            </label>
            <button
              type="button"
              onClick={() => dispatch({ type: "SET_DAY_CLEARED", cleared: !state.dayCleared })}
              className="rounded-3xl border-4 border-[#18324A] bg-[#DFF4FF] p-4 font-black"
            >
              今日通关：{state.dayCleared ? "是" : "否"}
            </button>
            <label className="rounded-3xl bg-slate-50 p-4 font-black">
              玩家等级
              <input
                type="number"
                min={1}
                value={state.player.level}
                onChange={(event) =>
                  dispatch({ type: "HYDRATE", state: { ...state, player: { ...state.player, level: Number(event.target.value) } } })
                }
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-lg font-black"
              />
            </label>
            <label className="rounded-3xl bg-slate-50 p-4 font-black">
              当前星星
              <input
                type="number"
                min={0}
                value={state.player.stars}
                onChange={(event) =>
                  dispatch({ type: "HYDRATE", state: { ...state, player: { ...state.player, stars: Math.max(0, Number(event.target.value)) } } })
                }
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-lg font-black"
              />
            </label>
          </div>
        </section>

        <section className="rounded-[2rem] border-4 border-[#18324A] bg-[#DFF4FF] p-5 shadow-[0_8px_0_rgba(24,50,74,0.16)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-2xl font-black">同步到 Pad</h2>
              <p className="mt-1 text-base font-black text-[#18324A]/70">
                推荐开启云同步后自动同步。未配置云同步时，可复制链接发到 Pad 做一次性导入。
              </p>
            </div>
            <button
              type="button"
              onClick={() => void copyPadSyncLink()}
              className="rounded-3xl border-4 border-[#18324A] bg-[#1167D8] px-6 py-4 text-xl font-black text-white"
            >
              {syncCopied ? "已复制" : "复制Pad同步链接"}
            </button>
          </div>
          {syncUrl ? (
            <textarea
              readOnly
              value={syncUrl}
              className="mt-4 min-h-28 w-full rounded-3xl border-4 border-[#18324A] bg-white p-4 text-sm font-bold"
            />
          ) : null}
        </section>

        <Panel title="任务设置">
          <div className="grid gap-3">
            {state.tasks.map((task) => (
              <div key={task.id} className="grid gap-2 rounded-3xl bg-slate-50 p-4 sm:grid-cols-[1fr_7rem_8rem]">
                <input
                  value={task.title}
                  onChange={(event) =>
                    dispatch({ type: "SET_TASK", taskId: task.id, title: event.target.value, stars: task.stars })
                  }
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-lg font-bold"
                />
                <input
                  type="number"
                  min={0}
                  value={task.stars}
                  onChange={(event) =>
                    dispatch({
                      type: "SET_TASK",
                      taskId: task.id,
                      title: task.title,
                      stars: Number(event.target.value)
                    })
                  }
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-lg font-bold"
                />
                <button
                  type="button"
                  onClick={() => dispatch({ type: "SET_TASK_COMPLETED", taskId: task.id, completed: !task.completed })}
                  className={`rounded-2xl px-4 py-3 font-black ${
                    task.completed ? "bg-[#64C86B] text-white" : "bg-white text-[#18324A]"
                  }`}
                >
                  {task.completed ? "已完成" : "未完成"}
                </button>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="奖励控制">
          <div className="grid gap-3 sm:grid-cols-2">
            {state.rewards.map((reward) => (
              <div key={reward.id} className="grid gap-3 rounded-3xl bg-slate-50 p-4 sm:grid-cols-[1fr_8rem_8rem]">
                <div>
                  <p className="text-lg font-black">{reward.name}</p>
                  <p className="text-sm font-bold text-slate-500">当前成本 {reward.cost} 星</p>
                </div>
                <input
                  type="number"
                  min={0}
                  value={reward.cost}
                  onChange={(event) =>
                    dispatch({ type: "SET_REWARD", rewardId: reward.id, cost: Number(event.target.value), claimed: reward.claimed })
                  }
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-lg font-bold"
                />
                <button
                  type="button"
                  onClick={() => dispatch({ type: "SET_REWARD", rewardId: reward.id, cost: reward.cost, claimed: !reward.claimed })}
                  className={`rounded-2xl px-4 py-3 font-black ${
                    reward.claimed ? "bg-[#64C86B] text-white" : "bg-white text-[#18324A]"
                  }`}
                >
                  {reward.claimed ? "已兑换" : "未兑换"}
                </button>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="赛季目标数据">
          <div className="grid gap-3 sm:grid-cols-2">
            {editableProgressStats.map((item) => {
              const value = state.progressStats[item.id];
              return (
                <div key={item.id} className="rounded-3xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-black">{item.label}</p>
                      <p className="text-sm font-bold text-slate-500">
                        目标 {item.target}，当前 {value}/{item.target}
                      </p>
                    </div>
                    <input
                      type="number"
                      min={0}
                      max={item.target}
                      value={value}
                      onChange={(event) =>
                        dispatch({
                          type: "SET_PROGRESS_STAT",
                          stat: item.id,
                          value: Number(event.target.value)
                        })
                      }
                      className="w-24 rounded-2xl border border-slate-200 px-4 py-3 text-lg font-black"
                    />
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        dispatch({ type: "SET_PROGRESS_STAT", stat: item.id, value: Math.max(0, value - 1) })
                      }
                      className="rounded-2xl border-4 border-[#18324A] bg-white px-3 py-2 font-black"
                    >
                      -1
                    </button>
                    <button
                      type="button"
                      onClick={() => dispatch({ type: "SET_PROGRESS_STAT", stat: item.id, value: item.target })}
                      className="rounded-2xl border-4 border-[#18324A] bg-[#FFD84D] px-3 py-2 font-black"
                    >
                      满格
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        dispatch({
                          type: "SET_PROGRESS_STAT",
                          stat: item.id,
                          value: Math.min(item.target, value + 1)
                        })
                      }
                      className="rounded-2xl border-4 border-[#18324A] bg-[#64C86B] px-3 py-2 font-black text-white"
                    >
                      +1
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel title="怪兽控制">
          <div className="grid gap-3">
            {state.monsters.map((monster) => (
              <div key={monster.id} className="grid gap-2 rounded-3xl bg-slate-50 p-4 sm:grid-cols-[1fr_7rem_7rem_7rem_7rem_8rem]">
                <div>
                  <p className="text-lg font-black">{monster.name}</p>
                  <p className="text-sm font-bold text-slate-500">
                    HP {monster.hp}/{monster.maxHp}｜击打 {monster.hits} 次
                  </p>
                </div>
                <select
                  value={monster.level}
                  onChange={(event) =>
                    dispatch({ type: "SET_MONSTER_LEVEL", monsterId: monster.id, level: Number(event.target.value) as MonsterLevel })
                  }
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-lg font-bold"
                >
                  <option value={1}>Lv.1</option>
                  <option value={2}>Lv.2</option>
                  <option value={3}>Lv.3</option>
                  <option value={4}>Lv.4</option>
                  <option value={5}>Lv.5</option>
                </select>
                <input
                  type="number"
                  min={0}
                  value={monster.hp}
                  onChange={(event) =>
                    dispatch({ type: "SET_MONSTER_HP", monsterId: monster.id, hp: Number(event.target.value) })
                  }
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-lg font-bold"
                />
                <input
                  type="number"
                  min={1}
                  value={monster.maxHp}
                  onChange={(event) =>
                    dispatch({ type: "SET_MONSTER_MAX_HP", monsterId: monster.id, maxHp: Number(event.target.value) })
                  }
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-lg font-bold"
                  aria-label={`${monster.name} 最大HP`}
                />
                <input
                  type="number"
                  min={0}
                  value={monster.hits}
                  onChange={(event) =>
                    dispatch({ type: "SET_MONSTER_HITS", monsterId: monster.id, hits: Number(event.target.value) })
                  }
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-lg font-bold"
                  aria-label={`${monster.name} 击打次数`}
                />
                <button
                  type="button"
                  onClick={() =>
                    dispatch({ type: "SET_MONSTER_DEFEATED", monsterId: monster.id, defeated: !monster.defeated })
                  }
                  className="rounded-2xl bg-slate-900 px-4 py-3 font-black text-white"
                >
                  {monster.defeated ? "恢复" : "击败"}
                </button>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="地图控制">
          <div className="grid gap-3">
            {state.map.map((node) => (
              <div key={node.id} className="grid gap-2 rounded-3xl bg-slate-50 p-4 sm:grid-cols-[1fr_10rem]">
                <p className="text-lg font-black">{node.name}</p>
                <select
                  value={node.status}
                  onChange={(event) =>
                    dispatch({
                      type: "SET_MAP_NODE_STATUS",
                      nodeId: node.id,
                      status: event.target.value as MapNodeStatus
                    })
                  }
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-lg font-bold"
                >
                  <option value="locked">未解锁</option>
                  <option value="active">进行中</option>
                  <option value="submitted">等待确认</option>
                  <option value="done">已完成</option>
                  <option value="ongoing">长期支线</option>
                </select>
                {node.status === "submitted" ? (
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "CONFIRM_MAP_NODE", nodeId: node.id })}
                    className="rounded-2xl bg-[#64C86B] px-4 py-3 font-black text-white"
                  >
                    确认完成
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </Panel>

        <button
          type="button"
          onClick={() => {
            if (window.confirm("确定重置全部进度吗？")) {
              dispatch({ type: "RESET_GAME" });
            }
          }}
          className="tap-card rounded-[2rem] bg-rose-600 p-5 text-2xl font-black text-white shadow-soft"
        >
          重置全部进度
        </button>
      </section>
    </AppShell>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[2rem] bg-white p-5 shadow-soft">
      <h2 className="mb-4 text-2xl font-black">{title}</h2>
      {children}
    </section>
  );
}
