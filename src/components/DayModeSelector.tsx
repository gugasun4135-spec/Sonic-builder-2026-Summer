"use client";

import type { DayMode, GameState } from "@/lib/gameTypes";

const dayModes: Array<{ id: DayMode; label: string; title: string; text: string }> = [
  { id: "normal", label: "A", title: "普通闯关日", text: "今天可以正常打三关。" },
  { id: "training", label: "B", title: "训练闯关日", text: "今天任务减量，但游戏不断线。" },
  { id: "recovery", label: "C", title: "恢复闯关日", text: "完成一个最小动作，也算保持在线。" }
];

export function DayModeSelector({
  state,
  onSelect
}: {
  state: GameState;
  onSelect: (mode: DayMode) => void;
}) {
  return (
    <section className="quest-panel rounded-[2rem] p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-black text-[#1167D8]">今日模式</p>
          <h2 className="text-2xl font-black">训练日可以减量，但每天不断线</h2>
        </div>
        {state.settings.dayModeLocked ? (
          <span className="rounded-full border-4 border-[#18324A] bg-white px-3 py-2 text-sm font-black">
            家长已锁定
          </span>
        ) : null}
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {dayModes.map((mode) => {
          const active = state.settings.dayMode === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              disabled={state.settings.dayModeLocked}
              onClick={() => onSelect(mode.id)}
              className={`tap-card rounded-3xl border-4 p-3 text-left shadow-[0_6px_0_rgba(24,50,74,0.14)] ${
                active ? "border-[#18324A] bg-[#FFD84D]" : "border-[#18324A] bg-white"
              } ${state.settings.dayModeLocked ? "opacity-70" : ""}`}
            >
              <div className="flex items-center gap-2">
                <span className="flex size-10 items-center justify-center rounded-full border-4 border-[#18324A] bg-[#1167D8] text-xl font-black text-white">
                  {mode.label}
                </span>
                <span className="text-lg font-black">{mode.title}</span>
              </div>
              <p className="mt-2 text-sm font-black text-[#18324A]/75">{mode.text}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
