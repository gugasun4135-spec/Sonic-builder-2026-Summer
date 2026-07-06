"use client";

import { AppShell } from "@/components/AppShell";

export default function GuidePage() {
  return (
    <AppShell>
      <section className="grid gap-4">
        <div className="blue-title rounded-[2rem] p-5">
          <p className="text-sm font-black text-[#FFD84D]">游戏说明</p>
          <h1 className="text-3xl font-black sm:text-5xl">就四步</h1>
        </div>
        {["做任务", "拿星星", "打怪兽", "换奖励"].map((item, index) => (
          <div key={item} className="rounded-[2rem] border-4 border-[#18324A] bg-[#FFF5D6] p-6 text-3xl font-black shadow-[0_8px_0_rgba(24,50,74,0.16)]">
            {index + 1}. {item}
          </div>
        ))}
      </section>
    </AppShell>
  );
}
