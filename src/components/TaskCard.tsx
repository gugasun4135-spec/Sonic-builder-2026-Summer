"use client";

import type { Task } from "@/lib/gameTypes";

const taskColors = {
  focus: "bg-[#DFF4FF] border-[#1167D8]",
  english: "bg-[#DDF8DF] border-[#64C86B]",
  clean: "bg-[#FFF5D6] border-[#FF9F2E]",
  extra: "bg-[#FFE3E3] border-[#FF5A5A]"
};

export function TaskCard({
  task,
  onComplete
}: {
  task: Task;
  onComplete: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onComplete}
      disabled={task.completed}
      className={`tap-card min-h-28 w-full rounded-[1.75rem] border-4 p-4 text-left shadow-[0_8px_0_rgba(24,50,74,0.16)] ${
        task.completed ? "border-[#18324A] bg-[#64C86B] text-white" : taskColors[task.type]
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-2xl border-4 border-[#18324A] bg-white text-2xl">
            {task.completed ? "★" : "旗"}
          </span>
          <div>
            <p className="text-xl font-black sm:text-2xl">{task.completed ? "闯关成功" : task.title}</p>
            <p className={`mt-1 text-sm font-black ${task.completed ? "text-white/90" : "text-[#18324A]/70"}`}>
              {task.completed ? "星星已到账" : "点一下完成"}
            </p>
          </div>
        </div>
        <div className="rounded-2xl border-4 border-[#18324A] bg-[#FFD84D] px-4 py-3 text-center text-[#18324A] shadow">
          <div className="text-2xl font-black">+{task.stars}</div>
          <div className="text-xs font-bold">星星</div>
        </div>
      </div>
    </button>
  );
}
