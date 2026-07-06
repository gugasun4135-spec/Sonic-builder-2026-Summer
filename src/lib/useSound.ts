"use client";

import { useCallback } from "react";
import { useGame } from "./useGame";

export type SoundType =
  | "button"
  | "taskComplete"
  | "starGain"
  | "rewardUnlocked"
  | "rewardClaimed"
  | "monsterHit"
  | "monsterDefeated"
  | "bossAppear"
  | "npcAppear"
  | "screwSpeak"
  | "nutSpeak"
  | "revive"
  | "timerDone";

const patterns: Record<SoundType, Array<[number, number, number]>> = {
  button: [[520, 0.035, 0.08]],
  taskComplete: [[660, 0.08, 0.1], [880, 0.1, 0.08]],
  starGain: [[900, 0.06, 0.08], [1180, 0.08, 0.07]],
  rewardUnlocked: [[740, 0.07, 0.08], [980, 0.08, 0.08], [1240, 0.09, 0.08]],
  rewardClaimed: [[520, 0.06, 0.08], [780, 0.08, 0.08], [1040, 0.12, 0.09]],
  monsterHit: [[190, 0.08, 0.12], [120, 0.08, 0.08]],
  monsterDefeated: [[480, 0.08, 0.09], [720, 0.09, 0.09], [960, 0.12, 0.09]],
  bossAppear: [[110, 0.18, 0.14], [180, 0.16, 0.12], [260, 0.18, 0.1]],
  npcAppear: [[600, 0.06, 0.06], [760, 0.08, 0.06]],
  screwSpeak: [[700, 0.045, 0.05], [920, 0.045, 0.05], [760, 0.045, 0.05]],
  nutSpeak: [[520, 0.055, 0.05], [640, 0.055, 0.05], [580, 0.055, 0.05]],
  revive: [[320, 0.09, 0.08], [540, 0.11, 0.08]],
  timerDone: [[880, 0.09, 0.08], [1100, 0.09, 0.08], [1320, 0.16, 0.08]]
};

export function useSound() {
  const { state } = useGame();

  const play = useCallback(
    (type: SoundType) => {
      if (!state.settings.soundEnabled || typeof window === "undefined") {
        return;
      }

      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) {
        return;
      }

      const audio = new AudioContextClass();
      let time = audio.currentTime;

      patterns[type].forEach(([frequency, duration, gain]) => {
        const osc = audio.createOscillator();
        const volume = audio.createGain();

        osc.type = type === "monsterHit" || type === "bossAppear" ? "sawtooth" : "sine";
        osc.frequency.setValueAtTime(frequency, time);
        volume.gain.setValueAtTime(0.001, time);
        volume.gain.exponentialRampToValueAtTime(gain, time + 0.01);
        volume.gain.exponentialRampToValueAtTime(0.001, time + duration);
        osc.connect(volume);
        volume.connect(audio.destination);
        osc.start(time);
        osc.stop(time + duration + 0.02);
        time += duration + 0.025;
      });

      window.setTimeout(() => {
        void audio.close();
      }, Math.max(250, (time - audio.currentTime) * 1000 + 80));
    },
    [state.settings.soundEnabled]
  );

  return { play, enabled: state.settings.soundEnabled };
}
