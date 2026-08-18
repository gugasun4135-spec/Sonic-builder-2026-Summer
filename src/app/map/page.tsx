"use client";

import { AppShell } from "@/components/AppShell";
import { NpcGuide } from "@/components/NpcGuide";
import { withBasePath } from "@/lib/paths";
import { useSound } from "@/lib/useSound";
import { useGame } from "@/lib/useGame";

const statusText = {
  locked: "未解锁",
  active: "进行中",
  submitted: "等待确认",
  done: "已完成",
  ongoing: "长期支线"
};

const statusClass = {
  locked: "bg-slate-100 border-slate-400 text-slate-500",
  active: "bg-[#FFD84D] border-[#18324A] text-[#18324A]",
  submitted: "bg-[#DFF4FF] border-[#1167D8] text-[#18324A]",
  done: "bg-[#64C86B] border-[#18324A] text-white",
  ongoing: "bg-[#FFF5D6] border-[#FF9F2E] text-[#18324A]"
};

const iconImage: Record<string, string> = {
  dolphin: withBasePath("/assets/map/dolphin.png"),
  base: withBasePath("/assets/map/base.png"),
  island: withBasePath("/assets/map/island.png"),
  robot: withBasePath("/assets/map/robot.png"),
  taekwondo: withBasePath("/assets/map/taekwondo.png"),
  golf: withBasePath("/assets/map/golf.png"),
  beijing: withBasePath("/assets/map/beijing.png"),
  brush: withBasePath("/assets/map/brush.png")
};

export default function MapPage() {
  const { state, dispatch } = useGame();
  const { play } = useSound();
  const mainNodes = state.map.filter((node) => !node.sideQuest).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const sideQuests = state.map.filter((node) => node.sideQuest);

  return (
    <AppShell>
      <section className="grid gap-5">
        <div className="blue-title rounded-[2rem] p-5">
          <p className="text-sm font-black text-[#FFD84D]">SUMMER QUEST MAP</p>
          <h1 className="text-3xl font-black sm:text-5xl">振予的暑假闯关路线</h1>
          <p className="mt-2 text-lg font-black text-white/90">从海豚闪电杯出发，一站一站解锁冒险。</p>
        </div>
        <NpcGuide state={state} scene="map" compact />

        <div className="quest-panel rounded-[2rem] p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="rounded-full border-4 border-[#18324A] bg-[#64C86B] px-5 py-2 text-lg font-black text-white">
              START
            </span>
            <span className="rounded-full border-4 border-[#18324A] bg-white px-4 py-2 text-sm font-black text-[#18324A]">
              主线 6 站
            </span>
          </div>

          <div className="relative grid gap-3">
            <div className="absolute left-8 top-6 hidden h-[calc(100%-3rem)] w-3 rounded-full bg-[#64C86B] sm:block" />
            {mainNodes.map((node) => (
              <div key={node.id} className="relative grid gap-3 sm:grid-cols-[8rem_1fr] sm:items-center">
                <div className="z-10 flex min-h-28 items-center justify-center rounded-[1.5rem] border-4 border-[#18324A] bg-white p-2 shadow-[0_6px_0_rgba(24,50,74,0.18)]">
                  <img
                    src={iconImage[node.icon] ?? withBasePath("/assets/map/base.png")}
                    alt={node.name}
                    className="h-24 w-full object-contain drop-shadow-lg"
                  />
                </div>
                <div className={`rounded-[1.75rem] border-4 p-4 shadow-[0_8px_0_rgba(24,50,74,0.16)] ${statusClass[node.status]}`}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-black">第{node.order}站</p>
                      <h2 className="text-2xl font-black">{node.name}</h2>
                      <p className="mt-1 text-base font-black opacity-80">{node.subtitle}</p>
                    </div>
                    <span className="w-fit rounded-full border-4 border-[#18324A] bg-white px-4 py-2 text-sm font-black text-[#18324A]">
                      {statusText[node.status]}
                    </span>
                  </div>
                  {node.status === "active" ? (
                    <button
                      type="button"
                      onClick={() => {
                        dispatch({ type: "SUBMIT_MAP_NODE", nodeId: node.id });
                        play("starGain");
                      }}
                      className="mt-3 rounded-2xl border-4 border-[#18324A] bg-[#FF9F2E] px-4 py-3 text-lg font-black text-white"
                    >
                      我完成了！
                    </button>
                  ) : null}
                  {node.status === "submitted" ? (
                    <p className="mt-3 rounded-2xl border-4 border-[#18324A] bg-white px-4 py-3 text-base font-black text-[#18324A]">
                      已提交完成，等待家长确认
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-end">
            <span className="rounded-full border-4 border-[#18324A] bg-[#FF9F2E] px-5 py-2 text-lg font-black text-white">
              FINISH
            </span>
          </div>
        </div>

        <div className="grid gap-3">
          {sideQuests.map((node) => (
            <div key={node.id} className={`rounded-[2rem] border-4 p-5 shadow-[0_8px_0_rgba(24,50,74,0.16)] ${statusClass[node.status]}`}>
              <div className="flex items-center gap-4">
                <div className="flex size-24 items-center justify-center rounded-[1.5rem] border-4 border-[#18324A] bg-white p-2">
                  <img
                    src={iconImage[node.icon] ?? withBasePath("/assets/map/brush.png")}
                    alt={node.name}
                    className="h-20 w-full object-contain drop-shadow-lg"
                  />
                </div>
                <div>
                  <p className="text-sm font-black">{statusText[node.status]}</p>
                  <h2 className="text-2xl font-black">{node.name}</h2>
                  <p className="mt-1 text-base font-black opacity-80">{node.subtitle}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
