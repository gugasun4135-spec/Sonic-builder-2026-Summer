"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useSound } from "@/lib/useSound";

const navItems = [
  { href: "/home", label: "基地", icon: "★" },
  { href: "/tasks", label: "任务", icon: "✓" },
  { href: "/rewards", label: "奖励", icon: "◆" },
  { href: "/monsters", label: "怪兽", icon: "⚔" },
  { href: "/map", label: "地图", icon: "⌾" }
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { play } = useSound();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pb-24 pt-4 sm:px-6">
      <div className="flex-1">{children}</div>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t-4 border-[#18324A] bg-[#FFF5D6]/95 px-2 py-2 shadow-[0_-8px_28px_rgba(24,50,74,0.18)] backdrop-blur">
        <div className="mx-auto grid max-w-5xl grid-cols-5 gap-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => play("button")}
                className={`flex min-h-16 flex-col items-center justify-center rounded-2xl border-2 text-center text-xs font-black ${
                  active ? "border-[#18324A] bg-[#1167D8] text-white" : "border-transparent text-[#18324A]"
                }`}
              >
                <span className="text-xl leading-none">{item.icon}</span>
                <span className="mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </main>
  );
}
