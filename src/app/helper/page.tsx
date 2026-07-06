"use client";

import { AppShell } from "@/components/AppShell";
import { NpcDuoPanel } from "@/components/NpcGuide";
import { useSound } from "@/lib/useSound";
import { useGame } from "@/lib/useGame";
import type { HelperId } from "@/lib/gameTypes";

const helpers: Array<{ id: HelperId; name: string; style: string; line: string }> = [
  { id: "screw", name: "小螺丝", style: "鼓励型", line: "太棒了，先完成一个小任务！" },
  { id: "nut", name: "小螺母", style: "策略型", line: "先拿低难度星星，再冲奖励。" }
];

export default function HelperPage() {
  const { state, dispatch } = useGame();
  const { play } = useSound();

  return (
    <AppShell>
      <section className="grid gap-4">
        <div className="blue-title rounded-[2rem] p-5">
          <p className="text-sm font-black text-[#FFD84D]">小帮手</p>
          <h1 className="text-3xl font-black sm:text-5xl">选择今天的队友</h1>
        </div>
        <NpcDuoPanel />
        <div className="grid gap-4 sm:grid-cols-2">
          {helpers.map((helper) => {
            const selected = state.player.selectedHelper === helper.id;
            return (
              <button
                key={helper.id}
                type="button"
                onClick={() => {
                  dispatch({ type: "SELECT_HELPER", helper: helper.id });
                  play("npcAppear");
                }}
                className={`tap-card min-h-56 rounded-[2rem] border-4 p-6 text-left shadow-soft ${
                  selected ? "border-[#18324A] bg-[#FFD84D]" : "border-[#18324A] bg-white"
                }`}
              >
                <div className="text-6xl">{helper.id === "screw" ? "🔩" : "⬢"}</div>
                <p className="mt-4 text-3xl font-black">{helper.name}</p>
                <p className="mt-1 text-lg font-bold text-slate-600">{helper.style}</p>
                <p className="mt-4 rounded-3xl bg-white p-4 text-lg font-black text-slate-800">{helper.line}</p>
              </button>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}
