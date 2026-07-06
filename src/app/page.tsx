import { withBasePath } from "@/lib/paths";

export default function Page() {
  const homePath = withBasePath("/home/");

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="quest-panel rounded-[2rem] p-6 text-center">
        <p className="text-sm font-black text-[#1167D8]">振予 Builder Quest</p>
        <h1 className="mt-2 text-3xl font-black">正在进入暑假闯关基地</h1>
        <a
          className="mt-5 inline-flex rounded-3xl border-4 border-[#18324A] bg-[#FF9F2E] px-6 py-4 text-xl font-black text-white"
          href={homePath}
        >
          进入游戏
        </a>
      </div>
      <meta httpEquiv="refresh" content={`0;url=${homePath}`} />
    </main>
  );
}
