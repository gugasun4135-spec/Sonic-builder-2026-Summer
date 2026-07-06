import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { GameProvider } from "@/lib/useGame";

export const metadata: Metadata = {
  title: "振予 Builder Quest",
  description: "暑假任务闯关游戏"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <GameProvider>{children}</GameProvider>
      </body>
    </html>
  );
}
