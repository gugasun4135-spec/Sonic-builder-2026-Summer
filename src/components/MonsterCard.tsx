"use client";

import { monsterForms } from "@/lib/defaultState";
import type { Monster } from "@/lib/gameTypes";
import { withBasePath } from "@/lib/paths";
import { HpBar } from "./HpBar";

const monsterImages: Record<string, string> = {
  delay: withBasePath("/assets/monsters/delay.png?v=clean-20260706"),
  focus: withBasePath("/assets/monsters/focus.png?v=clean-20260706"),
  mess: withBasePath("/assets/monsters/mess.png?v=clean-20260706"),
  rush: withBasePath("/assets/monsters/rush.png?v=clean-20260706"),
  boss: withBasePath("/assets/monsters/boss.png?v=clean-20260706")
};

export function MonsterCard({ monster, locked = false }: { monster: Monster; locked?: boolean }) {
  return (
    <div
      className={`rounded-3xl border-2 p-4 shadow-soft ${
        monster.defeated
          ? "border-[#18324A] bg-[#DDF8DF]"
          : locked
            ? "border-slate-300 bg-slate-100 text-slate-400"
            : "border-[#18324A] bg-[#FFF5D6]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xl font-black">{monster.name}</p>
          <p className="mt-1 text-sm font-bold">
            {locked ? "Boss 未解锁" : monster.defeated ? "已击败" : `Lv.${monster.level} ${monsterForms[monster.level]}`}
          </p>
          <p className="mt-2 inline-flex rounded-full bg-white px-3 py-1 text-sm font-black text-[#18324A]">
            破解技能：{monster.skill}
          </p>
        </div>
        <div className="flex min-w-28 justify-center">
          <img
            src={monsterImages[monster.id] ?? withBasePath("/assets/monsters/delay.png")}
            alt={monster.name}
            className={`h-28 w-28 object-contain drop-shadow-xl ${monster.defeated ? "grayscale" : ""}`}
          />
        </div>
      </div>
      <div className="mt-4">
        <HpBar hp={monster.hp} maxHp={monster.maxHp} />
        <p className="mt-2 text-right text-sm font-black">
          {monster.hp}/{monster.maxHp}
        </p>
      </div>
    </div>
  );
}
