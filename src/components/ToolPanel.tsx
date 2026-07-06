"use client";

import { useEffect, useMemo, useState } from "react";
import { useGame } from "@/lib/useGame";
import { useSound } from "@/lib/useSound";

const timerOptions = [180, 300, 600, 900];

export function ToolPanel() {
  const { state, dispatch } = useGame();
  const { play } = useSound();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!state.toolState.timerRunning) {
      return;
    }

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, [state.toolState.timerRunning]);

  const remaining = useMemo(() => {
    if (!state.toolState.timerRunning || !state.toolState.timerStartedAt) {
      return state.toolState.timerSeconds;
    }

    return Math.max(0, state.toolState.timerSeconds - Math.floor((now - state.toolState.timerStartedAt) / 1000));
  }, [now, state.toolState.timerRunning, state.toolState.timerSeconds, state.toolState.timerStartedAt]);

  useEffect(() => {
    if (state.toolState.timerRunning && remaining === 0) {
      dispatch({ type: "STOP_TIMER" });
      play("timerDone");
    }
  }, [dispatch, play, remaining, state.toolState.timerRunning]);

  return (
    <section className="quest-panel rounded-[2rem] p-4">
      <p className="text-sm font-black text-[#1167D8]">道具栏</p>
      <h2 className="mb-3 text-2xl font-black">先启动3分钟，不求一次做完</h2>
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-3xl border-4 border-[#18324A] bg-white p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-lg font-black">专注能量钟</p>
              <p className="text-4xl font-black text-[#1167D8]">
                {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (state.toolState.timerRunning) {
                  dispatch({ type: "STOP_TIMER" });
                } else {
                  dispatch({ type: "START_TIMER", seconds: state.toolState.timerSeconds });
                }
                play("button");
              }}
              className="rounded-2xl border-4 border-[#18324A] bg-[#64C86B] px-4 py-3 font-black text-white"
            >
              {state.toolState.timerRunning ? "暂停" : "开始"}
            </button>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {timerOptions.map((seconds) => (
              <button
                key={seconds}
                type="button"
                onClick={() => dispatch({ type: "START_TIMER", seconds })}
                className="rounded-2xl border-4 border-[#18324A] bg-[#FFD84D] px-2 py-2 text-sm font-black"
              >
                {seconds / 60}分
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3">
          <button
            type="button"
            onClick={() => {
              dispatch({ type: "TOGGLE_REVIVE_CARD" });
              play("revive");
            }}
            className="tap-card rounded-3xl border-4 border-[#18324A] bg-[#FFE3E3] p-4 text-left font-black"
          >
            复活卡
          </button>
          {state.toolState.reviveOpen ? (
            <ol className="rounded-3xl border-4 border-[#18324A] bg-white p-4 text-lg font-black">
              <li>1. 暂停3分钟</li>
              <li>2. 喝一口水</li>
              <li>3. 选一个最小任务</li>
              <li>4. 重新开局</li>
            </ol>
          ) : null}
          <button
            type="button"
            onClick={() => dispatch({ type: "TOGGLE_BREAKDOWN_CARD" })}
            className="tap-card rounded-3xl border-4 border-[#18324A] bg-[#DFF4FF] p-4 text-left font-black"
          >
            任务拆解卡
          </button>
          {state.toolState.breakdownOpen ? (
            <div className="rounded-3xl border-4 border-[#18324A] bg-white p-4 text-lg font-black">
              Level 0 拿出来 → Level 1 打开 → Level 2 做3个 → Level 3 做5个 → Level 4 完成标准任务
            </div>
          ) : null}
        </div>
      </div>
      <textarea
        value={state.toolState.battleReport}
        onChange={(event) => dispatch({ type: "SET_BATTLE_REPORT", text: event.target.value })}
        placeholder="今日战报卡：今天完成了什么？明天想先打哪一关？"
        className="mt-3 min-h-24 w-full rounded-3xl border-4 border-[#18324A] bg-white p-4 text-lg font-black"
      />
    </section>
  );
}
