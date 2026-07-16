"use client";

import type { SyncStatus } from "@/lib/useGame";

export function SyncStatusBadge({ status, detailed = false }: { status: SyncStatus; detailed?: boolean }) {
  const online = status.source === "cloud" && status.online;
  const label = status.loading ? "正在同步" : online ? "云端已同步" : status.source === "cloud" ? "云端连接失败" : "本地数据";
  const time = status.lastSyncedAt ? new Date(status.lastSyncedAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }) : "暂无";

  return (
    <div
      className={`rounded-3xl border-4 border-[#18324A] px-4 py-3 font-black shadow-[0_6px_0_rgba(24,50,74,0.14)] ${
        online ? "bg-[#64C86B] text-white" : status.loading ? "bg-[#FFD84D] text-[#18324A]" : "bg-white text-[#18324A]"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className={`h-3 w-3 rounded-full ${online ? "bg-white" : status.loading ? "bg-[#1167D8]" : "bg-[#FF5A5A]"}`} />
        <span>{label}</span>
        <span className="text-sm opacity-80">来源：{status.source === "cloud" ? "云端" : "本地"}</span>
        <span className="text-sm opacity-80">最后：{time}</span>
      </div>
      {detailed && status.lastError ? <p className="mt-2 text-sm leading-relaxed opacity-80">错误：{status.lastError}</p> : null}
    </div>
  );
}
