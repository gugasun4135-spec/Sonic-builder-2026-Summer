"use client";

import { getWatchMissingRequirements } from "@/lib/gameRules";
import type { GameState } from "@/lib/gameTypes";

const seasonItems = [
  { id: "stars", label: "当前星星", target: 100 },
  { id: "checkInDays", label: "上线天数", target: 10 },
  { id: "englishStreakTasks", label: "英语不断线", target: 5 },
  { id: "baseResetTasks", label: "基地复位", target: 5 },
  { id: "completedMainNodes", label: "主线节点", target: 2 }
];

export function SeasonProgress({ state }: { state: GameState }) {
  const missing = getWatchMissingRequirements(state);
  const values: Record<string, number> = {
    stars: state.player.stars,
    checkInDays: state.progressStats.checkInDays,
    englishStreakTasks: state.progressStats.englishStreakTasks,
    baseResetTasks: state.progressStats.baseResetTasks,
    completedMainNodes: state.progressStats.completedMainNodes
  };

  return (
    <section className="rounded-[2rem] border-4 border-[#18324A] bg-white p-4 shadow-[0_8px_0_rgba(24,50,74,0.16)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-black text-[#FF9F2E]">7.5-7.24 赛季目标</p>
          <h2 className="text-2xl font-black">小天才 Z12 手表冲刺</h2>
        </div>
        <span className={`rounded-full border-4 border-[#18324A] px-4 py-2 text-sm font-black ${
          missing.length === 0 ? "bg-[#64C86B] text-white" : "bg-[#FFD84D] text-[#18324A]"
        }`}>
          {missing.length === 0 ? "赛季大奖已解锁" : `还差 ${missing.length} 项`}
        </span>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-5">
        {seasonItems.map((item) => {
          const current = values[item.id] ?? 0;
          const percent = Math.min(100, (current / item.target) * 100);
          return (
            <div key={item.id} className="rounded-2xl border-4 border-[#18324A] bg-[#FFF5D6] p-3">
              <p className="text-sm font-black">{item.label}</p>
              <p className="text-xl font-black text-[#1167D8]">
                {current}/{item.target}
              </p>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full bg-[#64C86B]" style={{ width: `${percent}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
