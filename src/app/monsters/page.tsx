"use client";

import { AppShell } from "@/components/AppShell";
import { MonsterCard } from "@/components/MonsterCard";
import { NpcGuide } from "@/components/NpcGuide";
import { monsterForms } from "@/lib/defaultState";
import { useGame } from "@/lib/useGame";

export default function MonstersPage() {
  const { state } = useGame();
  const smallMonsters = state.monsters.filter((monster) => !monster.boss);
  const allSmallDefeated = smallMonsters.every((monster) => monster.defeated);

  return (
    <AppShell>
      <section className="grid gap-4">
        <div className="blue-title rounded-[2rem] p-5">
          <p className="text-sm font-black text-[#FFD84D]">怪兽挑战</p>
          <h1 className="text-3xl font-black sm:text-5xl">破解四小怪，挑战混乱大魔王</h1>
          <p className="mt-2 text-lg font-black text-white/90">第 {state.round} 轮 · Lv.{state.player.monsterStage}</p>
        </div>
        <NpcGuide state={state} scene="monsters" />
        <div className="quest-panel rounded-[2rem] p-4">
          <p className="mb-3 text-lg font-black">五级进化</p>
          <div className="grid gap-2 sm:grid-cols-5">
            {Object.entries(monsterForms).map(([level, label]) => (
              <div key={level} className="rounded-2xl border-4 border-[#18324A] bg-white p-3 text-center">
                <p className="text-sm font-black text-[#1167D8]">Level {level}</p>
                <p className="text-sm font-black">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {state.monsters.map((monster) => (
            <MonsterCard key={monster.id} monster={monster} locked={Boolean(monster.boss && !allSmallDefeated)} />
          ))}
        </div>
      </section>
    </AppShell>
  );
}
