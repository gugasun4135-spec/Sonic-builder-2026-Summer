"use client";

import { AppShell } from "@/components/AppShell";
import { DayModeSelector } from "@/components/DayModeSelector";
import { NpcGuide } from "@/components/NpcGuide";
import { TaskCard } from "@/components/TaskCard";
import { ToolPanel } from "@/components/ToolPanel";
import { useSound } from "@/lib/useSound";
import { useGame } from "@/lib/useGame";

export default function TasksPage() {
  const { state, dispatch } = useGame();
  const { play } = useSound();

  return (
    <AppShell>
      <section className="grid gap-4">
        <div className="blue-title rounded-[2rem] p-5">
          <p className="text-sm font-black text-[#FFD84D]">今日三关</p>
          <h1 className="text-3xl font-black sm:text-5xl">完成一关，怪兽掉血</h1>
          <p className="mt-2 text-lg font-black text-white/90">现在有 {state.player.stars} 颗星星</p>
        </div>
        <DayModeSelector state={state} onSelect={(mode) => dispatch({ type: "SET_DAY_MODE", mode })} />
        <NpcGuide state={state} scene="tasks" />
        <div className="grid gap-3 sm:grid-cols-2">
          {state.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onComplete={() => {
                dispatch({ type: "COMPLETE_TASK", taskId: task.id });
                play("taskComplete");
                play("starGain");
                play("monsterHit");
              }}
            />
          ))}
        </div>
        {state.dayCleared ? (
          <div className="rounded-[2rem] border-4 border-[#18324A] bg-[#64C86B] p-6 text-center text-3xl font-black text-white shadow-[0_8px_0_rgba(24,50,74,0.16)]">
            今日通关！
          </div>
        ) : null}
        <ToolPanel />
      </section>
    </AppShell>
  );
}
