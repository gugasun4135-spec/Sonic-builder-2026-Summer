"use client";

import { AppShell } from "@/components/AppShell";
import { NpcGuide } from "@/components/NpcGuide";
import { RewardCard } from "@/components/RewardCard";
import { SeasonProgress } from "@/components/SeasonProgress";
import { useSound } from "@/lib/useSound";
import { useGame } from "@/lib/useGame";

export default function RewardsPage() {
  const { state, dispatch } = useGame();
  const { play } = useSound();

  return (
    <AppShell>
      <section className="grid gap-4">
        <div className="blue-title rounded-[2rem] p-5">
          <p className="text-sm font-black text-[#FFD84D]">奖励商店</p>
          <h1 className="text-3xl font-black sm:text-5xl">星星兑换奖杯</h1>
          <p className="mt-2 text-lg font-black text-white/90">你有 {state.player.stars} 颗星星</p>
        </div>
        <NpcGuide state={state} scene="rewards" />
        <SeasonProgress state={state} />
        <div className="grid gap-3 sm:grid-cols-2">
          {state.rewards.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              state={state}
              stars={state.player.stars}
              onClaim={() => {
                dispatch({ type: "CLAIM_REWARD", rewardId: reward.id });
                play("rewardClaimed");
              }}
            />
          ))}
        </div>
      </section>
    </AppShell>
  );
}
