"use client";

import { canClaimReward, getWatchMissingRequirements } from "@/lib/gameRules";
import type { GameState, Reward } from "@/lib/gameTypes";

export function RewardCard({
  reward,
  state,
  stars,
  onClaim
}: {
  reward: Reward;
  state: GameState;
  stars: number;
  onClaim: () => void;
}) {
  const canClaim = canClaimReward(state, reward.id);
  const missing = reward.seasonPrize ? getWatchMissingRequirements(state) : [];

  return (
    <button
      type="button"
      onClick={() => {
        if (canClaim) {
          onClaim();
        } else if (reward.seasonPrize && missing.length > 0) {
          window.alert(`赛季大奖还差：${missing.map((item) => `${item.label}${item.current}/${item.target}`).join("，")}`);
        }
      }}
      className={`tap-card min-h-24 rounded-[1.75rem] border-4 p-4 text-left shadow-[0_8px_0_rgba(24,50,74,0.16)] ${
        reward.claimed
          ? "border-slate-400 bg-slate-100 text-slate-400"
          : canClaim
            ? "border-[#18324A] bg-[#FFD84D] text-[#18324A]"
            : "border-[#18324A] bg-white text-[#18324A]"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-lg font-black sm:text-xl">{reward.name}</p>
          <p className="mt-1 text-sm font-black">
            {reward.claimed ? "奖杯已拿" : canClaim ? "点我兑换" : reward.seasonPrize ? "赛季条件未完成" : "继续攒星星"}
          </p>
          {reward.seasonPrize && missing.length > 0 ? (
            <p className="mt-2 text-xs font-black text-[#18324A]/70">
              还差：{missing.map((item) => `${item.label}${item.current}/${item.target}`).join(" · ")}
            </p>
          ) : null}
        </div>
        <div className="rounded-2xl border-4 border-[#18324A] bg-white px-3 py-2 text-center text-[#18324A] shadow">
          <div className="text-xl font-black">{reward.cost}</div>
          <div className="text-xs font-bold">星</div>
        </div>
      </div>
    </button>
  );
}
