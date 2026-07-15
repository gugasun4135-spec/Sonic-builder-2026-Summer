"use client";

import { getNpcLine } from "@/lib/npcLines";
import type { GameState, HelperId, NpcScene, NpcState } from "@/lib/gameTypes";
import { withBasePath } from "@/lib/paths";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useSound } from "@/lib/useSound";
import { useGame } from "@/lib/useGame";

type NpcExpression = "happy" | "encourage" | "thinking" | "remind" | "celebrate";

const npcMeta: Record<HelperId, { name: string; title: string; badge: string; color: string }> = {
  screw: {
    name: "小螺丝",
    title: "行动教练",
    badge: "Coach Bolt",
    color: "blue"
  },
  nut: {
    name: "小螺母",
    title: "策略顾问",
    badge: "Coach Nut",
    color: "green"
  }
};

const actionLines = {
  screw: {
    start: "Builder，先做下一小步！",
    encourage: "你已经启动玩家模式了！星星正在路上！",
    next: "下一小步：打开任务卡，先做3分钟。"
  },
  nut: {
    choose: "建议先选最容易完成的一关。",
    breakdown: "拆成三步：打开、做3个、打钩。",
    recover: "现在进入复活流程：喝水，暂停，再选最小任务。"
  }
};

export function NpcGuide({
  state,
  scene,
  lineState,
  expression,
  compact = false
}: {
  state: GameState;
  scene: NpcScene;
  lineState?: NpcState;
  expression?: NpcExpression;
  compact?: boolean;
}) {
  const npc = state.player.selectedHelper;
  const [manualLine, setManualLine] = useState("");
  const { dispatch } = useGame();
  const { play } = useSound();
  const line = getNpcLine(scene, state, lineState);
  const meta = npcMeta[npc];
  const currentExpression = expression ?? expressionFromState(line.state);

  return (
    <section className={`npc-guide ${compact ? "npc-guide-compact" : ""}`}>
      <NpcAvatar npc={npc} expression={currentExpression} />
      <div className="npc-copy">
        <div className="npc-name-row">
          <span>{meta.name}</span>
          <small>{meta.title}</small>
        </div>
        <p className="npc-badge">{meta.badge}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {(["screw", "nut"] as HelperId[]).map((helper) => (
            <button
              key={helper}
              type="button"
              onClick={() => {
                dispatch({ type: "SELECT_HELPER", helper });
                play("npcAppear");
              }}
              className={`rounded-full border-4 border-[#18324A] px-3 py-1 text-sm font-black ${
                npc === helper ? "bg-[#FFD84D] text-[#18324A]" : "bg-white text-[#18324A]"
              }`}
            >
              {helper === "screw" ? "小螺丝" : "小螺母"}
            </button>
          ))}
        </div>
        <div className="npc-bubble">
          <span className="npc-bubble-tail" />
          <p>{manualLine || line.text}</p>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {npc === "screw" ? (
            <>
              <NpcActionButton onClick={() => { setManualLine(actionLines.screw.start); play("screwSpeak"); }}>帮我开始</NpcActionButton>
              <NpcActionButton onClick={() => { setManualLine(actionLines.screw.encourage); play("screwSpeak"); }}>给我打气</NpcActionButton>
              <NpcActionButton onClick={() => { setManualLine(actionLines.screw.next); play("screwSpeak"); }}>下一小步</NpcActionButton>
            </>
          ) : (
            <>
              <NpcActionButton onClick={() => { setManualLine(actionLines.nut.choose); play("nutSpeak"); }}>帮我选任务</NpcActionButton>
              <NpcActionButton onClick={() => { setManualLine(actionLines.nut.breakdown); play("nutSpeak"); }}>拆成小步骤</NpcActionButton>
              <NpcActionButton onClick={() => { setManualLine(actionLines.nut.recover); play("nutSpeak"); }}>我要复活</NpcActionButton>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function NpcActionButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="tap-card rounded-2xl border-4 border-[#18324A] bg-[#FFD84D] px-2 py-2 text-sm font-black text-[#18324A] shadow-[0_4px_0_rgba(24,50,74,0.14)]"
    >
      {children}
    </button>
  );
}

export function NpcDuoPanel() {
  return (
    <section className="grid gap-3 sm:grid-cols-2">
      <NpcRoleCard npc="screw" />
      <NpcRoleCard npc="nut" />
    </section>
  );
}

function NpcRoleCard({ npc }: { npc: HelperId }) {
  const meta = npcMeta[npc];

  return (
    <div className="rounded-[2rem] border-4 border-[#18324A] bg-white p-4 shadow-[0_8px_0_rgba(24,50,74,0.16)]">
      <div className="flex items-center gap-4">
        <NpcAvatar npc={npc} expression={npc === "screw" ? "encourage" : "thinking"} small />
        <div>
          <p className={npc === "screw" ? "text-2xl font-black text-[#1167D8]" : "text-2xl font-black text-[#0E8D84]"}>
            {meta.name}
          </p>
          <p className="text-sm font-black text-[#18324A]/70">{meta.badge}</p>
          <p className="mt-2 text-base font-black">{meta.title}</p>
        </div>
      </div>
    </div>
  );
}

function NpcAvatar({
  npc,
  expression,
  small = false
}: {
  npc: HelperId;
  expression: NpcExpression;
  small?: boolean;
}) {
  const isScrew = npc === "screw";
  const [imageFailed, setImageFailed] = useState(false);
  const src = isScrew
    ? withBasePath("/assets/npcs/screw-default.png?v=npc-20260715")
    : withBasePath("/assets/npcs/nut-default.png?v=npc-20260715");

  useEffect(() => {
    setImageFailed(false);
  }, [npc, src]);

  return (
    <div className={`npc-avatar-img-wrap ${small ? "npc-avatar-img-small" : ""} ${expression === "celebrate" ? "star-pop" : ""}`}>
      {imageFailed ? (
        <div className={`npc-avatar-fallback ${isScrew ? "npc-avatar-fallback-blue" : "npc-avatar-fallback-green"}`}>
          <span>{isScrew ? "小螺丝" : "小螺母"}</span>
        </div>
      ) : (
        <img
          key={`${npc}-${src}`}
          className="npc-avatar-img"
          src={src}
          alt={isScrew ? "小螺丝 Coach Bolt" : "小螺母 Coach Nut"}
          width={isScrew ? 432 : 431}
          height={520}
          decoding="async"
          loading={small ? "lazy" : "eager"}
          onError={() => setImageFailed(true)}
        />
      )}
    </div>
  );
}

function expressionFromState(state: NpcState): NpcExpression {
  if (state === "done") {
    return "celebrate";
  }

  if (state === "started" || state === "halfDone") {
    return "encourage";
  }

  if (state === "failed") {
    return "remind";
  }

  return "happy";
}
