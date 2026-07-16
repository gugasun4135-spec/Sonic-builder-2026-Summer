"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { DayModeSelector } from "@/components/DayModeSelector";
import { MonsterCard } from "@/components/MonsterCard";
import { NpcGuide } from "@/components/NpcGuide";
import { RewardCard } from "@/components/RewardCard";
import { SeasonProgress } from "@/components/SeasonProgress";
import { SyncStatusBadge } from "@/components/SyncStatusBadge";
import { TaskCard } from "@/components/TaskCard";
import { ToolPanel } from "@/components/ToolPanel";
import { useSound } from "@/lib/useSound";
import { useGame } from "@/lib/useGame";
import type { MapNode } from "@/lib/gameTypes";

function getTodayQuests(map: MapNode[]) {
  const handwriting = map.find((node) => node.id === "handwriting");
  const taekwondo = map.find((node) => node.id === "taekwondo-tower");
  const day = new Date().getDay();
  const quests = handwriting ? [handwriting] : [];

  if ((day === 4 || day === 5) && taekwondo) {
    quests.push({
      ...taekwondo,
      name: "跆拳道能量塔",
      subtitle: "周四 / 周五加练｜练体能，准备考级"
    });
  }

  return quests.length > 0 ? quests : map.filter((node) => node.status === "active" || node.status === "ongoing");
}

export default function HomePage() {
  const { state, dispatch, syncStatus } = useGame();
  const { play } = useSound();
  const smallMonsters = state.monsters.filter((monster) => !monster.boss);
  const boss = state.monsters.find((monster) => monster.boss);
  const allSmallDefeated = smallMonsters.every((monster) => monster.defeated);
  const activeMonster = allSmallDefeated ? boss : smallMonsters.find((monster) => !monster.defeated);
  const firstReward = state.rewards.find((reward) => !reward.claimed) ?? state.rewards[0];
  const todayQuests = getTodayQuests(state.map);

  return (
    <AppShell>
      <section className="grid gap-4">
        <div className="blue-title rounded-[2rem] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-[#FFD84D]">振予 Builder Quest</p>
              <h1 className="text-3xl font-black sm:text-5xl">暑假RPG闯关地图</h1>
            </div>
            <div className="star-pop rounded-3xl border-4 border-[#18324A] bg-[#FFD84D] px-5 py-3 text-center shadow">
              <p className="text-4xl font-black text-[#18324A]">{state.player.stars}</p>
              <p className="text-sm font-black text-[#18324A]">我的星星</p>
            </div>
          </div>
        </div>

        <NpcGuide state={state} scene="home" />
        <SyncStatusBadge status={syncStatus} />
        <DayModeSelector state={state} onSelect={(mode) => dispatch({ type: "SET_DAY_MODE", mode })} />
        <SeasonProgress state={state} />

        <div className="quest-panel rounded-[2rem] p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="grid gap-3">
              <p className="text-sm font-black text-[#1167D8]">今日主线</p>
              {todayQuests.map((quest) => (
                <div key={quest.id} className="rounded-3xl border-4 border-[#18324A] bg-white/75 px-4 py-3">
                  <h2 className="text-3xl font-black">{quest.name}</h2>
                  <p className="mt-1 text-lg font-black text-[#18324A]/75">{quest.subtitle}</p>
                </div>
              ))}
            </div>
            <a
              href="#today-challenge"
              onClick={() => play("npcAppear")}
              className="tap-card rounded-[1.75rem] border-4 border-[#18324A] bg-[#FF9F2E] px-6 py-4 text-center text-2xl font-black text-white shadow-[0_8px_0_rgba(24,50,74,0.18)]"
            >
              开始今日挑战
            </a>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div id="today-challenge" className="grid gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black">今日三关</h2>
              {state.dayCleared ? (
                <span className="rounded-full border-4 border-[#18324A] bg-[#64C86B] px-4 py-2 text-sm font-black text-white">
                  今日通关 +3
                </span>
              ) : null}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {state.tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={() => {
                    dispatch({ type: "COMPLETE_TASK", taskId: task.id });
                    play("taskComplete");
                    play("monsterHit");
                  }}
                />
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            {activeMonster ? <MonsterCard monster={activeMonster} locked={activeMonster.boss && !allSmallDefeated} /> : null}
            {firstReward ? (
              <RewardCard
                reward={firstReward}
                state={state}
                stars={state.player.stars}
                onClaim={() => {
                  dispatch({ type: "CLAIM_REWARD", rewardId: firstReward.id });
                  play("rewardClaimed");
                }}
              />
            ) : null}
            <div className="grid grid-cols-2 gap-3">
              <Link onClick={() => play("button")} className="rounded-3xl border-4 border-[#18324A] bg-[#1167D8] p-4 text-center text-lg font-black text-white shadow-[0_8px_0_rgba(24,50,74,0.16)]" href="/tasks">
                今日任务
              </Link>
              <Link onClick={() => play("button")} className="rounded-3xl border-4 border-[#18324A] bg-[#64C86B] p-4 text-center text-lg font-black text-white shadow-[0_8px_0_rgba(24,50,74,0.16)]" href="/map">
                暑假地图
              </Link>
              <Link onClick={() => play("button")} className="rounded-3xl border-4 border-[#18324A] bg-[#FFD84D] p-4 text-center text-lg font-black text-[#18324A] shadow-[0_8px_0_rgba(24,50,74,0.16)]" href="/rewards">
                奖励商店
              </Link>
              <Link onClick={() => play("button")} className="rounded-3xl border-4 border-[#18324A] bg-[#FF5A5A] p-4 text-center text-lg font-black text-white shadow-[0_8px_0_rgba(24,50,74,0.16)]" href="/monsters">
                怪兽挑战
              </Link>
            </div>
          </div>
        </div>
        <ToolPanel />
      </section>
    </AppShell>
  );
}
